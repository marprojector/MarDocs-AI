import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getObject, objectKeyFromFileUrl } from '@/lib/storage';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const document = await prisma.document.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!document) {
      return Response.json({ error: 'Document not found' }, { status: 404 });
    }

    const objectKey = objectKeyFromFileUrl(document.fileUrl);

    if (!objectKey) {
      return Response.json(
        { error: 'This file is stored on a legacy storage backend and is no longer available' },
        { status: 410 }
      );
    }

    try {
      const object = await getObject(objectKey);
      if (!object) {
        return Response.json({ error: 'File not found' }, { status: 404 });
      }

      const contentType = document.fileType || 'application/octet-stream';
      const fileName = document.fileName || 'document';

      const headers = new Headers();
      headers.set('Content-Type', contentType);
      headers.set('Content-Disposition', `inline; filename="${fileName.replace(/"/g, '')}"`);
      headers.set('Cache-Control', 'private, no-store');
      headers.set('X-Content-Type-Options', 'nosniff');

      return new Response(object.body, {
        status: 200,
        headers,
      });
    } catch (storageError) {
      console.error('[SUPABASE_STORAGE_GET]', storageError);
      return Response.json({ error: 'Failed to retrieve file' }, { status: 500 });
    }
  } catch (error) {
    console.error('[DOCUMENT_FILE_GET]', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
