import { validateDocumentFile, processDocumentFile, SUPPORTED_EXTENSIONS, MAX_FILE_SIZE_BYTES } from '../processor';

// ─── Mock parseDocument (parser.ts) ─────────────────────────────────────────
jest.mock('../parser', () => ({
  parseDocument: jest.fn(),
}));

import { parseDocument } from '../parser';
const mockParseDocument = parseDocument as jest.MockedFunction<typeof parseDocument>;

// ─── Mock mammoth ─────────────────────────────────────────────────────────────
jest.mock('mammoth', () => ({
  extractRawText: jest.fn(),
}));

// ─── validateDocumentFile ─────────────────────────────────────────────────────
describe('validateDocumentFile', () => {
  describe('file size validation', () => {
    it('should return invalid when file size exceeds MAX_FILE_SIZE_BYTES', () => {
      const result = validateDocumentFile('doc.pdf', MAX_FILE_SIZE_BYTES + 1);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('25MB');
    });

    it('should return valid for file size exactly at MAX_FILE_SIZE_BYTES', () => {
      const result = validateDocumentFile('doc.pdf', MAX_FILE_SIZE_BYTES);
      expect(result.valid).toBe(true);
    });

    it('should return valid for file size below limit', () => {
      const result = validateDocumentFile('doc.pdf', 1024);
      expect(result.valid).toBe(true);
    });
  });

  describe('extension validation', () => {
    it.each(SUPPORTED_EXTENSIONS)('should return valid for .%s extension', (ext) => {
      const result = validateDocumentFile(`file.${ext}`, 1024);
      expect(result.valid).toBe(true);
    });

    it('should return invalid for unsupported extension .exe', () => {
      const result = validateDocumentFile('malware.exe', 1024);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('.exe');
    });

    it('should return invalid for unsupported extension .png', () => {
      const result = validateDocumentFile('image.png', 1024);
      expect(result.valid).toBe(false);
    });

    it('should handle file names with no extension gracefully', () => {
      const result = validateDocumentFile('noextension', 1024);
      expect(result.valid).toBe(false);
    });

    it('should be case-insensitive for extension (PDF → pdf)', () => {
      const result = validateDocumentFile('DOCUMENT.PDF', 1024);
      expect(result.valid).toBe(true);
    });
  });
});

// ─── processDocumentFile ──────────────────────────────────────────────────────
describe('processDocumentFile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validation errors', () => {
    it('should throw for oversized file', async () => {
      const bigBuffer = Buffer.alloc(MAX_FILE_SIZE_BYTES + 1);
      await expect(processDocumentFile(bigBuffer, 'big.pdf')).rejects.toThrow();
    });

    it('should throw for unsupported file type', async () => {
      const buf = Buffer.from('data');
      await expect(processDocumentFile(buf, 'file.exe')).rejects.toThrow();
    });
  });

  describe('successful processing (TXT)', () => {
    it('should return status "ready" with correct fields for plain text', async () => {
      const text = 'Hello world. This is a test document.';
      mockParseDocument.mockResolvedValueOnce({
        text,
        wordCount: 7,
        pageCount: 1,
      });

      const buf = Buffer.from(text, 'utf-8');
      const result = await processDocumentFile(buf, 'test.txt', 'text/plain');

      expect(result.status).toBe('ready');
      expect(result.textContent).toBe(text);
      expect(result.wordCount).toBe(7);
      expect(result.pageCount).toBe(1);
      expect(result.fileName).toBe('test.txt');
      expect(result.fileType).toBe('txt');
      expect(result.errorMsg).toBeNull();
    });

    it('should compute tokensCount as ~1.33x wordCount', async () => {
      const text = 'Alpha Beta Gamma Delta Epsilon';
      mockParseDocument.mockResolvedValueOnce({ text, wordCount: 5, pageCount: 1 });

      const buf = Buffer.from(text);
      const result = await processDocumentFile(buf, 'test.txt');
      expect(result.tokensCount).toBe(Math.round(5 * 1.33));
    });

    it('should produce chunks', async () => {
      const words = Array.from({ length: 10 }, (_, i) => `word${i}`);
      const text = words.join(' ');
      mockParseDocument.mockResolvedValueOnce({ text, wordCount: 10, pageCount: 1 });

      const buf = Buffer.from(text);
      const result = await processDocumentFile(buf, 'test.txt');
      expect(result.chunks.length).toBeGreaterThan(0);
    });

    it('parsedMarkdown should start with the filename heading', async () => {
      mockParseDocument.mockResolvedValueOnce({ text: 'Content here', wordCount: 2, pageCount: 1 });
      const buf = Buffer.from('Content here');
      const result = await processDocumentFile(buf, 'myfile.txt');
      expect(result.parsedMarkdown).toMatch(/^# myfile\.txt/);
    });

    it('parsedMarkdown should contain truncation notice when text > 3000 chars', async () => {
      const longText = 'a '.repeat(1600); // 3200 chars
      mockParseDocument.mockResolvedValueOnce({ text: longText, wordCount: 1600, pageCount: 1 });
      const buf = Buffer.from(longText);
      const result = await processDocumentFile(buf, 'long.txt');
      expect(result.parsedMarkdown).toContain('rút gọn');
    });
  });

  describe('failed parsing', () => {
    it('should return status "failed" with errorMsg when parseDocument throws', async () => {
      mockParseDocument.mockRejectedValueOnce(new Error('Parse error'));
      const buf = Buffer.from('some content');
      const result = await processDocumentFile(buf, 'broken.txt');

      expect(result.status).toBe('failed');
      expect(result.errorMsg).toContain('Parse error');
      expect(result.textContent).toBe('');
      expect(result.chunks).toEqual([]);
    });
  });

  describe('mimeType fallback', () => {
    it('should use application/<extension> as mimeType when not provided', async () => {
      mockParseDocument.mockResolvedValueOnce({ text: 'content', wordCount: 1, pageCount: 1 });
      const buf = Buffer.from('content');
      const result = await processDocumentFile(buf, 'document.json');
      expect(result.mimeType).toBe('application/json');
    });

    it('should use provided mimeType when given', async () => {
      mockParseDocument.mockResolvedValueOnce({ text: 'content', wordCount: 1, pageCount: 1 });
      const buf = Buffer.from('content');
      const result = await processDocumentFile(buf, 'document.txt', 'text/plain');
      expect(result.mimeType).toBe('text/plain');
    });
  });
});
