import fs from 'fs';
import path from 'path';

export interface ExtractedText {
  text: string;
  pageCount?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Extracts plain text from uploaded documents.
 * PDF uses pdf-parse; DOCX/XLSX/TXT use basic text reads.
 * In production, add mammoth (DOCX) and xlsx (Excel).
 */
export async function extractText(filePath: string, mimeType: string): Promise<ExtractedText> {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === '.pdf') {
    return extractPdf(filePath);
  }

  if (ext === '.txt' || ext === '.md') {
    const text = fs.readFileSync(filePath, 'utf-8');
    return { text, pageCount: 1 };
  }

  // For DOCX / XLSX – basic fallback (install mammoth/xlsx for full support)
  return { text: `[Content from ${path.basename(filePath)} – install mammoth/xlsx for full extraction]`, pageCount: 1 };
}

async function extractPdf(filePath: string): Promise<ExtractedText> {
  try {
    const pdfParse = require('pdf-parse');
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    return {
      text: data.text || '',
      pageCount: data.numpages,
      metadata: { info: data.info }
    };
  } catch (err) {
    console.error('PDF extraction error:', err);
    return { text: '', pageCount: 0 };
  }
}
