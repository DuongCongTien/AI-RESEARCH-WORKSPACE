export * from './research';

export interface DocumentChunk {
  id: string;
  chunkIndex: number;
  content: string;
  relevance: number;
  metadata?: Record<string, unknown>;
}

export interface DocumentItem {
  id: string;
  name: string;
  fileUrl?: string | null;
  fileType: string;
  fileSize: number;
  pages?: number;
  wordCount?: number;
  indexHealth?: number;
  status: 'uploading' | 'processing' | 'ready' | 'failed';
  progress?: number;
  step?: string;
  transferRate?: string;
  timeRemaining?: string;
  errorMsg?: string | null;
  errorCode?: string | null;
  inContext?: boolean;
  uploadedBy?: string;
  uploadedAt?: string;
  textContent?: string | null;
  parsedMarkdown?: string | null;
  rawText?: string | null;
  tablesCount?: number;
  chunksCount?: number;
  embeddingModel?: string;
  tokensCount?: number;
  createdAt: string | Date;
  updatedAt?: string | Date;
  chunks?: DocumentChunk[];
}

export interface ConversationItem {
  id: string;
  title: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  messages?: MessageItemType[];
  documentIds?: string[];
}

export interface MessageItemType {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  structuredResponse?: import('./research').ResearchResponse | null;
  createdAt: string | Date;
}
