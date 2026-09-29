import { parseDocument, ParsedDocument } from './parser';
import { chunkText, Chunk } from './chunker';

export interface ProcessedDocumentResult {
  fileName: string;
  fileType: string;
  mimeType: string;
  fileSize: number;
  textContent: string;
  pageCount: number;
  wordCount: number;
  tokensCount: number;
  chunks: Chunk[];
  parsedMarkdown: string;
  status: 'ready' | 'failed';
  errorMsg?: string | null;
}

export const SUPPORTED_EXTENSIONS = ['pdf', 'docx', 'txt', 'md', 'json'];
export const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

export function validateDocumentFile(fileName: string, fileSize: number): { valid: boolean; error?: string } {
  if (fileSize > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `Dung lượng tệp vượt quá giới hạn tối đa cho phép (${MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB).`,
    };
  }

  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  if (!SUPPORTED_EXTENSIONS.includes(extension)) {
    return {
      valid: false,
      error: `Định dạng tệp không được hỗ trợ (.${extension}). Các định dạng hỗ trợ: PDF, DOCX, TXT.`,
    };
  }

  return { valid: true };
}

export async function processDocumentFile(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string = ''
): Promise<ProcessedDocumentResult> {
  const extension = fileName.split('.').pop()?.toLowerCase() || 'txt';
  const fileSize = fileBuffer.length;

  const validation = validateDocumentFile(fileName, fileSize);
  if (!validation.valid) {
    throw new Error(validation.error || 'Tệp không hợp lệ');
  }

  let parsed: ParsedDocument;
  try {
    parsed = await parseDocument(fileBuffer, mimeType || extension, fileName);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Phân tích tài liệu thất bại';
    return {
      fileName,
      fileType: extension,
      mimeType,
      fileSize,
      textContent: '',
      pageCount: 0,
      wordCount: 0,
      tokensCount: 0,
      chunks: [],
      parsedMarkdown: '',
      status: 'failed',
      errorMsg,
    };
  }

  const textContent = (parsed.text || '').trim();
  if (textContent.length === 0) {
    return {
      fileName,
      fileType: extension,
      mimeType,
      fileSize,
      textContent: '',
      pageCount: parsed.pageCount || 1,
      wordCount: 0,
      tokensCount: 0,
      chunks: [],
      parsedMarkdown: '',
      status: 'failed',
      errorMsg: `Tài liệu ${fileName} không chứa văn bản đọc được (có thể là tệp PDF scan hoặc ảnh). Vui lòng sử dụng tệp có lớp văn bản.`,
    };
  }

  const wordCount = parsed.wordCount || textContent.split(/\s+/).filter(Boolean).length;
  const pageCount = parsed.pageCount || Math.max(1, Math.ceil(textContent.length / 2500));
  const tokensCount = Math.round(wordCount * 1.33);
  const chunks = chunkText(textContent);

  const previewSnippet = textContent.slice(0, 3000);
  const parsedMarkdown = `# ${fileName}\n\n${previewSnippet}${textContent.length > 3000 ? '\n\n*...[Nội dung đã được rút gọn để xem trước]*' : ''}`;

  return {
    fileName,
    fileType: extension,
    mimeType: mimeType || `application/${extension}`,
    fileSize,
    textContent,
    pageCount,
    wordCount,
    tokensCount,
    chunks,
    parsedMarkdown,
    status: 'ready',
    errorMsg: null,
  };
}
