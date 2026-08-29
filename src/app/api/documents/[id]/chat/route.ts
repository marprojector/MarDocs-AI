import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { NextRequest } from 'next/server';

type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export const maxDuration = 30;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: documentId } = await params;
    const body = await request.json();
    const { message, conversationId } = body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return Response.json({ error: 'Message is required' }, { status: 400 });
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

    // Verify document has been successfully processed
    if (document.status !== 'COMPLETED') {
      return Response.json(
        { error: 'Document is not ready for chat' },
        { status: 400 }
      );
    }

    if (!document.extractedText || document.extractedText.trim().length === 0) {
      return Response.json(
        { error: 'Document has no extracted text' },
        { status: 400 }
      );
    }

    // Get or create conversation
    let conversation;
    if (conversationId) {
      // Validate existing conversation belongs to user and document
      conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          userId: session.user.id,
          documentId: documentId,
        },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
            take: 10, // Load last 10 messages for context
          },
        },
      });

      if (!conversation) {
        return Response.json(
          { error: 'Conversation not found' },
          { status: 404 }
        );
      }
    } else {
      // Create new conversation
      conversation = await prisma.conversation.create({
        data: {
          userId: session.user.id,
          documentId: documentId,
          title: message.substring(0, 100), // Use first message as title
        },
        include: {
          messages: true,
        },
      });
    }

    // Save user message
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        userId: session.user.id,
        role: 'USER',
        content: message,
      },
    });

    // Build context messages for AI
    const contextMessages: Message[] = [];

    // Add previous messages from conversation for context
    if (conversation.messages.length > 0) {
      for (const msg of conversation.messages) {
        contextMessages.push({
          role: msg.role.toLowerCase() as 'user' | 'assistant' | 'system',
          content: msg.content,
        });
      }
    }

    // Add current user message
    contextMessages.push({
      role: 'user',
      content: message,
    });

    // System prompt with document context
    const systemPrompt = `You are a helpful AI assistant that answers questions about the provided document. 

Document Title: ${document.title}
${document.description ? `Document Description: ${document.description}` : ''}

Document Content:
${document.extractedText}

Instructions:
- Answer questions based solely on the document content provided above.
- If the answer is not in the document, clearly state that.
- Be concise and accurate.
- Quote relevant parts of the document when appropriate.`;

    // Configure OpenRouter
    const openrouter = createOpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: 'https://openrouter.ai/api/v1',
    });

    const model = process.env.OPENROUTER_MODEL || 'openrouter/free';

    // Stream AI response
    const result = streamText({
      model: openrouter(model),
      system: systemPrompt,
      messages: contextMessages,
      async onFinish({ text, usage }) {
        // Save assistant response
        const assistantMessage = await prisma.message.create({
          data: {
            conversationId: conversation.id,
            role: 'ASSISTANT',
            content: text,
            tokensUsed: usage.totalTokens,
          },
        });

        // Create a basic citation linking the response to the document
        await prisma.citation.create({
          data: {
            messageId: assistantMessage.id,
            documentId: documentId,
            userId: session.user?.id,
            contentPreview: document.extractedText?.substring(0, 200),
          },
        });
      },
    });

    return result.toTextStreamResponse({
      headers: {
        'X-Conversation-Id': conversation.id,
      },
    });
  } catch (error) {
    console.error('[CHAT_ERROR]', error);
    
    // Don't leak internal error details
    if (error instanceof Error && error.message.includes('API key')) {
      return Response.json(
        { error: 'AI service configuration error' },
        { status: 500 }
      );
    }

    return Response.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}
