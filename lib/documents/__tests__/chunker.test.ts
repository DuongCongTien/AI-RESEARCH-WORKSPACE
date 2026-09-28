import { chunkText, Chunk } from '../chunker';

describe('chunkText', () => {
  // ─── Edge cases ─────────────────────────────────────────────────────────────
  describe('edge cases', () => {
    it('should return [] for empty string', () => {
      expect(chunkText('')).toEqual([]);
    });

    it('should return [] for whitespace-only string', () => {
      expect(chunkText('   \n\t  ')).toEqual([]);
    });

    it('should return a single chunk when text is shorter than chunkSize', () => {
      const text = 'Hello world this is a short document';
      const result = chunkText(text, 800, 100);
      expect(result).toHaveLength(1);
      expect(result[0].index).toBe(0);
      expect(result[0].content).toBe(text);
    });
  });

  // ─── Chunking logic ──────────────────────────────────────────────────────────
  describe('chunking logic', () => {
    it('should split text into multiple chunks when words exceed chunkSize', () => {
      const words = Array.from({ length: 900 }, (_, i) => `word${i}`);
      const text = words.join(' ');
      const result = chunkText(text, 800, 100);
      expect(result.length).toBeGreaterThan(1);
    });

    it('each chunk should have correct sequential index starting from 0', () => {
      const words = Array.from({ length: 900 }, (_, i) => `word${i}`);
      const result = chunkText(words.join(' '), 800, 100);
      result.forEach((chunk, i) => {
        expect(chunk.index).toBe(i);
      });
    });

    it('each chunk should have a non-empty content string', () => {
      const words = Array.from({ length: 900 }, (_, i) => `word${i}`);
      const result = chunkText(words.join(' '), 800, 100);
      result.forEach((chunk) => {
        expect(chunk.content.trim().length).toBeGreaterThan(0);
      });
    });

    it('relevance of first chunk should be 0.95', () => {
      const text = 'Hello world';
      const result = chunkText(text, 800, 100);
      expect(result[0].relevance).toBe(0.95);
    });

    it('relevance should decrease by 0.02 per chunk', () => {
      const words = Array.from({ length: 2500 }, (_, i) => `word${i}`);
      const result = chunkText(words.join(' '), 800, 100);
      expect(result.length).toBeGreaterThanOrEqual(2);
      expect(result[1].relevance).toBeCloseTo(0.93, 5);
    });
  });

  // ─── Overlap ─────────────────────────────────────────────────────────────────
  describe('overlap', () => {
    it('last words of chunk N should appear at start of chunk N+1', () => {
      const words = Array.from({ length: 900 }, (_, i) => `word${i}`);
      const text = words.join(' ');
      const overlap = 100;
      const chunkSize = 800;
      const result = chunkText(text, chunkSize, overlap);

      if (result.length >= 2) {
        const firstChunkWords = result[0].content.split(' ');
        const secondChunkWords = result[1].content.split(' ');
        const overlapWords = firstChunkWords.slice(-overlap);
        const secondChunkStart = secondChunkWords.slice(0, overlap);
        expect(overlapWords).toEqual(secondChunkStart);
      }
    });

    it('no overlap when overlap=0: first word of chunk N+1 is NOT last word of chunk N', () => {
      const words = Array.from({ length: 1600 }, (_, i) => `word${i}`);
      const result = chunkText(words.join(' '), 800, 0);
      expect(result.length).toBeGreaterThanOrEqual(2);
      const firstChunkWords = result[0].content.split(' ');
      const secondChunkWords = result[1].content.split(' ');
      const lastWordFirst = firstChunkWords[firstChunkWords.length - 1];
      const firstWordSecond = secondChunkWords[0];
      expect(lastWordFirst).not.toBe(firstWordSecond);
    });
  });

  // ─── Custom chunkSize ────────────────────────────────────────────────────────
  describe('custom chunkSize', () => {
    it('should produce correct number of chunks for small chunkSize', () => {
      // 10 words, chunkSize=3, overlap=0 → chunks: [0-2],[3-5],[6-8],[9] = 4
      const words = Array.from({ length: 10 }, (_, i) => `w${i}`);
      const result = chunkText(words.join(' '), 3, 0);
      expect(result.length).toBe(4);
    });

    it('each small chunk should contain at most chunkSize words', () => {
      const words = Array.from({ length: 20 }, (_, i) => `w${i}`);
      const chunkSize = 5;
      const result = chunkText(words.join(' '), chunkSize, 0);
      result.forEach((chunk) => {
        const wordCount = chunk.content.split(' ').length;
        expect(wordCount).toBeLessThanOrEqual(chunkSize);
      });
    });
  });
});
