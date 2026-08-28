import { PDFParse } from 'pdf-parse';
import { extractText as extractDocxText } from 'docx-extractor';

/**
 * Extract text from a PDF buffer
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const pdf = new PDFParse({ data: buffer });
    const result = await pdf.getText();
    return result.text;
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
    const result = await extractDocxText(buffer);
    // docx-extractor returns an array of strings (one per section/page)
    // Join them with newlines for a single text block
    return result.join('\n\n');
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
