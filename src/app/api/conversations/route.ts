import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 50,
      include: {
        document: {
          select: {
            id: true,
            title: true,
            fileName: true,
            fileType: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
          select: {
            role: true,
            content: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
    });

    return Response.json({ conversations });
  } catch (error) {
    console.error('[CONVERSATIONS_LIST]', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
