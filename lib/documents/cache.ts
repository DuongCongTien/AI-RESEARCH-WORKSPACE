import { DocumentItem } from '@/types';

// Shared global in-memory corpus cache across API routes during server lifecycle
const globalForCorpus = globalThis as unknown as {
  sharedDocumentCorpus: DocumentItem[] | undefined;
};

export const INITIAL_CORPUS: DocumentItem[] = [
  {
    id: 'doc-annual-report',
    name: 'Bao_Cao_Thuong_Nien.pdf',
    fileName: 'Bao_Cao_Thuong_Nien.pdf',
    fileType: 'pdf',
    mimeType: 'application/pdf',
    fileSize: 2.4 * 1024 * 1024,
    pages: 15,
    wordCount: 12450,
    indexHealth: 98.4,
    status: 'ready',
    progress: 100,
    inContext: true,
    uploadedBy: 'TS. Elena Vance',
    uploadedAt: 'hôm nay lúc 09:42',
    tablesCount: 4,
    chunksCount: 15,
    tokensCount: 42190,
    embeddingModel: 'text-embedding-3-large',
    content:
      'Trong năm tài chính 2024, hoạt động hạ tầng học sâu mở rộng 34.2% so với cùng kỳ. Cụm nghiên cứu đạt thông lượng suy luận tăng 2.1x sau khi triển khai các bộ giải mã nâng cao. Thước đo tự chủ tác nhân GAIA-v2 ghi nhận độ chính xác tăng từ 61.8% lên 74.3% trên các tác vụ truy hồi công cụ, chứng minh cho các giả thuyết nêu trong Bản ghi nhớ Kỹ thuật số 88.',
    textContent:
      'Trong năm tài chính 2024, hoạt động hạ tầng học sâu mở rộng 34.2% so với cùng kỳ. Cụm nghiên cứu đạt thông lượng suy luận tăng 2.1x sau khi triển khai các bộ giải mã nâng cao. Thước đo tự chủ tác nhân GAIA-v2 ghi nhận độ chính xác tăng từ 61.8% lên 74.3% trên các tác vụ truy hồi công cụ, chứng minh cho các giả thuyết nêu trong Bản ghi nhớ Kỹ thuật số 88.',
    parsedMarkdown:
      '# 1. Tóm tắt nội dung & Điểm mốc chính\n\nTrong năm tài chính 2024, hoạt động hạ tầng học sâu mở rộng **34.2% so với cùng kỳ**. Cụm nghiên cứu đạt thông lượng suy luận tăng 2.1x sau khi triển khai các bộ giải mã nâng cao.\n\nThước đo tự chủ tác nhân **GAIA-v2** ghi nhận độ chính xác tăng từ 61.8% lên 74.3% trên các tác vụ truy hồi công cụ, chứng minh cho các giả thuyết nêu trong Bản ghi nhớ Kỹ thuật số 88.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'doc-market-analysis',
    name: 'Phan_Tich_Thi_Truong.docx',
    fileName: 'Phan_Tich_Thi_Truong.docx',
    fileType: 'docx',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    fileSize: 1.8 * 1024 * 1024,
    pages: 28,
    wordCount: 18200,
    indexHealth: 88.0,
    status: 'processing',
    progress: 42,
    step: 'Đang trích xuất văn bản & bảng biểu... (Đoạn 18/42)',
    timeRemaining: 'Dự kiến 20 giây',
    inContext: true,
    uploadedBy: 'TS. Elena Vance',
    uploadedAt: '4 phút trước',
    tablesCount: 2,
    chunksCount: 8,
    tokensCount: 14500,
    embeddingModel: 'Cohere-Embed-v3',
    content: 'Phân tích thị trường về các nút tính toán AI có chủ quyền và dịch vụ lưu trữ mô hình nền tảng...',
    textContent: 'Phân tích thị trường về các nút tính toán AI có chủ quyền và dịch vụ lưu trữ mô hình nền tảng...',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'doc-technical-notes',
    name: 'Ghi_Chu_Ky_Thuat.txt',
    fileName: 'Ghi_Chu_Ky_Thuat.txt',
    fileType: 'txt',
    mimeType: 'text/plain',
    fileSize: 420 * 1024,
    pages: 4,
    wordCount: 3120,
    indexHealth: 95.0,
    status: 'uploading',
    progress: 65,
    transferRate: '1.2 MB/s',
    timeRemaining: 'Còn ~2 giây',
    inContext: true,
    uploadedBy: 'TS. Elena Vance',
    uploadedAt: 'Đang tải lên từ thiết bị',
    tablesCount: 0,
    chunksCount: 4,
    tokensCount: 3120,
    content: 'Thông số kỹ thuật về lượng tử hóa mô hình phân tán và nhân chú ý thưa thớt.',
    textContent: 'Thông số kỹ thuật về lượng tử hóa mô hình phân tán và nhân chú ý thưa thớt.',
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
