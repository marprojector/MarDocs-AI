import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { get } from '@vercel/blob';
import { extractRawText } from 'mammoth';
import { NextRequest } from 'next/server';
import { chunkText } from '@/lib/chunking';
import { generateEmbeddings, EmbeddingError } from '@/lib/embedding';

// Configure pdfjs-dist for Node.js environment
import * as pdfjs from 'pdfjs-dist';
// Set worker src to use the built-in worker that comes with pdfjs-dist
if (typeof pdfjs.GlobalWorkerOptions !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url).toString();
}

// Increase timeout for embedding generation (large documents)
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { id } = body;

  if (!id) {
    return Response.json({ error: 'Document ID is required' }, { status: 400 });
  }

  const document = await prisma.document.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!document) {
    return Response.json({ error: 'Document not found' }, { status: 404 });
  }

  if (document.status === 'PROCESSING') {
    return Response.json({ error: 'Document is already being processed' }, { status: 400 });
  }

  if (document.status === 'COMPLETED') {
    return Response.json({ error: 'Document has already been processed' }, { status: 400 });
  }

  await prisma.document.update({
    where: { id },
    data: { status: 'PROCESSING' },
  });

  try {
    const blobData = await get(document.fileUrl, { access: 'private' });
    if (!blobData || blobData.statusCode !== 200 || !blobData.stream) {
      throw new Error('File not found');
    }

    // Convert stream to buffer for text extraction
    const chunks: Uint8Array[] = [];
    const reader = blobData.stream.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) chunks.push(value);
    }
    const concatenated = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
    let offset = 0;
    for (const chunk of chunks) {
      concatenated.set(chunk, offset);
      offset += chunk.length;
    }
    const buffer = Buffer.from(concatenated);
    const fileType = document.fileType;

    let extractedText: string;

    // Text extraction implementation
    if (fileType === 'text/plain') {
      extractedText = buffer.toString('utf-8');
    } else if (fileType === 'application/pdf') {
      // PDF extraction using pdfjs-dist (Node.js compatible)
      // pdfjs-dist requires Uint8Array, not Buffer
      const data = new Uint8Array(buffer);
      const loadingTask = pdfjs.getDocument({ data });
      const pdf = await loadingTask.promise;
      const pages: string[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item) => (item as { str: string }).str)
          .join(' ');
        pages.push(pageText);
      }
      extractedText = pages.join('\n\n');
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      // DOCX extraction using mammoth
      const result = await extractRawText({ buffer: buffer });
      extractedText = result.value;
    } else {
      throw new Error(`Unsupported file type: ${fileType}`);
    }

    await prisma.document.update({
      where: { id },
      data: {
        extractedText,
        status: 'COMPLETED',
        processedAt: new Date(),
      },
    });

    // ========================================
    // RAG INDEXING: Chunk and embed document
    // ========================================
    let ragIndexingSuccess = false;
    let ragIndexingError: string | null = null;

    try {
      // Validate extracted text is non-empty
      if (!extractedText || extractedText.trim().length === 0) {
        throw new Error('Extracted text is empty, cannot create chunks');
      }

      console.log('[RAG_INDEXING] Starting for document:', id);
      
      // Step 1: Chunk the text
      const documentChunks = chunkText(extractedText);
      
      if (documentChunks.length === 0) {
        throw new Error('No chunks generated from extracted text');
      }

      console.log('[RAG_INDEXING] Generated', documentChunks.length, 'chunks');

      // Step 2: Generate embeddings for all chunks
      const chunkTexts = documentChunks.map(chunk => chunk.content);
      const embeddings = await generateEmbeddings(chunkTexts);

      // Validate embeddings
      if (embeddings.length !== documentChunks.length) {
        throw new Error(`Embedding count mismatch: ${embeddings.length} !== ${documentChunks.length}`);
      }

      // Validate all embeddings are 1024 dimensions
      for (let i = 0; i < embeddings.length; i++) {
        if (embeddings[i].length !== 1024) {
          throw new Error(`Invalid embedding dimension at index ${i}: ${embeddings[i].length} (expected 1024)`);
        }
      }

      console.log('[RAG_INDEXING] Generated', embeddings.length, 'embeddings');

      await prisma.$transaction(async (tx) => {
        await tx.$executeRaw`
          DELETE FROM "DocumentChunk"
          WHERE "documentId" = ${id} AND "userId" = ${session.user!.id}
        `;

        for (const [index, chunk] of documentChunks.entries()) {
          const embeddingStr = `[${embeddings[index].join(',')}]`;

          await tx.$executeRaw`
            INSERT INTO "DocumentChunk" (
              "id",
              "documentId",
              "userId",
              "content",
              "embedding",
              "chunkIndex",
              "tokenCount",
              "pageNumber",
              "startChar",
              "endChar",
              "metadata",
              "createdAt"
            ) VALUES (
              gen_random_uuid(),
              ${id},
              ${session.user!.id},
              ${chunk.content},
              ${embeddingStr}::vector,
              ${chunk.chunkIndex},
              ${chunk.tokenCount},
              ${chunk.pageNumber},
              ${chunk.startChar},
              ${chunk.endChar},
              ${chunk.pageNumber ? JSON.stringify({ pageNumber: chunk.pageNumber }) : null}::jsonb,
              NOW()
            )
          `;
        }

        await tx.document.update({
          where: { id },
          data: {
            isIndexed: true,
            indexedAt: new Date(),
            indexingError: null,
          },
        });
      });

      console.log('[RAG_INDEXING] Stored', documentChunks.length, 'chunks in database');
      console.log('[RAG_INDEXING] Document successfully indexed');
      ragIndexingSuccess = true;

    } catch (error) {
      console.error('[RAG_INDEXING_ERROR]', error);
      
      // Determine safe error message (don't expose API keys)
      if (error instanceof EmbeddingError) {
        ragIndexingError = 'Embedding generation failed. Please try reprocessing.';
      } else if (error instanceof Error && error.message.includes('empty')) {
        ragIndexingError = 'No usable text was available for indexing';
      } else if (error instanceof Error && error.message.includes('chunks')) {
        ragIndexingError = 'No document chunks were generated';
      } else {
        ragIndexingError = 'RAG indexing failed. Please try reprocessing.';
      }

      // Update document with indexing error (but keep document as COMPLETED)
      await prisma.document.update({
        where: { id },
        data: {
          isIndexed: false,
          indexingError: ragIndexingError,
        },
      });

      console.log('[RAG_INDEXING] Failed, but document text preserved');
    }

    return Response.json({ 
      message: 'Processing completed', 
      status: 'COMPLETED',
      indexed: ragIndexingSuccess,
      indexingError: ragIndexingError,
    });
  } catch (error) {
    // Log the full error for debugging
    console.error('[DOCX_PROCESSING_ERROR]', error);
    
    await prisma.document.update({
      where: { id },
      data: {
        status: 'FAILED',
        processingError: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    return Response.json({ error: 'Processing failed', status: 'FAILED' }, { status: 500 });
  }
}
