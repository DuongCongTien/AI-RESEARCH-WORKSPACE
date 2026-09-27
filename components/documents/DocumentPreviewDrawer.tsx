'use client';

import React, { useState } from 'react';
import { DocumentItem } from '@/types';

interface DocumentPreviewDrawerProps {
  document: DocumentItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DocumentPreviewDrawer({
  document: doc,
  isOpen,
  onClose,
}: DocumentPreviewDrawerProps) {
  const [activeTab, setActiveTab] = useState<'markdown' | 'raw' | 'tables' | 'chunks'>('markdown');

  if (!isOpen || !doc) return null;

  const handleExport = () => {
    const content = doc.parsedMarkdown || doc.textContent || `# ${doc.name}\n\nKhông có nội dung văn bản Markdown được trích xuất.`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.name.replace(/\.[^/.]+$/, '')}_trich_xuat.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <aside className="w-96 flex-shrink-0 bg-surface/95 backdrop-blur-xl flex flex-col justify-between shadow-2xl border-l border-outline-variant/40 h-full fixed lg:static right-0 top-16 bottom-0 z-40 transition-all duration-300">
      <div className="flex flex-col h-full overflow-hidden">
        {/* Drawer Header */}
        <div className="p-space-md bg-surface-container-low/80 backdrop-blur-md flex items-center justify-between border-b border-outline-variant/30 shrink-0">
          <div className="flex items-center gap-space-xs truncate pr-2">
            <div className="w-8 h-8 rounded-lg bg-tertiary/10 text-tertiary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[18px]">find_in_page</span>
            </div>
            <div className="min-w-0">
              <span className="font-headline-sm text-headline-sm text-on-surface truncate block font-semibold">
                Xem trước: {doc.name}
              </span>
              <span className="font-label-xs text-label-xs text-outline block">
                Dữ liệu chỉ mục véc-tơ
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high p-1.5 rounded-lg transition-colors cursor-pointer"
            title="Đóng ngăn xem trước"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Preview Tabs */}
        <div className="flex items-center px-space-md bg-surface border-b border-outline-variant/30 shrink-0 overflow-x-auto gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('markdown')}
            className={`py-2.5 px-2 font-label-xs text-label-xs transition-all border-b-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'markdown'
                ? 'font-bold text-primary border-primary shadow-[0_2px_8px_rgba(79,70,229,0.15)]'
                : 'text-on-surface-variant hover:text-on-surface border-transparent'
            }`}
          >
            Văn bản Markdown
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('raw')}
            className={`py-2.5 px-2 font-label-xs text-label-xs transition-all border-b-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'raw'
                ? 'font-bold text-primary border-primary shadow-[0_2px_8px_rgba(79,70,229,0.15)]'
                : 'text-on-surface-variant hover:text-on-surface border-transparent'
            }`}
          >
            Văn bản thô
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tables')}
            className={`py-2.5 px-2 font-label-xs text-label-xs transition-all border-b-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'tables'
                ? 'font-bold text-primary border-primary shadow-[0_2px_8px_rgba(79,70,229,0.15)]'
                : 'text-on-surface-variant hover:text-on-surface border-transparent'
            }`}
          >
            Bảng biểu ({doc.tablesCount || 4})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('chunks')}
            className={`py-2.5 px-2 font-label-xs text-label-xs transition-all border-b-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'chunks'
                ? 'font-bold text-primary border-primary shadow-[0_2px_8px_rgba(79,70,229,0.15)]'
                : 'text-on-surface-variant hover:text-on-surface border-transparent'
            }`}
          >
            Đoạn trích ({doc.chunksCount || 15})
          </button>
        </div>

        {/* Rendered Document View */}
        <div className="flex-1 overflow-y-auto p-space-md space-y-space-md font-body-sm text-body-sm text-on-surface-variant">
          {activeTab === 'markdown' && (
            <>
              <div className="p-space-sm rounded-xl bg-surface-container-low flex items-center justify-between border border-outline-variant/40 shadow-2xs">
                <span className="font-label-xs text-label-xs text-outline font-mono">Mã đoạn trích: #chk-0914-sec-1</span>
                <span className="font-label-xs text-label-xs text-tertiary bg-tertiary/10 px-2 py-0.5 rounded-full font-mono font-semibold">
                  Độ phù hợp 0.94
                </span>
              </div>

              <div className="space-y-space-sm text-on-surface bg-surface p-4 rounded-xl border border-outline-variant/40 shadow-xs">
                <h4 className="font-headline-sm text-headline-sm text-primary tracking-tight font-bold">
                  1. Tóm tắt nội dung &amp; Điểm mốc chính
                </h4>
                <p className="leading-relaxed text-on-surface-variant">
                  Trong tài liệu nghiên cứu, hạ tầng học sâu được tối ưu hóa tăng trưởng{' '}
                  <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded font-semibold border border-primary/20">
                    34.2% so với cùng kỳ
                  </span>
                  . Các cụm tính toán đạt hiệu năng tăng 2.1 lần sau khi áp dụng các giải thuật suy luận nâng cao.
                </p>
                <p className="leading-relaxed text-on-surface-variant">
                  Thước đo tự chủ tác nhân{' '}
                  <span className="bg-tertiary/10 text-tertiary px-1.5 py-0.5 rounded font-semibold border border-tertiary/20">
                    GAIA-v2
                  </span>{' '}
                  ghi nhận độ chính xác tăng từ 61.8% lên 74.3% trên các tác vụ truy hồi công cụ.
                </p>
              </div>

              {/* Highlighted Table Preview */}
              <div className="rounded-xl overflow-hidden bg-surface border border-outline-variant/40 shadow-xs">
                <div className="p-2.5 font-label-xs text-label-xs font-semibold bg-surface-container-low text-on-surface flex justify-between border-b border-outline-variant/30">
                  <span>Bảng 1.1: Độ trễ &amp; Phân bổ bộ nhớ</span>
                  <span className="text-tertiary font-mono font-medium">Trích xuất sạch</span>
                </div>
                <table className="w-full text-left font-label-xs text-label-xs">
                  <thead className="bg-surface-container-low/50 text-outline">
                    <tr>
                      <th className="p-2.5 font-medium">Mô hình</th>
                      <th className="p-2.5 font-medium">Bộ nhớ</th>
                      <th className="p-2.5 font-medium">Độ trễ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20 text-on-surface-variant">
                    <tr className="hover:bg-primary/5 transition-colors">
                      <td className="p-2.5 text-on-surface font-semibold">Llama-3-70B-FP8</td>
                      <td className="p-2.5 font-mono">41.2 GB</td>
                      <td className="p-2.5 text-tertiary font-mono font-semibold">14.2 ms</td>
                    </tr>
                    <tr className="hover:bg-primary/5 transition-colors">
                      <td className="p-2.5 text-on-surface font-semibold">Mistral-Large-Q4</td>
                      <td className="p-2.5 font-mono">26.8 GB</td>
                      <td className="p-2.5 text-tertiary font-mono font-semibold">9.8 ms</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="p-space-sm rounded-xl bg-surface-container-low flex flex-col gap-1.5 border border-outline-variant/40 shadow-2xs">
                <span className="font-label-xs text-label-xs text-outline uppercase tracking-wider font-semibold">
                  Thực thể ngữ nghĩa
                </span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  <span className="font-label-xs text-label-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium border border-primary/20 hover:scale-105 transition-transform">
                    #giai-ma-suy-luan
                  </span>
                  <span className="font-label-xs text-label-xs px-2.5 py-1 rounded-full bg-tertiary/10 text-tertiary font-medium border border-tertiary/20 hover:scale-105 transition-transform">
                    #gaia-benchmark
                  </span>
                  <span className="font-label-xs text-label-xs px-2.5 py-1 rounded-full bg-secondary/10 text-secondary font-medium border border-secondary/20 hover:scale-105 transition-transform">
                    #hieu-nang
                  </span>
                </div>
              </div>
            </>
          )}

          {activeTab === 'raw' && (
            <div className="bg-surface-container-lowest p-3.5 rounded-xl font-mono text-xs text-on-surface-variant whitespace-pre-wrap leading-relaxed border border-outline-variant/40 shadow-inner">
              {doc.textContent || doc.rawText || 'Văn bản thô trích xuất từ tệp tin:\n\n[Tiêu đề: 0x50 0x44 0x46]\n%PDF-1.7\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n...'}
            </div>
          )}

          {activeTab === 'tables' && (
            <div className="space-y-space-md">
              <div className="rounded-xl overflow-hidden bg-surface border border-outline-variant/40 shadow-xs">
                <div className="p-2.5 font-label-xs text-label-xs font-semibold bg-surface-container-low text-on-surface flex justify-between border-b border-outline-variant/30">
                  <span>Bảng 1: Tỷ lệ chính xác kiểm thử</span>
                  <span className="text-tertiary font-mono font-medium">Trích xuất sạch</span>
                </div>
                <table className="w-full text-left font-label-xs text-label-xs">
                  <thead className="bg-surface-container-low/50 text-outline">
                    <tr>
                      <th className="p-2.5">Bài kiểm thử</th>
                      <th className="p-2.5">Cơ sở ban đầu</th>
                      <th className="p-2.5">Kết hợp RAG</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20 text-on-surface-variant">
                    <tr className="hover:bg-primary/5 transition-colors">
                      <td className="p-2.5 text-on-surface font-semibold">MMLU Pro</td>
                      <td className="p-2.5 font-mono">78.4%</td>
                      <td className="p-2.5 text-primary font-mono font-semibold">89.1%</td>
                    </tr>
                    <tr className="hover:bg-primary/5 transition-colors">
                      <td className="p-2.5 text-on-surface font-semibold">HumanEval</td>
                      <td className="p-2.5 font-mono">82.1%</td>
                      <td className="p-2.5 text-primary font-mono font-semibold">91.4%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'chunks' && (
            <div className="space-y-2.5">
              {[1, 2, 3].map((chunkIdx) => (
                <div
                  key={chunkIdx}
                  className="p-3.5 rounded-xl bg-surface border border-outline-variant/40 space-y-1.5 card-interactive shadow-xs"
                >
                  <div className="flex items-center justify-between text-label-xs font-label-xs">
                    <span className="text-primary font-mono font-semibold">#chk-0914-sec-{chunkIdx}</span>
                    <span className="text-tertiary bg-tertiary/10 px-2 py-0.5 rounded-full font-mono font-medium">
                      Độ phù hợp {(0.95 - chunkIdx * 0.04).toFixed(2)}
                    </span>
                  </div>
                  <p className="text-body-sm text-on-surface-variant text-xs line-clamp-3 leading-relaxed">
                    Phần {chunkIdx}: Các cân nhắc kiến trúc mở rộng khi truy xuất tài liệu và xác thực đa tác nhân nghiên cứu...
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Drawer Footer Action */}
        <div className="p-space-md bg-surface-container-low/80 backdrop-blur-md border-t border-outline-variant/30 flex items-center justify-between gap-space-sm shrink-0">
          <button
            type="button"
            onClick={handleExport}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-space-md rounded-xl bg-surface hover:bg-surface-bright text-on-surface font-body-sm text-body-sm font-semibold transition-all shadow-xs border border-outline-variant/40 hover:border-primary/40 hover:shadow-md cursor-pointer group"
          >
            <span className="material-symbols-outlined text-[18px] text-primary group-hover:translate-y-0.5 transition-transform">
              file_download
            </span>
            Xuất văn bản Markdown
          </button>
        </div>
      </div>
    </aside>
  );
}
