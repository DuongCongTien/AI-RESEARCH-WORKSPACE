import mammoth from 'mammoth';
import { pathToFileURL } from 'url';

export interface ParsedDocument {
  text: string;
  pageCount?: number;
  wordCount: number;
}

// Fallback direct text stream extractor for PDFs with corrupted xrefs or worker issues
function extractRawPdfTextFallback(buffer: Buffer): string {
  const content = buffer.toString('latin1');
  const textMatches: string[] = [];

  // Match (Text) Tj and [(Text)] TJ
  const tjRegex = /\(([^)]+)\)\s*Tj/g;
  let match: RegExpExecArray | null;
  while ((match = tjRegex.exec(content)) !== null) {
    if (match[1] && match[1].trim()) {
      textMatches.push(match[1]);
    }
  }

  // Match bracketed TJ strings
  const bracketTj = /\[([^\]]+)\]\s*TJ/g;
  while ((match = bracketTj.exec(content)) !== null) {
    const inner = match[1];
    const subMatches = inner.match(/\(([^)]+)\)/g);
    if (subMatches) {
      for (const s of subMatches) {
        const clean = s.slice(1, -1).trim();
        if (clean) textMatches.push(clean);
      }
    }
  }

  return textMatches.join(' ').replace(/\\([()\\])/g, '$1').trim();
}

export async function parseDocument(
  fileBuffer: Buffer,
  fileType: string,
  fileName: string
): Promise<ParsedDocument> {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';

  try {
    // 1. PDF Documents
    if (fileType.includes('pdf') || extension === 'pdf') {
      try {
        const pdfModule = await import('pdf-parse');
        let text = '';
        let pageCount = 1;

        if ('PDFParse' in pdfModule && typeof (pdfModule as Record<string, unknown>).PDFParse === 'function') {
          const PDFParserClass = (pdfModule as unknown as {
            PDFParse: {
              new (opts: { data: Buffer }): {
                getText: () => Promise<{ text: string; pages?: unknown[] }>;
                destroy: () => Promise<void>;
              };
              setWorker?: (workerUrl: string) => void;
            };
          }).PDFParse;

          // Configure absolute worker path for Next.js server runtime
          try {
            if (typeof PDFParserClass.setWorker === 'function') {
              const workerPath = pathToFileURL(
                require.resolve('pdfjs-dist/legacy/build/pdf.worker.mjs')
              ).href;
              PDFParserClass.setWorker(workerPath);
            }
          } catch (workerErr) {
            console.warn('pdf.worker resolution notice:', workerErr);
          }

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
        } else if ('default' in pdfModule && typeof (pdfModule as Record<string, unknown>).default === 'function') {
          const defaultFn = (pdfModule as unknown as { default: (buf: Buffer) => Promise<{ text: string; numpages: number }> }).default;
          const result = await defaultFn(fileBuffer);
          text = result.text || '';
          pageCount = result.numpages || 1;
        }

        // If parsed text is empty, attempt fallback extraction
        if (!text || text.trim().length === 0) {
          const fallbackText = extractRawPdfTextFallback(fileBuffer);
          if (fallbackText) {
            text = fallbackText;
          }
        }

        return {
          text: text.trim(),
          pageCount: Math.max(1, pageCount),
          wordCount: text.split(/\s+/).filter(Boolean).length,
        };
      } catch (pdfErr) {
        console.warn('PDFParse primary method failed, attempting stream fallback:', pdfErr);
        const fallbackText = extractRawPdfTextFallback(fileBuffer);
        if (fallbackText) {
          return {
            text: fallbackText,
            pageCount: 1,
            wordCount: fallbackText.split(/\s+/).filter(Boolean).length,
          };
        }
        throw pdfErr;
      }
    }

    // 2. DOCX Documents
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
        pageCount: Math.max(1, Math.ceil(text.length / 2500)),
      };
    }

    // 3. Plain Text / Markdown / JSON (TXT)
    const text = fileBuffer.toString('utf-8');
    return {
      text: text.trim(),
      wordCount: text.split(/\s+/).filter(Boolean).length,
      pageCount: Math.max(1, Math.ceil(text.length / 2500)),
    };
  } catch (error) {
    console.error(`Error parsing document ${fileName}:`, error);
    throw new Error(
      `Failed to parse ${fileName}: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
