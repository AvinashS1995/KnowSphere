import { config } from '../config/env';

export interface TextChunk {
  content: string;
  index: number;
  startChar: number;
  endChar: number;
}

/**
 * Splits text into overlapping chunks for RAG retrieval.
 */
export function chunkText(
  text: string,
  chunkSize: number = config.processing.chunkSize,
  overlap: number = config.processing.chunkOverlap
): TextChunk[] {
  const chunks: TextChunk[] = [];

  // Clean whitespace
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (!cleaned) return chunks;

  // Split on sentence boundaries first, then chunk
  const sentences = cleaned.split(/(?<=[.!?])\s+/);
  let current = '';
  let startChar = 0;
  let index = 0;

  for (const sentence of sentences) {
    if ((current + ' ' + sentence).length > chunkSize && current.length > 0) {
      chunks.push({
        content: current.trim(),
        index,
        startChar,
        endChar: startChar + current.length
      });

      // Overlap: keep last N characters from current
      const overlapText = current.slice(-overlap);
      startChar = startChar + current.length - overlapText.length;
      current = overlapText + ' ' + sentence;
      index++;
    } else {
      current = current ? current + ' ' + sentence : sentence;
    }
  }

  if (current.trim()) {
    chunks.push({
      content: current.trim(),
      index,
      startChar,
      endChar: startChar + current.length
    });
  }

  return chunks;
}

/**
 * Clean extracted text for better chunking quality.
 */
export function cleanText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/[^\x20-\x7E\n\t]/g, ' ')
    .trim();
}
