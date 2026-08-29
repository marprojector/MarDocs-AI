import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { get } from '@vercel/blob';
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

    try {
      const blobData = await get(document.fileUrl, { access: 'private' });
      if (!blobData) {
        throw new Error('File not found');
      }
      const contentType = document.fileType || 'application/octet-stream';
      const fileName = document.fileName || 'document';

      const headers = new Headers();
      headers.set('Content-Type', contentType);
      headers.set('Content-Disposition', `inline; filename="${fileName}"`);
      headers.set('Cache-Control', 'no-store');
      headers.set('X-Content-Type-Options', 'nosniff');

      return new Response(blobData.stream, {
        status: 200,
        headers,
      });
    } catch (blobError) {
      console.error('[BLOB_GET]', blobError);
      return Response.json({ error: 'Failed to retrieve file' }, { status: 500 });
    }
  } catch (error) {
    console.error('[DOCUMENT_FILE_GET]', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
