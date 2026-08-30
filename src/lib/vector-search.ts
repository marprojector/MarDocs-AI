/**
 * Vector similarity search utility for RAG implementation
 * 
 * Performs semantic search on DocumentChunk embeddings using pgvector.
 * Uses Prisma's $queryRaw for direct SQL access to vector operations.
 */

import { prisma } from './prisma';

export interface SearchResult {
  id: string;
  documentId: string;
  content: string;
  chunkIndex: number;
  tokenCount: number;
  pageNumber: number | null;
  startChar: number;
  endChar: number;
  metadata: Record<string, unknown> | null;
  similarity: number;
}

export interface VectorSearchOptions {
  userId: string;
  documentId: string;
  queryEmbedding: number[];
  topK?: number;
  similarityThreshold?: number;
}

/**
 * Validate search options
 */
function validateSearchOptions(options: VectorSearchOptions): void {
  if (!options.userId || typeof options.userId !== 'string') {
    throw new Error('userId is required for vector search');
  }
  
  if (!options.documentId || typeof options.documentId !== 'string') {
    throw new Error('documentId is required for vector search');
  }
  
  if (!Array.isArray(options.queryEmbedding)) {
    throw new Error('queryEmbedding must be an array');
  }
  
  if (options.queryEmbedding.length !== 1024) {
    throw new Error(`queryEmbedding must have 1024 dimensions, got ${options.queryEmbedding.length}`);
  }
  
  // Validate all embedding values are numbers
  for (let i = 0; i < options.queryEmbedding.length; i++) {
    if (typeof options.queryEmbedding[i] !== 'number' || !isFinite(options.queryEmbedding[i])) {
      throw new Error(`Invalid embedding value at index ${i}`);
    }
  }
}

/**
 * Format embedding array as PostgreSQL vector string
 * Example: [0.1, 0.2, 0.3] -> '[0.1,0.2,0.3]'
 */
function formatEmbeddingForPostgres(embedding: number[]): string {
  return `[${embedding.join(',')}]`;
}

/**
 * Search for similar document chunks using vector similarity
 * 
 * Uses cosine distance (1 - cosine_similarity) for ranking.
 * Lower distance = higher similarity.
 * Returns similarity score (1 - distance) for easier interpretation.
 * 
 * SECURITY: Always filters by userId and documentId to prevent cross-user data access.
 * 
 * @param options - Search parameters
 * @returns Array of similar chunks sorted by similarity (descending)
 */
export async function searchSimilarChunks(
  options: VectorSearchOptions
): Promise<SearchResult[]> {
  // Validate inputs
  validateSearchOptions(options);
  
  const {
    userId,
    documentId,
    queryEmbedding,
    topK = 5,
    similarityThreshold = 0.0, // Return all by default, filter can be applied by caller
  } = options;
  
  // Format embedding for PostgreSQL
  const embeddingStr = formatEmbeddingForPostgres(queryEmbedding);
  
  try {
    // Perform vector similarity search
    // Using cosine distance operator: <=>
    // 1 - distance = similarity (0 to 1, where 1 is most similar)
    const results = await prisma.$queryRaw<SearchResult[]>`
      SELECT 
        id,
        "documentId",
        content,
        "chunkIndex",
        "tokenCount",
        "pageNumber",
        "startChar",
        "endChar",
        metadata,
        (1 - (embedding <=> ${embeddingStr}::vector)) as similarity
      FROM "DocumentChunk"
      WHERE "userId" = ${userId}
        AND "documentId" = ${documentId}
        AND (1 - (embedding <=> ${embeddingStr}::vector)) >= ${similarityThreshold}
      ORDER BY embedding <=> ${embeddingStr}::vector
      LIMIT ${topK}
    `;
    
    return results;
  } catch (error) {
    console.error('[VECTOR_SEARCH_ERROR]', error);
    
    // Check if it's a pgvector-specific error
    if (error instanceof Error) {
      if (error.message.includes('vector')) {
        throw new Error(
          'Vector search failed: Ensure pgvector extension is enabled and DocumentChunk table has vector index'
        );
      }
      if (error.message.includes('syntax error')) {
        throw new Error('Vector search failed: Invalid query syntax');
      }
    }
    
    throw new Error(
      `Vector search failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Search across multiple documents (same user)
 * 
 * @param userId - User ID for security filtering
 * @param documentIds - Array of document IDs to search
 * @param queryEmbedding - Query vector
 * @param topK - Number of results per document
 * @returns Array of similar chunks from all documents
 */
export async function searchSimilarChunksAcrossDocuments(
  userId: string,
  documentIds: string[],
  queryEmbedding: number[],
  topK: number = 5
): Promise<SearchResult[]> {
  if (!userId || typeof userId !== 'string') {
    throw new Error('userId is required');
  }
  
  if (!Array.isArray(documentIds) || documentIds.length === 0) {
    return [];
  }
  
  if (!Array.isArray(queryEmbedding) || queryEmbedding.length !== 1024) {
    throw new Error('Invalid queryEmbedding');
  }
  
  const embeddingStr = formatEmbeddingForPostgres(queryEmbedding);
  
  try {
    const results = await prisma.$queryRaw<SearchResult[]>`
      SELECT 
        id,
        "documentId",
        content,
        "chunkIndex",
        "tokenCount",
        "pageNumber",
        "startChar",
        "endChar",
        metadata,
        (1 - (embedding <=> ${embeddingStr}::vector)) as similarity
      FROM "DocumentChunk"
      WHERE "userId" = ${userId}
        AND "documentId" = ANY(${documentIds}::text[])
      ORDER BY embedding <=> ${embeddingStr}::vector
      LIMIT ${topK}
    `;
    
    return results;
  } catch (error) {
    console.error('[VECTOR_SEARCH_MULTI_ERROR]', error);
    throw new Error(
      `Multi-document vector search failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Get total number of chunks for a document
 * Useful for determining if a document has been indexed
 * 
 * @param documentId - Document ID
 * @param userId - User ID for security filtering
 * @returns Number of chunks
 */
export async function getChunkCount(
  documentId: string,
  userId: string
): Promise<number> {
  if (!documentId || !userId) {
    throw new Error('documentId and userId are required');
  }
  
  try {
    const result = await prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*) as count
      FROM "DocumentChunk"
      WHERE "documentId" = ${documentId}
        AND "userId" = ${userId}
    `;
    
    return Number(result[0]?.count || 0);
  } catch (error) {
    console.error('[CHUNK_COUNT_ERROR]', error);
    throw new Error(
      `Failed to get chunk count: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Check if a document has been indexed (has chunks)
 * 
 * @param documentId - Document ID
 * @param userId - User ID for security filtering
 * @returns True if document has chunks
 */
export async function isDocumentIndexed(
  documentId: string,
  userId: string
): Promise<boolean> {
  const count = await getChunkCount(documentId, userId);
  return count > 0;
}

/**
 * Get all chunks for a document (without similarity search)
 * Useful for debugging or displaying document structure
 * 
 * @param documentId - Document ID
 * @param userId - User ID for security filtering
 * @returns Array of chunks ordered by chunkIndex
 */
export async function getDocumentChunks(
  documentId: string,
  userId: string
): Promise<Omit<SearchResult, 'similarity'>[]> {
  if (!documentId || !userId) {
    throw new Error('documentId and userId are required');
  }
  
  try {
    // Use $queryRaw for consistency since DocumentChunk uses Unsupported type
    const chunks = await prisma.$queryRaw<Omit<SearchResult, 'similarity'>[]>`
      SELECT 
        id,
        "documentId",
        content,
        "chunkIndex",
        "tokenCount",
        "pageNumber",
        "startChar",
        "endChar",
        metadata
      FROM "DocumentChunk"
      WHERE "documentId" = ${documentId}
        AND "userId" = ${userId}
      ORDER BY "chunkIndex" ASC
    `;
    
    return chunks;
  } catch (error) {
    console.error('[GET_CHUNKS_ERROR]', error);
    throw new Error(
      `Failed to get document chunks: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
