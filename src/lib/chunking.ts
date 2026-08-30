/**
 * Text chunking utility for RAG implementation
 * 
 * Splits documents into overlapping chunks suitable for embedding and retrieval.
 * Uses character-based chunking with sentence-aware boundaries.
 */

export interface ChunkMetadata {
  content: string;
  chunkIndex: number;
  tokenCount: number;
  startChar: number;
  endChar: number;
  pageNumber?: number;
}

export interface ChunkingOptions {
  chunkSize?: number;
  overlap?: number;
  pageNumbers?: number[]; // Optional: page number for each character position
}

const DEFAULT_CHUNK_SIZE = 800;
const DEFAULT_OVERLAP = 200;

/**
 * Estimate token count from character count
 * Rough approximation: 1 token ≈ 4 characters
 */
function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Find the best boundary (sentence/paragraph end) near a target position
 * Looks for: period+space, exclamation+space, question+space, newlines
 */
function findBestBoundary(
  text: string,
  targetPos: number,
  searchRadius: number = 100
): number {
  // Don't search beyond text bounds
  const searchStart = Math.max(0, targetPos - searchRadius);
  const searchEnd = Math.min(text.length, targetPos + searchRadius);
  
  // Look for sentence endings near target position
  const sentenceEndings = /[.!?]\s/g;
  const paragraphBreaks = /\n\n/g;
  
  let bestBoundary = targetPos;
  let bestDistance = Infinity;
  
  // Search for paragraph breaks first (strongest boundary)
  paragraphBreaks.lastIndex = 0;
  let match;
  while ((match = paragraphBreaks.exec(text.slice(searchStart, searchEnd))) !== null) {
    const pos = searchStart + match.index + match[0].length;
    const distance = Math.abs(pos - targetPos);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestBoundary = pos;
    }
  }
  
  // If no paragraph break, look for sentence endings
  if (bestDistance === Infinity) {
    sentenceEndings.lastIndex = 0;
    while ((match = sentenceEndings.exec(text.slice(searchStart, searchEnd))) !== null) {
      const pos = searchStart + match.index + match[0].length;
      const distance = Math.abs(pos - targetPos);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestBoundary = pos;
      }
    }
  }
  
  // Fall back to single newline
  if (bestDistance === Infinity) {
    const newlinePos = text.indexOf('\n', targetPos);
    if (newlinePos !== -1 && newlinePos < searchEnd) {
      bestBoundary = newlinePos + 1;
    }
  }
  
  return bestBoundary;
}

/**
 * Determine page number for a given character position
 * Uses binary search if page boundaries are provided
 */
function getPageNumberForPosition(
  position: number,
  pageNumbers?: number[]
): number | undefined {
  if (!pageNumbers || pageNumbers.length === 0) {
    return undefined;
  }
  
  // Binary search to find which page this position belongs to
  let left = 0;
  let right = pageNumbers.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (position < pageNumbers[mid]) {
      right = mid - 1;
    } else if (mid < pageNumbers.length - 1 && position >= pageNumbers[mid + 1]) {
      left = mid + 1;
    } else {
      return mid + 1; // Page numbers are 1-indexed
    }
  }
  
  return pageNumbers.length; // Last page
}

/**
 * Split text into overlapping chunks with metadata
 * 
 * @param text - The text to chunk
 * @param options - Chunking configuration
 * @returns Array of chunks with metadata
 */
export function chunkText(
  text: string,
  options: ChunkingOptions = {}
): ChunkMetadata[] {
  const {
    chunkSize = DEFAULT_CHUNK_SIZE,
    overlap = DEFAULT_OVERLAP,
    pageNumbers,
  } = options;
  
  // Handle empty or very short text
  if (!text || text.trim().length === 0) {
    return [];
  }
  
  const trimmedText = text.trim();
  
  // If text is shorter than chunk size, return single chunk
  if (trimmedText.length <= chunkSize) {
    return [
      {
        content: trimmedText,
        chunkIndex: 0,
        tokenCount: estimateTokenCount(trimmedText),
        startChar: 0,
        endChar: trimmedText.length,
        pageNumber: getPageNumberForPosition(0, pageNumbers),
      },
    ];
  }
  
  const chunks: ChunkMetadata[] = [];
  let startPos = 0;
  let chunkIndex = 0;
  
  while (startPos < trimmedText.length) {
    // Calculate target end position
    let endPos = startPos + chunkSize;
    
    // If this would be the last chunk and it's very small, extend the previous chunk instead
    if (endPos >= trimmedText.length) {
      endPos = trimmedText.length;
    } else {
      // Try to find a good boundary near the target end position
      endPos = findBestBoundary(trimmedText, endPos);
      
      // Ensure we don't go backwards or stay at the same position
      if (endPos <= startPos) {
        endPos = Math.min(startPos + chunkSize, trimmedText.length);
      }
    }
    
    const chunkContent = trimmedText.slice(startPos, endPos).trim();
    
    // Only add non-empty chunks
    if (chunkContent.length > 0) {
      chunks.push({
        content: chunkContent,
        chunkIndex: chunkIndex,
        tokenCount: estimateTokenCount(chunkContent),
        startChar: startPos,
        endChar: endPos,
        pageNumber: getPageNumberForPosition(startPos, pageNumbers),
      });
      chunkIndex++;
    }
    
    // Move start position forward, accounting for overlap
    startPos = endPos - overlap;
    
    // Ensure we make progress
    if (startPos <= chunks[chunks.length - 1]?.startChar) {
      startPos = endPos;
    }
    
    // Break if we've reached the end
    if (startPos >= trimmedText.length) {
      break;
    }
  }
  
  return chunks;
}

/**
 * Validate chunking results
 * Useful for testing and debugging
 */
export function validateChunks(chunks: ChunkMetadata[]): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (chunks.length === 0) {
    return { valid: true, errors: [] };
  }
  
  // Check chunk indices are sequential
  for (let i = 0; i < chunks.length; i++) {
    if (chunks[i].chunkIndex !== i) {
      errors.push(`Chunk at position ${i} has incorrect chunkIndex: ${chunks[i].chunkIndex}`);
    }
  }
  
  // Check no empty chunks
  for (const chunk of chunks) {
    if (!chunk.content || chunk.content.trim().length === 0) {
      errors.push(`Empty chunk at index ${chunk.chunkIndex}`);
    }
  }
  
  // Check character positions are logical
  for (const chunk of chunks) {
    if (chunk.startChar < 0 || chunk.endChar < 0) {
      errors.push(`Invalid character positions in chunk ${chunk.chunkIndex}`);
    }
    if (chunk.startChar >= chunk.endChar) {
      errors.push(`startChar >= endChar in chunk ${chunk.chunkIndex}`);
    }
  }
  
  // Check chunks don't overlap excessively
  for (let i = 1; i < chunks.length; i++) {
    const prev = chunks[i - 1];
    const curr = chunks[i];
    if (curr.startChar > prev.endChar) {
      errors.push(`Gap between chunks ${prev.chunkIndex} and ${curr.chunkIndex}`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}
