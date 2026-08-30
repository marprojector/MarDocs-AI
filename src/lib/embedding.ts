/**
 * Voyage AI embedding generation utility for RAG implementation
 * 
 * Generates vector embeddings for text chunks using Voyage AI's API.
 * Uses native fetch() without additional dependencies.
 */

const VOYAGE_API_URL = 'https://api.voyageai.com/v1/embeddings';
const VOYAGE_MODEL = 'voyage-3'; // 1024 dimensions, optimized for retrieval
const MAX_BATCH_SIZE = 128; // Conservative batch size
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

export interface EmbeddingResult {
  embedding: number[];
  index: number;
}

export interface BatchEmbeddingResult {
  embeddings: number[][];
  model: string;
  usage: {
    totalTokens: number;
  };
}

/**
 * Error class for embedding-related failures
 */
export class EmbeddingError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly isRetryable: boolean = false
  ) {
    super(message);
    this.name = 'EmbeddingError';
  }
}

/**
 * Validate API key is present
 */
function getApiKey(): string {
  const apiKey = process.env.VOYAGE_API_KEY;
  
  if (!apiKey || apiKey.trim().length === 0) {
    throw new EmbeddingError(
      'VOYAGE_API_KEY is not configured. Please set the environment variable.',
      undefined,
      false
    );
  }
  
  return apiKey;
}

/**
 * Sleep for a given number of milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Make a request to Voyage AI API with retry logic
 */
async function makeVoyageRequest(
  texts: string[],
  retryCount: number = 0
): Promise<BatchEmbeddingResult> {
  const apiKey = getApiKey();
  
  try {
    const response = await fetch(VOYAGE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        input: texts,
        model: VOYAGE_MODEL,
      }),
    });
    
    // Handle rate limiting (429)
    if (response.status === 429) {
      if (retryCount < MAX_RETRIES) {
        const retryAfter = response.headers.get('Retry-After');
        const delayMs = retryAfter
          ? parseInt(retryAfter, 10) * 1000
          : INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
        
        console.warn(`[EMBEDDING] Rate limited. Retrying after ${delayMs}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`);
        await sleep(delayMs);
        return makeVoyageRequest(texts, retryCount + 1);
      } else {
        throw new EmbeddingError(
          'Rate limit exceeded. Maximum retries reached.',
          429,
          false
        );
      }
    }
    
    // Handle server errors (5xx) with retry
    if (response.status >= 500 && response.status < 600) {
      if (retryCount < MAX_RETRIES) {
        const delayMs = INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
        console.warn(`[EMBEDDING] Server error ${response.status}. Retrying after ${delayMs}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`);
        await sleep(delayMs);
        return makeVoyageRequest(texts, retryCount + 1);
      } else {
        throw new EmbeddingError(
          `Voyage AI server error: ${response.status}. Maximum retries reached.`,
          response.status,
          false
        );
      }
    }
    
    // Handle authentication errors (401, 403)
    if (response.status === 401 || response.status === 403) {
      throw new EmbeddingError(
        'Invalid or missing API key. Please check VOYAGE_API_KEY configuration.',
        response.status,
        false
      );
    }
    
    // Handle other client errors (4xx)
    if (response.status >= 400 && response.status < 500) {
      let errorMessage = `Voyage AI API error: ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData.error?.message) {
          errorMessage = errorData.error.message;
        }
      } catch {
        // Ignore JSON parse errors
      }
      throw new EmbeddingError(errorMessage, response.status, false);
    }
    
    // Parse successful response
    if (!response.ok) {
      throw new EmbeddingError(
        `Unexpected API response: ${response.status}`,
        response.status,
        false
      );
    }
    
    const data = await response.json();
    
    // Validate response structure
    if (!data || !Array.isArray(data.data)) {
      throw new EmbeddingError(
        'Invalid API response: missing data array',
        undefined,
        false
      );
    }
    
    // Extract embeddings in the correct order
    const embeddings: number[][] = [];
    for (let i = 0; i < texts.length; i++) {
      const item = data.data.find((d: EmbeddingResult) => d.index === i);
      if (!item || !Array.isArray(item.embedding)) {
        throw new EmbeddingError(
          `Invalid API response: missing embedding at index ${i}`,
          undefined,
          false
        );
      }
      
      // Verify embedding dimension is 1024
      if (item.embedding.length !== 1024) {
        throw new EmbeddingError(
          `Invalid embedding dimension: expected 1024, got ${item.embedding.length}`,
          undefined,
          false
        );
      }
      
      embeddings.push(item.embedding);
    }
    
    // Verify we got all embeddings
    if (embeddings.length !== texts.length) {
      throw new EmbeddingError(
        `Embedding count mismatch: expected ${texts.length}, got ${embeddings.length}`,
        undefined,
        false
      );
    }
    
    return {
      embeddings,
      model: data.model || VOYAGE_MODEL,
      usage: {
        totalTokens: data.usage?.total_tokens || 0,
      },
    };
  } catch (error) {
    // Re-throw EmbeddingError as-is
    if (error instanceof EmbeddingError) {
      throw error;
    }
    
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new EmbeddingError(
        'Network error: Unable to connect to Voyage AI API',
        undefined,
        true
      );
    }
    
    // Wrap other errors
    throw new EmbeddingError(
      `Embedding generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      undefined,
      false
    );
  }
}

/**
 * Generate embedding for a single text
 * 
 * @param text - Text to embed
 * @returns Embedding vector (1024 dimensions)
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (!text || text.trim().length === 0) {
    throw new EmbeddingError('Cannot generate embedding for empty text', undefined, false);
  }
  
  const result = await makeVoyageRequest([text]);
  return result.embeddings[0];
}

/**
 * Generate embeddings for multiple texts in batches
 * 
 * @param texts - Array of texts to embed
 * @param batchSize - Maximum texts per batch (default: 128)
 * @returns Array of embedding vectors in the same order as input
 */
export async function generateEmbeddings(
  texts: string[],
  batchSize: number = MAX_BATCH_SIZE
): Promise<number[][]> {
  if (!texts || texts.length === 0) {
    return [];
  }
  
  // Validate all texts are non-empty
  for (let i = 0; i < texts.length; i++) {
    if (!texts[i] || texts[i].trim().length === 0) {
      throw new EmbeddingError(
        `Cannot generate embedding for empty text at index ${i}`,
        undefined,
        false
      );
    }
  }
  
  // Process in batches
  const allEmbeddings: number[][] = [];
  
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const result = await makeVoyageRequest(batch);
    allEmbeddings.push(...result.embeddings);
    
    // Log progress for large batches
    if (texts.length > batchSize) {
      console.log(`[EMBEDDING] Processed ${Math.min(i + batchSize, texts.length)}/${texts.length} texts`);
    }
  }
  
  return allEmbeddings;
}

/**
 * Estimate cost for embedding generation
 * Voyage AI voyage-3-lite: $0.00006 per 1K tokens
 * 
 * @param texts - Texts to embed
 * @returns Estimated cost in USD
 */
export function estimateEmbeddingCost(texts: string[]): number {
  const totalChars = texts.reduce((sum, text) => sum + text.length, 0);
  const estimatedTokens = totalChars / 4; // Rough approximation
  const costPer1kTokens = 0.00006;
  return (estimatedTokens / 1000) * costPer1kTokens;
}
