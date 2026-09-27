import { DocumentItem } from '@/types';

// Shared global in-memory corpus cache across API routes during server lifecycle
const globalForCorpus = globalThis as unknown as {
  sharedDocumentCorpus: DocumentItem[] | undefined;
};

export const INITIAL_CORPUS: DocumentItem[] = [
  {
    id: 'doc-annual-report',
    name: 'Annual_Report.pdf',
    fileName: 'Annual_Report.pdf',
    fileType: 'pdf',
    mimeType: 'application/pdf',
    fileSize: 2.4 * 1024 * 1024,
    pages: 15,
    wordCount: 12450,
    indexHealth: 98.4,
    status: 'ready',
    progress: 100,
    inContext: true,
    uploadedBy: 'Dr. Elena Vance',
    uploadedAt: 'today at 09:42 AM',
    tablesCount: 4,
    chunksCount: 15,
    tokensCount: 42190,
    embeddingModel: 'text-embedding-3-large',
    content:
      'In fiscal year 2024, our deep learning infrastructure operations expanded by 34.2% Year-Over-Year. Core research clusters realized an overall inference throughput enhancement of 2.1x following the roll-out of speculative decoding kernels. Agent autonomy benchmark GAIA-v2 recorded an accuracy increase from 61.8% to 74.3% across tool retrieval tasks, corroborating hypotheses presented in Technical Memorandum #88.',
    textContent:
      'In fiscal year 2024, our deep learning infrastructure operations expanded by 34.2% Year-Over-Year. Core research clusters realized an overall inference throughput enhancement of 2.1x following the roll-out of speculative decoding kernels. Agent autonomy benchmark GAIA-v2 recorded an accuracy increase from 61.8% to 74.3% across tool retrieval tasks, corroborating hypotheses presented in Technical Memorandum #88.',
    parsedMarkdown:
      '# 1. Executive Summary & Q4 Milestones\n\nIn fiscal year 2024, our deep learning infrastructure operations expanded by **34.2% Year-Over-Year**. Core research clusters realized an overall inference throughput enhancement of 2.1x following the roll-out of speculative decoding kernels.\n\nAgent autonomy benchmark **GAIA-v2** recorded an accuracy increase from 61.8% to 74.3% across tool retrieval tasks, corroborating hypotheses presented in Technical Memorandum #88.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'doc-market-analysis',
    name: 'Market_Analysis.docx',
    fileName: 'Market_Analysis.docx',
    fileType: 'docx',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    fileSize: 1.8 * 1024 * 1024,
    pages: 28,
    wordCount: 18200,
    indexHealth: 88.0,
    status: 'processing',
    progress: 42,
    step: 'Extracting text & multi-column tables... (Chunk 18/42)',
    timeRemaining: 'Est. 20s',
    inContext: true,
    uploadedBy: 'Dr. Elena Vance',
    uploadedAt: '4 mins ago',
    tablesCount: 2,
    chunksCount: 8,
    tokensCount: 14500,
    embeddingModel: 'Cohere-Embed-v3',
    content: 'Market analysis of sovereign AI compute nodes and foundational LLM hosting...',
    textContent: 'Market analysis of sovereign AI compute nodes and foundational LLM hosting...',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'doc-technical-notes',
    name: 'Technical_Notes.txt',
    fileName: 'Technical_Notes.txt',
    fileType: 'txt',
    mimeType: 'text/plain',
    fileSize: 420 * 1024,
    pages: 4,
    wordCount: 3120,
    indexHealth: 95.0,
    status: 'uploading',
    progress: 65,
    transferRate: '1.2 MB/s',
    timeRemaining: '~2 seconds remaining',
    inContext: true,
    uploadedBy: 'Dr. Elena Vance',
    uploadedAt: 'Uploading from local storage',
    tablesCount: 0,
    chunksCount: 4,
    tokensCount: 3120,
    content: 'Technical specifications for distributed model quantization and sparse attention kernels.',
    textContent: 'Technical specifications for distributed model quantization and sparse attention kernels.',
    createdAt: new Date().toISOString(),
  },
];

export function getSharedDocuments(): DocumentItem[] {
  if (!globalForCorpus.sharedDocumentCorpus) {
    globalForCorpus.sharedDocumentCorpus = [...INITIAL_CORPUS];
  }
  return globalForCorpus.sharedDocumentCorpus;
}

export function addSharedDocument(doc: DocumentItem): void {
  const corpus = getSharedDocuments();
  corpus.unshift(doc);
}

export function removeSharedDocument(id: string): void {
  if (globalForCorpus.sharedDocumentCorpus) {
    globalForCorpus.sharedDocumentCorpus = globalForCorpus.sharedDocumentCorpus.filter(
      (d) => d.id !== id
    );
  }
}
