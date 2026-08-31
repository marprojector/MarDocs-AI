import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const favorites = await prisma.favorite.findMany({
      where: {
        userId: session.user.id,
        documentId: { not: null },
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        document: {
          select: {
            id: true,
            title: true,
            description: true,
            fileName: true,
            fileType: true,
            fileSize: true,
            status: true,
            isIndexed: true,
            createdAt: true,
          },
        },
      },
    });

    // Filter out any favorites whose document was deleted
    const validFavorites = favorites.filter((f) => f.document !== null);

    return Response.json({ favorites: validFavorites });
  } catch (error) {
    console.error('[FAVORITES_GET]', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { documentId } = body;

    if (!documentId || typeof documentId !== 'string') {
      return Response.json({ error: 'documentId is required' }, { status: 400 });
    }

    // Validate document ownership
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        userId: session.user.id,
      },
    });

    if (!document) {
      return Response.json({ error: 'Document not found' }, { status: 404 });
    }

    // Toggle: remove if exists, add if not
    const existing = await prisma.favorite.findFirst({
      where: {
        userId: session.user.id,
        documentId,
        conversationId: null,
      },
    });

    if (existing) {
      await prisma.favorite.delete({
        where: { id: existing.id },
      });
      return Response.json({ favorited: false });
    }

    await prisma.favorite.create({
      data: {
        userId: session.user.id,
        documentId,
        conversationId: null,
      },
    });

    return Response.json({ favorited: true });
  } catch (error) {
    console.error('[FAVORITES_POST]', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
