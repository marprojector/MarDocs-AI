declare module 'docx-extractor' {
  export function extractText(buffer: Buffer): Promise<string[]>;
}
