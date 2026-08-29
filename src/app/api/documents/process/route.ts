import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { get } from '@vercel/blob';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { id } = body;

  if (!id) {
    return Response.json({ error: 'Document ID is required' }, { status: 400 });
  }

  const document = await prisma.document.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!document) {
    return Response.json({ error: 'Document not found' }, { status: 404 });
  }

  if (document.status === 'PROCESSING') {
    return Response.json({ error: 'Document is already being processed' }, { status: 400 });
  }

  if (document.status === 'COMPLETED') {
    return Response.json({ error: 'Document has already been processed' }, { status: 400 });
  }

  await prisma.document.update({
    where: { id },
    data: { status: 'PROCESSING' },
  });

  try {
    const blobData = await get(document.fileUrl, { access: 'private' });
    if (!blobData || blobData.statusCode !== 200 || !blobData.stream) {
      throw new Error('File not found');
    }

    // Convert stream to buffer for text extraction
    const chunks: Uint8Array[] = [];
    const reader = blobData.stream.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) chunks.push(value);
    }
    const concatenated = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
    let offset = 0;
    for (const chunk of chunks) {
      concatenated.set(chunk, offset);
      offset += chunk.length;
    }
    const buffer = Buffer.from(concatenated);
    const fileType = document.fileType;

    let extractedText: string;

    // Text extraction implementation
    if (fileType === 'text/plain') {
      extractedText = buffer.toString('utf-8');
    } else if (fileType === 'application/pdf') {
      // PDF extraction
      const { PDFParse } = await import('pdf-parse');
      const pdf = new PDFParse({ data: buffer });
      const result = await pdf.getText();
      extractedText = result.text;
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      // DOCX extraction using mammoth
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({ buffer: buffer });
      extractedText = result.value;
    } else {
      throw new Error(`Unsupported file type: ${fileType}`);
    }

    await prisma.document.update({
      where: { id },
      data: {
        extractedText,
        status: 'COMPLETED',
        processedAt: new Date(),
      },
    });

    return Response.json({ message: 'Processing completed', status: 'COMPLETED' });
  } catch (error) {
    // Log the full error for debugging
    console.error('[DOCX_PROCESSING_ERROR]', error);
    
    await prisma.document.update({
      where: { id },
      data: {
        status: 'FAILED',
        processingError: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    return Response.json({ error: 'Processing failed', status: 'FAILED' }, { status: 500 });
  }
}
