import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
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
    const response = await fetch(document.fileUrl);
    if (!response.ok) {
      throw new Error('Failed to download file');
    }
    const arrayBuffer = await response.arrayBuffer();
    const fileType = document.fileType;

    let extractedText: string;
    if (fileType === 'application/pdf') {
      extractedText = 'PDF extraction placeholder';
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      extractedText = 'DOCX extraction placeholder';
    } else if (fileType === 'text/plain') {
      extractedText = new TextDecoder().decode(arrayBuffer);
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
