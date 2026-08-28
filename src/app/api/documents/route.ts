import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { DocumentSchema } from '@/lib/document-validation';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const documents = await prisma.document.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const result = DocumentSchema.array().parse(documents);

    return Response.json(result);
  } catch (error) {
    console.error('[DOCUMENTS_GET]', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
