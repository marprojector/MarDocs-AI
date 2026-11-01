import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { DocumentSchema, CreateDocumentSchema } from '@/lib/document-validation';
import { buildDocumentObjectKey, putObject, deleteObjectByUrl } from '@/lib/storage';
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

    // Upload to Supabase Storage
    const objectKey = buildDocumentObjectKey(session.user.id, file.name);
    const uploaded = await putObject(objectKey, await file.arrayBuffer(), file.type);

    // Create document record
    const documentData = {
      title: title || file.name.replace(/\.[^/.]+$/, ''),
      description: description || undefined,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      fileUrl: uploaded.fileUrl,
      status: 'PENDING' as const,
    };

    const validation = CreateDocumentSchema.safeParse(documentData);

    if (!validation.success) {
      // Delete uploaded object if validation fails
      await deleteObjectByUrl(uploaded.fileUrl);
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

    if (error instanceof Error && error.message.includes('Supabase Storage is not configured')) {
      return Response.json({ error: 'File storage is not configured' }, { status: 500 });
    }

    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
