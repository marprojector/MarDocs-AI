import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { DocumentSchema } from '@/lib/document-validation';
import { del } from '@vercel/blob';
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

    const result = DocumentSchema.parse(document);

    return Response.json(result);
  } catch (error) {
    console.error('[DOCUMENT_GET]', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { title, description } = body;

    if (title === undefined && description === undefined) {
      return Response.json({ error: 'No data to update' }, { status: 400 });
    }

    const document = await prisma.document.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!document) {
      return Response.json({ error: 'Document not found' }, { status: 404 });
    }

    const updatedDocument = await prisma.document.update({
      where: { id },
      data: {
        title,
        description,
      },
    });

    const result = DocumentSchema.parse(updatedDocument);

    return Response.json(result);
  } catch (error) {
    console.error('[DOCUMENT_PUT]', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
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
      if (document.fileUrl) {
        await del(document.fileUrl);
      }
    } catch (blobError) {
      console.error('[BLOB_DELETE]', blobError);
    }

    await prisma.document.delete({
      where: { id },
    });

    return Response.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('[DOCUMENT_DELETE]', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
