import { DocumentItem } from '@/types';

// Shared global in-memory corpus cache across API routes during server lifecycle
const globalForCorpus = globalThis as unknown as {
  sharedDocumentCorpus: DocumentItem[] | undefined;
};

// Không sử dụng dữ liệu mẫu — corpus bắt đầu rỗng,
// tất cả tài liệu được nạp thực tế qua API upload.
export const INITIAL_CORPUS: DocumentItem[] = [];

export function getSharedDocuments(): DocumentItem[] {
  if (!globalForCorpus.sharedDocumentCorpus) {
    globalForCorpus.sharedDocumentCorpus = [];
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
