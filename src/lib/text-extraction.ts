import { extractRawText } from 'mammoth';

// Configure pdfjs-dist for Node.js environment
import * as pdfjs from 'pdfjs-dist';
if (typeof pdfjs.GlobalWorkerOptions !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = 'pdfjs-dist/build/pdf.worker.mjs';
}

/**
 * Extract text from a PDF buffer
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const loadingTask = pdfjs.getDocument({ data: buffer });
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
    return pages.join('\n\n');
  } catch (error) {
    console.error('[PDF_EXTRACT]', error);
    throw new Error('Failed to extract text from PDF');
  }
}

/**
 * Extract text from a DOCX buffer
 */
export async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  try {
    const result = await extractRawText({ buffer: buffer });
    // mammoth returns the entire text as a string, split into sections
    return result.value;
  } catch (error) {
    console.error('[DOCX_EXTRACT]', error);
    throw new Error('Failed to extract text from DOCX');
  }
}

/**
 * Extract text from a TXT buffer
 */
export async function extractTextFromTXT(buffer: Buffer): Promise<string> {
  try {
    return buffer.toString('utf-8');
  } catch (error) {
    console.error('[TXT_EXTRACT]', error);
    throw new Error('Failed to extract text from TXT');
  }
}

/**
 * Extract text from a buffer based on file type
 */
export async function extractTextFromBuffer(buffer: Buffer, fileType: string): Promise<string> {
  if (fileType === 'application/pdf') {
    return extractTextFromPDF(buffer);
  } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    return extractTextFromDOCX(buffer);
  } else if (fileType === 'text/plain') {
    return extractTextFromTXT(buffer);
  } else {
    throw new Error(`Unsupported file type: ${fileType}`);
  }
}
