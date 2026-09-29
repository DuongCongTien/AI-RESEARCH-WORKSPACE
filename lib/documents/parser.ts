import mammoth from 'mammoth';
import zlib from 'zlib';
import path from 'path';
import { spawn } from 'child_process';

export interface ParsedDocument {
  text: string;
  pageCount?: number;
  wordCount: number;
}

/**
 * Extracts text and metadata from PDF buffer using an isolated Node.js child process.
 * This completely isolates pdf-parse from Next.js / Turbopack module bundling issues
 * and guarantees accurate /ToUnicode CMap character resolution.
 */
export function extractPdfWithWorker(fileBuffer: Buffer): Promise<ParsedDocument> {
  return new Promise((resolve, reject) => {
    const runnerPath = path.resolve(process.cwd(), 'lib/documents/pdf-worker-runner.cjs');
    const child = spawn(process.execPath, [runnerPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
      windowsHide: true,
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (d) => {
      stdout += d.toString('utf-8');
    });
    child.stderr.on('data', (d) => {
      stderr += d.toString('utf-8');
    });

    const timer = setTimeout(() => {
      child.kill();
      reject(new Error('PDF extraction timed out after 15 seconds'));
    }, 15000);

    child.on('close', (code) => {
      clearTimeout(timer);
      if (code !== 0) {
        reject(new Error(stderr || `PDF extraction failed with exit code ${code}`));
      } else {
        try {
          const parsed = JSON.parse(stdout);
          resolve({
            text: (parsed.text || '').trim(),
            pageCount: Math.max(1, parsed.pages || 1),
            wordCount: parsed.wordCount || 0,
          });
        } catch (jsonErr) {
          reject(jsonErr);
        }
      }
    });

    child.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });

    child.stdin.write(fileBuffer);
    child.stdin.end();
  });
}

// Helper to decode PDF octal escapes and standard escape characters
function decodePdfLiteralString(str: string): string {
  return str
    .replace(/\\([0-7]{1,3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)))
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\b/g, '\b')
    .replace(/\\f/g, '\f')
    .replace(/\\\(/g, '(')
    .replace(/\\\)/g, ')')
    .replace(/\\\\/g, '\\');
}

// Helper to decode PDF hex strings <...> (supporting ASCII and UTF-16BE)
function decodePdfHexString(hex: string): string {
  const clean = hex.replace(/[\s<>]/g, '');
  if (!clean) return '';
  const padded = clean.length % 2 !== 0 ? clean + '0' : clean;
  const buf = Buffer.from(padded, 'hex');

  // Check UTF-16BE with BOM (0xFE 0xFF)
  if (buf.length >= 2 && buf[0] === 0xfe && buf[1] === 0xff) {
    let s = '';
    for (let i = 2; i < buf.length; i += 2) {
      if (i + 1 < buf.length) s += String.fromCharCode((buf[i] << 8) | buf[i + 1]);
    }
    return s;
  }

  // Check UTF-16BE without BOM (alternating null bytes)
  if (buf.length >= 4 && buf[0] === 0 && buf[2] === 0) {
    let s = '';
    for (let i = 0; i < buf.length; i += 2) {
      if (i + 1 < buf.length) s += String.fromCharCode((buf[i] << 8) | buf[i + 1]);
    }
    return s;
  }

  return buf.toString('latin1');
}

function extractTextFromStreamContent(streamStr: string): string[] {
  const textMatches: string[] = [];

  // Match (Text) Tj
  const tjRegex = /\(([^)]*)\)\s*Tj/g;
  let match: RegExpExecArray | null;
  while ((match = tjRegex.exec(streamStr)) !== null) {
    const decoded = decodePdfLiteralString(match[1]).trim();
    if (decoded) textMatches.push(decoded);
  }

  // Match <Hex> Tj
  const hexTjRegex = /<([0-9a-fA-F\s]+)>\s*Tj/g;
  while ((match = hexTjRegex.exec(streamStr)) !== null) {
    const decoded = decodePdfHexString(match[1]).trim();
    if (decoded) textMatches.push(decoded);
  }

  // Match bracketed TJ strings: [ (Text) 100 <Hex> ] TJ
  const bracketTj = /\[([\s\S]*?)\]\s*TJ/g;
  while ((match = bracketTj.exec(streamStr)) !== null) {
    const inner = match[1];
    const subMatches = inner.match(/\(([^)]*)\)/g);
    if (subMatches) {
      for (const s of subMatches) {
        const clean = decodePdfLiteralString(s.slice(1, -1)).trim();
        if (clean) textMatches.push(clean);
      }
    }
    const hexMatches = inner.match(/<([0-9a-fA-F\s]+)>/g);
    if (hexMatches) {
      for (const h of hexMatches) {
        const clean = decodePdfHexString(h).trim();
        if (clean) textMatches.push(clean);
      }
    }
  }

  return textMatches;
}

// Fallback direct text stream extractor for PDFs with corrupted xrefs, FlateDecode compression, or worker issues
export function extractRawPdfTextFallback(buffer: Buffer): string {
  const binary = buffer.toString('binary');
  const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
  let match: RegExpExecArray | null;
  const allMatches: string[] = [];

  // Decompress and parse every PDF stream block
  while ((match = streamRegex.exec(binary)) !== null) {
    const rawStream = Buffer.from(match[1], 'binary');
    let decompressed = '';

    try {
      decompressed = zlib.inflateSync(rawStream).toString('latin1');
    } catch {
      try {
        decompressed = zlib.inflateRawSync(rawStream).toString('latin1');
      } catch {
        decompressed = rawStream.toString('latin1');
      }
    }

    const streamMatches = extractTextFromStreamContent(decompressed);
    if (streamMatches.length > 0) {
      allMatches.push(...streamMatches);
    }
  }

  // If no compressed stream matched, scan uncompressed binary directly
  if (allMatches.length === 0) {
    const rawMatches = extractTextFromStreamContent(binary);
    if (rawMatches.length > 0) {
      allMatches.push(...rawMatches);
    }
  }

  return allMatches.join(' ').replace(/\\([()\\])/g, '$1').trim();
}

import { getAiApiKey, hasAiKey } from '@/lib/ai/client';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';

/**
 * Uses Gemini Multimodal Vision/PDF capability to OCR scanned or image-based PDFs
 * across all pages when native text streams are empty.
 */
export async function extractPdfWithGeminiOcr(
  fileBuffer: Buffer,
  fileName: string
): Promise<ParsedDocument> {
  const apiKey = getAiApiKey();
  if (!apiKey) {
    throw new Error('Không có khóa API AI để thực hiện OCR tài liệu quét.');
  }

  const google = createGoogleGenerativeAI({ apiKey });
  const result = await generateText({
    model: google('gemini-3.1-flash-lite'),
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'file',
            data: new Uint8Array(fileBuffer),
            mediaType: 'application/pdf',
          },
          {
            type: 'text',
            text: `Bạn là trợ lý trích xuất văn bản tài liệu OCR tiếng Việt chính xác cao. Hãy đọc hiểu toàn bộ tất cả các trang của tài liệu "${fileName}". Trích xuất toàn bộ nội dung văn bản chi tiết, đầy đủ từ trang đầu tiên đến trang cuối cùng. Giữ nguyên cấu trúc, tiêu đề các mục và ghi rõ dấu trang [Trang X] ở đầu mỗi trang để phục vụ trích dẫn và nghiên cứu.`,
          },
        ],
      },
    ],
  });

  const text = (result.text || '').trim();
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const pageMatches = text.match(/\[Trang\s*(\d+)\]/gi);
  const pageCount = pageMatches ? Math.max(1, pageMatches.length) : Math.max(1, Math.ceil(text.length / 2000));

  return {
    text,
    pageCount,
    wordCount,
  };
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
        const workerResult = await extractPdfWithWorker(fileBuffer);
        const cleanedText = (workerResult.text || '')
          .replace(/--\s*\d+\s*of\s*\d+\s*--/gi, '')
          .trim();

        if (cleanedText.length >= 50) {
          return workerResult;
        }
        console.warn(`PDF ${fileName} worker result has insufficient text (${cleanedText.length} chars). Attempting Gemini OCR fallback...`);
      } catch (workerErr) {
        console.warn('PDF worker extraction notice, trying OCR fallback:', workerErr);
      }

      // Check if we can perform Gemini Multimodal OCR
      if (hasAiKey()) {
        try {
          const ocrResult = await extractPdfWithGeminiOcr(fileBuffer, fileName);
          if (ocrResult.text && ocrResult.text.length >= 50) {
            return ocrResult;
          }
        } catch (ocrErr) {
          console.warn('Gemini PDF OCR notice, falling back to stream parsing:', ocrErr);
        }
      }

      // Resilient fallback for pure streams or environments where spawning is restricted
      const fallbackText = extractRawPdfTextFallback(fileBuffer);
      if (fallbackText && fallbackText.length >= 50) {
        let pageCount = 1;
        const pageMatches = fileBuffer.toString('latin1').match(/\/Type\s*\/Page\b/g);
        if (pageMatches && pageMatches.length > 1) {
          pageCount = pageMatches.length;
        }
        return {
          text: fallbackText,
          pageCount,
          wordCount: fallbackText.split(/\s+/).filter(Boolean).length,
        };
      }

      throw new Error(`Tài liệu ${fileName} không chứa văn bản đọc được (tệp scan hoặc ảnh).`);
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
      `Không thể phân tích tài liệu ${fileName}: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`
    );
  }
}
