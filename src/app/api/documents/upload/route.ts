import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { DocumentSchema, CreateDocumentSchema } from '@/lib/document-validation';
import { put, del } from '@vercel/blob';
import { NextRequest } from 'next/server';

// Allowed file types for upload
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
  'text/plain',
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;

    // Validate file exists
    if (!file) {
      return Response.json({ error: 'File is required' }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return Response.json(
        { error: 'Invalid file type. Allowed: PDF, DOCX, TXT' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return Response.json(
        { error: `File size exceeds 50MB limit. Current: ${(file.size / (1024 * 1024)).toFixed(2)}MB` },
        { status: 400 }
      );
    }

    // Read file buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to Vercel Blob
    const blob = await put(`documents/${session.user.id}/${Date.now()}-${file.name}`, buffer, {
      access: 'private',
    });

    // Create document record
    const documentData = {
      title: title || file.name.replace(/\.[^/.]+$/, ''),
      description: description || undefined,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      fileUrl: blob.url,
      status: 'PENDING' as const,
    };

    const validation = CreateDocumentSchema.safeParse(documentData);

    if (!validation.success) {
      // Delete uploaded file if validation fails
      await del(blob.url);
      return Response.json(
        { error: 'Invalid document data', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const document = await prisma.document.create({
      data: {
        ...validation.data,
        userId: session.user.id,
      },
    });

    const result = DocumentSchema.parse(document);

    return Response.json(result);
  } catch (error) {
    console.error('[UPLOAD_POST]', error);
    
    // Check if it's a Vercel Blob error
    const isBlobError = error && typeof error === 'object' && 'name' in error && error.name === 'BlobError';
    
    // Return 500 for Blob errors or other server errors
    if (isBlobError) {
      return Response.json({ error: 'Failed to upload to storage' }, { status: 500 });
    }
    
    // If it's a validation error from Zod, return it
    if (error instanceof Error && 'flatten' in error) {
      return Response.json({ error: 'Validation failed' }, { status: 400 });
    }
    
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
