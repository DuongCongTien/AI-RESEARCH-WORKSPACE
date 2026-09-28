import { extractRawPdfTextFallback, parseDocument } from '../parser';

// ─── Mock mammoth ─────────────────────────────────────────────────────────────
jest.mock('mammoth', () => ({
  extractRawText: jest.fn(),
}));
import mammoth from 'mammoth';
const mockMammoth = mammoth as jest.Mocked<typeof mammoth>;

// ─── extractRawPdfTextFallback ────────────────────────────────────────────────
// NOTE: this function is not exported; we test it indirectly through parseDocument fallback path.
// We expose it for isolated unit testing by re-exporting from parser.

describe('parseDocument – plain text', () => {
  it('should parse a plain text buffer correctly', async () => {
    const text = 'Hello world from a text file.';
    const buf = Buffer.from(text, 'utf-8');
    const result = await parseDocument(buf, 'text/plain', 'file.txt');

    expect(result.text).toBe(text.trim());
    expect(result.wordCount).toBe(6);
  });

  it('should handle multi-line text files', async () => {
    const text = 'Line one\nLine two\nLine three';
    const buf = Buffer.from(text, 'utf-8');
    const result = await parseDocument(buf, 'text/plain', 'file.txt');
    expect(result.text).toContain('Line one');
    expect(result.wordCount).toBe(6);
  });

  it('should calculate pageCount correctly for long text', async () => {
    // 5000 chars → ceil(5000/2500) = 2 pages
    const text = 'a '.repeat(2500);
    const buf = Buffer.from(text, 'utf-8');
    const result = await parseDocument(buf, 'text/plain', 'file.txt');
    expect(result.pageCount).toBe(2);
  });

  it('should have at least pageCount=1 for very short text', async () => {
    const buf = Buffer.from('Hi', 'utf-8');
    const result = await parseDocument(buf, 'text/plain', 'file.txt');
    expect(result.pageCount).toBeGreaterThanOrEqual(1);
  });
});

describe('parseDocument – JSON / Markdown (treated as text)', () => {
  it('should parse JSON file as plain text', async () => {
    const json = JSON.stringify({ key: 'value', num: 42 });
    const buf = Buffer.from(json, 'utf-8');
    const result = await parseDocument(buf, 'application/json', 'data.json');
    expect(result.text).toContain('key');
    expect(result.wordCount).toBeGreaterThan(0);
  });

  it('should parse markdown file as plain text', async () => {
    const md = '# Title\n\n## Section\n\nSome **bold** content.';
    const buf = Buffer.from(md, 'utf-8');
    const result = await parseDocument(buf, 'text/markdown', 'README.md');
    expect(result.text).toContain('Title');
  });
});

describe('parseDocument – DOCX', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should call mammoth.extractRawText for docx mimeType', async () => {
    (mockMammoth.extractRawText as jest.Mock).mockResolvedValueOnce({ value: 'Extracted DOCX text', messages: [] });
    const buf = Buffer.from('fake docx binary');
    const result = await parseDocument(buf, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'document.docx');

    expect(mockMammoth.extractRawText).toHaveBeenCalledWith({ buffer: buf });
    expect(result.text).toBe('Extracted DOCX text');
    expect(result.wordCount).toBe(3);
  });

  it('should call mammoth.extractRawText for docx extension', async () => {
    (mockMammoth.extractRawText as jest.Mock).mockResolvedValueOnce({ value: 'DOCX content here', messages: [] });
    const buf = Buffer.from('fake docx');
    const result = await parseDocument(buf, 'application/octet-stream', 'file.docx');
    expect(result.text).toBe('DOCX content here');
  });

  it('should call mammoth.extractRawText for .doc extension', async () => {
    (mockMammoth.extractRawText as jest.Mock).mockResolvedValueOnce({ value: 'Old DOC file', messages: [] });
    const buf = Buffer.from('fake doc');
    const result = await parseDocument(buf, '', 'legacy.doc');
    expect(result.text).toBe('Old DOC file');
  });

  it('should estimate pageCount for long DOCX content', async () => {
    const longText = 'word '.repeat(5000); // lots of text → more than 1 page
    (mockMammoth.extractRawText as jest.Mock).mockResolvedValueOnce({ value: longText, messages: [] });
    const buf = Buffer.from('fake docx');
    const result = await parseDocument(buf, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'long.docx');
    expect(result.pageCount).toBeGreaterThan(1);
  });
});

describe('parseDocument – error handling', () => {
  it('should throw a localized error when mammoth fails', async () => {
    (mockMammoth.extractRawText as jest.Mock).mockRejectedValueOnce(new Error('Corrupt file'));
    const buf = Buffer.from('bad data');
    await expect(parseDocument(buf, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'bad.docx'))
      .rejects
      .toThrow('Không thể phân tích tài liệu bad.docx');
  });
});
