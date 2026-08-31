import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    const [documentCount, indexedCount, conversationCount, messageCount, recentDocuments, recentConversations] =
      await Promise.all([
        prisma.document.count({ where: { userId } }),
        prisma.document.count({ where: { userId, isIndexed: true } }),
        prisma.conversation.count({ where: { userId } }),
        prisma.message.count({ where: { conversation: { userId } } }),
        prisma.document.findMany({
          where: { userId },
          orderBy: { updatedAt: 'desc' },
          take: 5,
          select: {
            id: true,
            title: true,
            fileName: true,
            fileType: true,
            status: true,
            isIndexed: true,
            createdAt: true,
            updatedAt: true,
          },
        }),
        prisma.conversation.findMany({
          where: { userId },
          orderBy: { updatedAt: 'desc' },
          take: 4,
          select: {
            id: true,
            title: true,
            createdAt: true,
            updatedAt: true,
            documentId: true,
            document: {
              select: {
                id: true,
                title: true,
              },
            },
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
              select: {
                role: true,
                content: true,
                createdAt: true,
              },
            },
          },
        }),
      ]);

    return Response.json({
      stats: {
        documentCount,
        indexedCount,
        conversationCount,
        messageCount,
      },
      recentDocuments,
      recentConversations,
    });
  } catch (error) {
    console.error('[DASHBOARD_GET]', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
