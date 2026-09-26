export interface ResearchResponse {
  summary: string;
  keyPoints?: string[];
  key_points?: string[];
  risks: {
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
  }[];
  actions: {
    title: string;
    description?: string;
  }[];
  sources: {
    documentId: string;
    documentName: string;
    page?: number;
    excerpt?: string;
  }[];
}

export type DocumentStatus = 'uploading' | 'processing' | 'ready' | 'failed';
export type ChatStatus = 'idle' | 'loading' | 'streaming' | 'success' | 'error';
