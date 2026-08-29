import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
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

    const { id: documentId } = await params;
    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get('messageId');

    if (!messageId) {
      return Response.json({ error: 'messageId is required' }, { status: 400 });
    }

    // Validate document exists and user owns it
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        userId: session.user.id,
      },
    });

    if (!document) {
      return Response.json({ error: 'Document not found' }, { status: 404 });
    }

    // Validate message belongs to a conversation associated with this document
    const message = await prisma.message.findFirst({
      where: {
        id: messageId,
        conversation: {
          documentId: documentId,
          userId: session.user.id,
        },
      },
    });

    if (!message) {
      return Response.json({ error: 'Message not found' }, { status: 404 });
    }

    // Fetch citations for this message
    const citations = await prisma.citation.findMany({
      where: {
        messageId: messageId,
        documentId: documentId,
      },
      include: {
        document: {
          select: {
            id: true,
            title: true,
            fileName: true,
            fileType: true,
          },
        },
      },
      orderBy: {
        relevanceScore: 'desc',
      },
    });

    // Transform citations to exclude sensitive data
    const safeCitations = citations.map((citation) => ({
      id: citation.id,
      pageNumber: citation.pageNumber,
      sectionTitle: citation.sectionTitle,
      contentPreview: citation.contentPreview,
      relevanceScore: citation.relevanceScore,
      document: {
        id: citation.document.id,
        title: citation.document.title,
        fileName: citation.document.fileName,
        fileType: citation.document.fileType,
      },
    }));

    return Response.json({ citations: safeCitations });
  } catch (error) {
    console.error('[CITATIONS_GET]', error);
    return Response.json(
      { error: 'Failed to fetch citations' },
      { status: 500 }
    );
  }
}
