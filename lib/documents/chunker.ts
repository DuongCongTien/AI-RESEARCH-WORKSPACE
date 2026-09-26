export interface Chunk {
  index: number;
  content: string;
  relevance: number;
}

export function chunkText(text: string, chunkSize: number = 800, overlap: number = 100): Chunk[] {
  if (!text || text.trim().length === 0) return [];

  const chunks: Chunk[] = [];
  const words = text.split(/\s+/).filter(Boolean);

  let currentWords: string[] = [];
  let chunkIndex = 0;

  for (let i = 0; i < words.length; i++) {
    currentWords.push(words[i]);

    if (currentWords.length >= chunkSize || i === words.length - 1) {
      const content = currentWords.join(' ');
      chunks.push({
        index: chunkIndex,
        content,
        relevance: parseFloat((0.95 - (chunkIndex * 0.02)).toFixed(2)),
      });
      chunkIndex++;

      // Overlap
      currentWords = currentWords.slice(currentWords.length - overlap);
    }
  }

  return chunks;
}
