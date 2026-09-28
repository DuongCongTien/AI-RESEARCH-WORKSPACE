export * from './research';
import type { DocumentStatus } from './research';


export interface DocumentChunk {
  id: string;
  chunkIndex: number;
  content: string;
  relevance: number;
  metadata?: Record<string, unknown>;
}

export interface Document {
  id: string;
  name: string;
  fileName?: string | null;
  fileUrl?: string | null;
  fileType: string;
  mimeType?: string | null;
  fileSize: number;
  pages?: number;
  wordCount?: number;
  indexHealth?: number;
  status: DocumentStatus;
  progress?: number;
  step?: string | null;
  transferRate?: string | null;
  timeRemaining?: string | null;
  errorMsg?: string | null;
  errorCode?: string | null;
  inContext?: boolean;
  uploadedBy?: string | null;
  uploadedAt?: string | null;
  userId?: string | null;
  content?: string | null;
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

// Alias for backwards compatibility
export type DocumentItem = Document;

export interface ChatMessage {
  id: string;
  conversationId?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  structuredResponse?: import('./research').ResearchResponse | null;
  status?: 'idle' | 'loading' | 'streaming' | 'success' | 'error';
  sources?: Array<{
    id: string;
    name: string;
    excerpt?: string;
    page?: number;
  }>;
  createdAt: string | Date;
}

export type MessageItemType = ChatMessage;

export interface ChatRequest {
  documentIds: string[];
  message: string;
  conversationId?: string;
}

export interface ChatResponse {
  success: boolean;
  message?: string;
  answer?: string;
  sources?: Array<{
    id: string;
    name: string;
    excerpt?: string;
  }>;
  error?: string;
}

export interface ConversationItem {
  id: string;
  title: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  messages?: MessageItemType[];
  documentIds?: string[];
}
