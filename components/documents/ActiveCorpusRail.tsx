'use client';

import React from 'react';
import { DocumentItem } from '@/types';

interface ActiveCorpusRailProps {
  documents: DocumentItem[];
  selectedDocId?: string | null;
  onSelectDoc: (id: string) => void;
  onRetryDoc?: (id: string) => void;
}

export function ActiveCorpusRail({
  documents,
  selectedDocId,
  onSelectDoc,
  onRetryDoc,
}: ActiveCorpusRailProps) {
  // Compute storage and stats
  const totalSizeBytes = documents.reduce((sum, d) => sum + (d.fileSize || 0), 0);
  const totalMB = (totalSizeBytes / (1024 * 1024)).toFixed(1);
  const maxStorageMB = 500;
  const storagePercent = Math.min(100, Math.round((parseFloat(totalMB) / maxStorageMB) * 100)) || 14;

  const readyCount = documents.filter((d) => d.status === 'ready').length;
  const procCount = documents.filter((d) => d.status === 'processing').length;
  const failCount = documents.filter((d) => d.status === 'failed').length;

  return (
    <aside className="w-80 flex-shrink-0 bg-surface border-r border-outline-variant/60 flex flex-col justify-between shadow-xs h-full transition-colors">
      <div className="p-space-md flex flex-col gap-space-md overflow-y-auto">
        {/* Panel Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-[19px] text-tertiary animate-subtle-pulse">folder_open</span>
            <span className="font-headline-sm text-headline-sm text-on-surface font-semibold tracking-tight">Tài nguyên nghiên cứu</span>
          </div>
          <span className="font-label-xs text-label-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-semibold font-mono">
            Chỉ mục v2.4
          </span>
        </div>

        {/* Document Items List */}
        <div className="flex flex-col gap-2">
          {documents.map((doc) => {
            const isSelected = selectedDocId === doc.id;
            const fileSizeMB = doc.fileSize
              ? doc.fileSize > 1024 * 1024
                ? `${(doc.fileSize / (1024 * 1024)).toFixed(1)} MB`
                : `${Math.round(doc.fileSize / 1024)} KB`
              : '1.2 MB';

            // Document Item 1: Ready
            if (doc.status === 'ready') {
              return (
                <div
                  key={doc.id}
                  onClick={() => onSelectDoc(doc.id)}
                  className={`p-3 rounded-xl transition-all duration-200 cursor-pointer shadow-2xs group border ${
                    isSelected
                      ? 'bg-primary/10 border-primary/40 ring-1 ring-primary/30'
                      : 'bg-surface-container-low border-outline-variant/50 hover:bg-surface hover:border-primary/30 hover:translate-x-0.5'
                  }`}
                >
                  <div className="flex items-start justify-between gap-space-xs">
                    <div className="flex items-center gap-space-xs truncate">
                      <span className="material-symbols-outlined text-primary text-[18px]">picture_as_pdf</span>
                      <span className="font-body-sm text-body-sm font-semibold text-on-surface truncate group-hover:text-primary">
                        {doc.name}
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 font-label-xs text-label-xs px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-status-ripple"></span>
                      Sẵn sàng
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-1 font-label-xs text-label-xs text-outline border-t border-outline-variant/30">
                    <span>{fileSizeMB} • {doc.pages || 15} trang</span>
                    <span>Đã đồng bộ {doc.uploadedAt || '12 phút trước'}</span>
                  </div>
                </div>
              );
            }

            // Document Item 2: Processing
            if (doc.status === 'processing') {
              const progress = doc.progress || 42;
              return (
                <div
                  key={doc.id}
                  onClick={() => onSelectDoc(doc.id)}
                  className={`p-3 rounded-xl transition-all duration-200 cursor-pointer shadow-2xs group border ${
                    isSelected
                      ? 'bg-primary/10 border-primary/40 ring-1 ring-primary/30'
                      : 'bg-surface-container-low border-outline-variant/50 hover:bg-surface hover:border-primary/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-space-xs">
                    <div className="flex items-center gap-space-xs truncate">
                      <span className="material-symbols-outlined text-tertiary text-[18px]">description</span>
                      <span className="font-body-sm text-body-sm font-semibold text-on-surface truncate group-hover:text-primary">
                        {doc.name}
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 font-label-xs text-label-xs px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 font-semibold">
                      <span className="material-symbols-outlined text-[12px] animate-spin">progress_activity</span>
                      Đang xử lý
                    </span>
                  </div>
                  <p className="font-label-xs text-label-xs text-primary font-medium mt-1 truncate">
                    {doc.step || `Đang trích xuất nội dung... (Đoạn 18/42)`}
                  </p>
                  <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden mt-1.5">
                    <div
                      className="bg-primary h-full rounded-full transition-all duration-300 shimmer-sweep"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between mt-1.5 font-label-xs text-label-xs text-outline border-t border-outline-variant/30 pt-1">
                    <span>{fileSizeMB} • {doc.pages || 28} trang</span>
                    <span>{doc.timeRemaining || 'Dự kiến 20 giây'}</span>
                  </div>
                </div>
              );
            }

            // Document Item 3: Uploading
            if (doc.status === 'uploading') {
              const progress = doc.progress || 65;
              return (
                <div
                  key={doc.id}
                  onClick={() => onSelectDoc(doc.id)}
                  className={`p-3 rounded-xl transition-all duration-200 cursor-pointer shadow-2xs group border ${
                    isSelected
                      ? 'bg-secondary/10 border-secondary/40 ring-1 ring-secondary/30'
                      : 'bg-surface-container-low border-outline-variant/50 hover:bg-surface'
                  }`}
                >
                  <div className="flex items-start justify-between gap-space-xs">
                    <div className="flex items-center gap-space-xs truncate">
                      <span className="material-symbols-outlined text-outline text-[18px]">text_snippet</span>
                      <span className="font-body-sm text-body-sm font-semibold text-on-surface truncate group-hover:text-primary">
                        {doc.name}
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 font-label-xs text-label-xs px-1.5 py-0.5 rounded-md bg-secondary-container text-on-secondary-container font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
                      {progress}%
                    </span>
                  </div>
                  <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden mt-2">
                    <div
                      className="bg-secondary h-full rounded-full shimmer-sweep"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between mt-1.5 font-label-xs text-label-xs text-outline border-t border-outline-variant/30 pt-1">
                    <span>{fileSizeMB} • {doc.transferRate || '1.2 MB/s'}</span>
                    <span>Đang tải lên</span>
                  </div>
                </div>
              );
            }

            // Document Item 4: Failed
            return (
              <div
                key={doc.id}
                onClick={() => onSelectDoc(doc.id)}
                className={`p-3 rounded-xl transition-all duration-200 cursor-pointer shadow-2xs group border ${
                  isSelected
                    ? 'bg-rose-50 border-rose-400 ring-1 ring-rose-300'
                    : 'bg-surface-container-low border-rose-200 hover:bg-rose-50/50'
                }`}
              >
                <div className="flex items-start justify-between gap-space-xs">
                  <div className="flex items-center gap-space-xs truncate">
                    <span className="material-symbols-outlined text-rose-600 text-[18px]">report_problem</span>
                    <span className="font-body-sm text-body-sm font-semibold text-rose-600 truncate">
                      {doc.name}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onRetryDoc) onRetryDoc(doc.id);
                    }}
                    className="inline-flex items-center gap-1 font-label-xs text-label-xs px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 hover:bg-rose-600 hover:text-white transition-all font-semibold active:scale-95"
                    title="Thử tải lại"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[12px]">refresh</span>
                    Thử lại
                  </button>
                </div>
                <p className="font-label-xs text-label-xs text-rose-600 font-medium mt-1 truncate">
                  {doc.errorMsg || 'Lỗi luồng dữ liệu PDF hỏng'}
                </p>
                <div className="flex items-center justify-between mt-1.5 font-label-xs text-label-xs text-outline border-t border-outline-variant/30 pt-1">
                  <span>Kích thước không rõ</span>
                  <span className="text-rose-600 font-semibold">Phân tích thất bại</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Summary Footer */}
      <div className="p-space-md bg-surface-container-low border-t border-outline-variant/60 flex flex-col gap-space-xs">
        <div className="flex items-center justify-between text-on-surface-variant font-label-xs text-label-xs">
          <span className="font-medium">Dung lượng tài nguyên</span>
          <span className="text-on-surface font-semibold font-mono">{totalMB} MB / {maxStorageMB} MB</span>
        </div>
        <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
          <div
            className="bg-primary h-full rounded-full transition-all duration-500 shimmer-sweep"
            style={{ width: `${storagePercent}%` }}
          ></div>
        </div>
        <div className="flex items-center justify-between pt-1 font-label-xs text-label-xs text-outline">
          <span>{documents.length} Tài liệu</span>
          <span className="flex items-center gap-1 font-medium">
            <span className="text-emerald-600 font-semibold">{readyCount} Sẵn sàng</span> •{' '}
            <span className="text-primary font-semibold">{procCount} Đang xử lý</span> •{' '}
            <span className="text-rose-600 font-semibold">{failCount} Lỗi</span>
          </span>
        </div>
      </div>
    </aside>
  );
}
