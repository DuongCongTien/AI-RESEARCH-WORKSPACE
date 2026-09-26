import mammoth from 'mammoth';

export interface ParsedDocument {
  text: string;
  pageCount?: number;
  wordCount: number;
}

export async function parseDocument(
  fileBuffer: Buffer,
  fileType: string,
  fileName: string
): Promise<ParsedDocument> {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';

  try {
    if (fileType.includes('pdf') || extension === 'pdf') {
      const pdfModule = await import('pdf-parse');
      let text = '';
      let pageCount = 1;

      // Check if PDFParse class is exported (v2+)
      if ('PDFParse' in pdfModule && typeof (pdfModule as Record<string, unknown>).PDFParse === 'function') {
        const PDFParserClass = (pdfModule as unknown as { PDFParse: new (opts: { data: Buffer }) => { getText: () => Promise<{ text: string; pages?: unknown[] }>; destroy: () => Promise<void> } }).PDFParse;
        const parser = new PDFParserClass({ data: fileBuffer });
        const result = await parser.getText();
        text = result.text || '';
        pageCount = result.pages?.length || 1;
        await parser.destroy();
      } else if (typeof pdfModule === 'function') {
        const legacyFn = pdfModule as unknown as (buf: Buffer) => Promise<{ text: string; numpages: number }>;
        const result = await legacyFn(fileBuffer);
        text = result.text || '';
        pageCount = result.numpages || 1;
      } else if (
        'default' in pdfModule &&
        typeof (pdfModule as Record<string, unknown>).default === 'function'
      ) {
        const defaultFn = (pdfModule as unknown as { default: (buf: Buffer) => Promise<{ text: string; numpages: number }> }).default;
        const result = await defaultFn(fileBuffer);
        text = result.text || '';
        pageCount = result.numpages || 1;
      }

      return {
        text: text.trim(),
        pageCount,
        wordCount: text.split(/\s+/).filter(Boolean).length,
      };
    }

    if (
      fileType.includes('wordprocessingml') ||
      fileType.includes('msword') ||
      extension === 'docx' ||
      extension === 'doc'
    ) {
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      const text = result.value || '';
      return {
        text: text.trim(),
        wordCount: text.split(/\s+/).filter(Boolean).length,
      };
    }

    // Default fallback: parse as plain text (txt, md, json, csv, etc.)
    const text = fileBuffer.toString('utf-8');
    return {
      text: text.trim(),
      wordCount: text.split(/\s+/).filter(Boolean).length,
    };
  } catch (error) {
    console.error(`Error parsing document ${fileName}:`, error);
    throw new Error(
      `Failed to parse ${fileName}: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
