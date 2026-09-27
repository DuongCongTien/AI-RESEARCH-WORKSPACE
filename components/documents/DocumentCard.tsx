'use client';

import React from 'react';
import { DocumentItem } from '@/types';

interface DocumentCardProps {
  document: DocumentItem;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onPreview?: (doc: DocumentItem) => void;
  onToggleContext?: (id: string, inContext: boolean) => void;
  onRetry?: (id: string) => void;
  onCancel?: (id: string) => void;
  onInspectChunks?: (doc: DocumentItem) => void;
  onDelete?: (id: string) => void;
}

export function DocumentCard({
  document: doc,
  isSelected,
  onToggleSelect,
  onPreview = () => {},
  onToggleContext,
  onRetry,
  onCancel,
  onInspectChunks,
  onDelete,
}: DocumentCardProps) {
  const fileSizeMB = doc.fileSize
    ? doc.fileSize > 1024 * 1024
      ? `${(doc.fileSize / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(doc.fileSize / 1024)} KB`
    : '2.4 MB';

  // CARD 1: READY STATE
  if (doc.status === 'ready') {
    return (
      <div className="p-space-lg rounded-2xl bg-surface border border-outline-variant/60 shadow-xs hover:shadow-xl hover:shadow-primary/5 hover:border-primary/40 -translate-y-0 hover:-translate-y-1 transition-all duration-300 card-interactive flex flex-col justify-between group">
        <div>
          {/* Card Header */}
          <div className="flex items-start justify-between gap-space-sm">
            <div className="flex items-center gap-space-sm min-w-0">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onToggleSelect(doc.id)}
                className="w-4 h-4 rounded bg-surface-container-high accent-primary cursor-pointer mt-0.5"
              />
              <div className="p-2 rounded-xl bg-tertiary/10 text-tertiary shrink-0 border border-tertiary/20">
                <span className="material-symbols-outlined text-[20px]">
                  {doc.fileType === 'pdf' ? 'picture_as_pdf' : doc.fileType === 'docx' ? 'description' : 'text_snippet'}
                </span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-space-xs">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface truncate font-semibold">{doc.name}</h3>
                  <span className="font-label-xs text-label-xs px-1.5 py-0.5 rounded-md bg-surface-container-high text-outline uppercase font-semibold">
                    {doc.fileType || 'PDF'}
                  </span>
                </div>
                <p className="font-label-xs text-label-xs text-outline mt-0.5 truncate">
                  {doc.uploadedAt ? `Được tải lên ${doc.uploadedAt}` : 'Vừa tải lên'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-space-xs shrink-0">
              <span className="inline-flex items-center gap-1.5 font-label-xs text-label-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-tertiary-container dark:text-on-tertiary font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-status-ripple"></span>
                Sẵn sàng
              </span>
              <button
                type="button"
                className="p-1 text-outline hover:text-on-surface rounded-lg hover:bg-surface-container-high transition-colors"
                title="Tùy chọn"
              >
                <span className="material-symbols-outlined text-[18px]">more_vert</span>
              </button>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-4 gap-space-xs py-space-md mt-space-sm bg-surface-container-low border border-outline-variant/40 rounded-xl px-space-sm text-center">
            <div>
              <span className="font-label-xs text-label-xs text-outline block">Dung lượng</span>
              <span className="font-label-md text-label-md text-on-surface font-semibold">{fileSizeMB}</span>
            </div>
            <div>
              <span className="font-label-xs text-label-xs text-outline block">Số trang</span>
              <span className="font-label-md text-label-md text-on-surface font-semibold">{doc.pages ?? '—'}</span>
            </div>
            <div>
              <span className="font-label-xs text-label-xs text-outline block">Số từ</span>
              <span className="font-label-md text-label-md text-on-surface font-semibold">
                {doc.wordCount ? doc.wordCount.toLocaleString() : '—'}
              </span>
            </div>
            <div>
              <span className="font-label-xs text-label-xs text-outline block">Độ tin cậy chỉ mục</span>
              <span className="font-label-md text-label-md text-tertiary font-semibold">
                {doc.indexHealth ? `${doc.indexHealth}%` : '—'}
              </span>
            </div>
          </div>

          {/* Context Toggle Bar */}
          <div className="flex items-center justify-between mt-space-md p-space-sm rounded-xl bg-surface-container-low border border-outline-variant/40">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-primary text-[18px] animate-subtle-pulse">psychology</span>
              <span className="font-body-sm text-body-sm text-on-surface font-medium">Được đưa vào ngữ cảnh AI</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={doc.inContext !== false}
                onChange={(e) => onToggleContext && onToggleContext(doc.id, e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-surface peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
            </label>
          </div>
        </div>

        {/* Card Actions */}
        <div className="flex items-center justify-between gap-space-xs pt-space-lg mt-space-sm border-t border-outline-variant/40">
          <button
            type="button"
            onClick={() => onPreview(doc)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container-high hover:bg-primary hover:text-white text-on-surface font-body-sm text-body-sm transition-all duration-200 shadow-2xs active:scale-95 group/btn"
          >
            <span className="material-symbols-outlined text-[16px] text-tertiary group-hover/btn:text-white transition-colors">visibility</span>
            Xem nội dung
          </button>
          <div className="flex items-center gap-space-xs">
            <button
              type="button"
              onClick={() => onInspectChunks ? onInspectChunks(doc) : onPreview(doc)}
              className="px-3 py-1.5 rounded-xl bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface font-body-sm text-body-sm border border-outline-variant/40 transition-all duration-200 active:scale-95"
            >
              Xem đoạn trích
            </button>
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(doc.id)}
                className="p-1.5 rounded-xl bg-surface-container-low hover:bg-rose-500/10 text-on-surface-variant hover:text-rose-600 border border-outline-variant/40 transition-colors active:scale-95 cursor-pointer"
                title="Xóa tài liệu"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // CARD 2: PROCESSING STATE
  if (doc.status === 'processing') {
    const progress = doc.progress || 42;
    return (
      <div className="p-space-lg rounded-2xl bg-surface border border-outline-variant/60 shadow-xs hover:shadow-xl hover:shadow-primary/5 hover:border-primary/40 -translate-y-0 hover:-translate-y-1 transition-all duration-300 card-interactive flex flex-col justify-between group">
        <div>
          {/* Card Header */}
          <div className="flex items-start justify-between gap-space-sm">
            <div className="flex items-center gap-space-sm min-w-0">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onToggleSelect(doc.id)}
                className="w-4 h-4 rounded bg-surface-container-high accent-primary cursor-pointer mt-0.5"
              />
              <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0 border border-primary/20">
                <span className="material-symbols-outlined text-[20px]">description</span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-space-xs">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface truncate font-semibold">{doc.name}</h3>
                  <span className="font-label-xs text-label-xs px-1.5 py-0.5 rounded-md bg-surface-container-high text-outline uppercase font-semibold">
                    {doc.fileType || 'DOCX'}
                  </span>
                </div>
                <p className="font-label-xs text-label-xs text-outline mt-0.5 truncate">
                  {doc.uploadedAt ? `Được tải lên ${doc.uploadedAt}` : 'Vừa tải lên'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-space-xs shrink-0">
              <span className="inline-flex items-center gap-1.5 font-label-xs text-label-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-semibold">
                <span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>
                Đang xử lý {progress}%
              </span>
              <button
                type="button"
                className="p-1 text-outline hover:text-on-surface rounded-lg hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">more_vert</span>
              </button>
            </div>
          </div>

          {/* Real-time extraction progress bar */}
          <div className="mt-space-md p-space-sm bg-surface-container-low border border-outline-variant/40 rounded-xl flex flex-col gap-1.5">
            <div className="flex items-center justify-between font-label-xs text-label-xs">
              <span className="text-on-surface font-semibold">
                {doc.step || 'Đang trích xuất nội dung văn bản & bảng biểu...'}
              </span>
              <span className="text-primary font-mono font-semibold">Bước 2 / 4</span>
            </div>
            <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all duration-500 shimmer-sweep"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between font-label-xs text-label-xs text-outline pt-0.5">
              <span>Đường ống véc-tơ: Cohere-Embed-v3</span>
              <span>{doc.timeRemaining || 'Dự kiến còn: 24 giây'}</span>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-3 gap-space-xs py-space-sm mt-space-sm bg-surface-container-low border border-outline-variant/40 rounded-xl px-space-sm text-center">
            <div>
              <span className="font-label-xs text-label-xs text-outline block">Dung lượng</span>
              <span className="font-label-md text-label-md text-on-surface font-semibold">{fileSizeMB}</span>
            </div>
            <div>
              <span className="font-label-xs text-label-xs text-outline block">Số trang ước tính</span>
              <span className="font-label-md text-label-md text-on-surface font-semibold">{doc.pages || 28}</span>
            </div>
            <div>
              <span className="font-label-xs text-label-xs text-outline block">Trạng thái nhúng</span>
              <span className="font-label-md text-label-md text-primary font-semibold">Đang chờ</span>
            </div>
          </div>

          {/* Context Toggle Bar */}
          <div className="flex items-center justify-between mt-space-md p-space-sm rounded-xl bg-surface-container-low border border-outline-variant/40">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-outline text-[18px]">auto_awesome</span>
              <span className="font-body-sm text-body-sm text-on-surface font-medium">Tự động đưa vào khi xử lý xong</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={doc.inContext !== false}
                onChange={(e) => onToggleContext && onToggleContext(doc.id, e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-surface peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
            </label>
          </div>
        </div>

        {/* Card Actions */}
        <div className="flex items-center justify-between gap-space-xs pt-space-lg mt-space-sm border-t border-outline-variant/40">
          <button
            type="button"
            onClick={() => onPreview(doc)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface font-body-sm text-body-sm transition-all shadow-2xs active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px] text-primary">terminal</span>
            Xem luồng trích xuất
          </button>
          <button
            type="button"
            onClick={() => onCancel && onCancel(doc.id)}
            className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-body-sm text-body-sm font-medium transition-all active:scale-95"
          >
            Hủy tác vụ
          </button>
        </div>
      </div>
    );
  }

  // CARD 3: UPLOADING STATE
  if (doc.status === 'uploading') {
    const progress = doc.progress || 65;
    return (
      <div className="p-space-lg rounded-2xl bg-surface border border-outline-variant/60 shadow-xs hover:shadow-xl hover:shadow-primary/5 hover:border-primary/40 -translate-y-0 hover:-translate-y-1 transition-all duration-300 card-interactive flex flex-col justify-between group">
        <div>
          {/* Card Header */}
          <div className="flex items-start justify-between gap-space-sm">
            <div className="flex items-center gap-space-sm min-w-0">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onToggleSelect(doc.id)}
                className="w-4 h-4 rounded bg-surface-container-high accent-primary cursor-pointer mt-0.5"
              />
              <div className="p-2 rounded-xl bg-secondary/10 text-secondary shrink-0 border border-secondary/20">
                <span className="material-symbols-outlined text-[20px]">text_snippet</span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-space-xs">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface truncate font-semibold">{doc.name}</h3>
                  <span className="font-label-xs text-label-xs px-1.5 py-0.5 rounded-md bg-surface-container-high text-outline uppercase font-semibold">
                    {doc.fileType || 'TXT'}
                  </span>
                </div>
                <p className="font-label-xs text-label-xs text-outline mt-0.5 truncate">
                  Đang tải lên từ thiết bị
                </p>
              </div>
            </div>
            <div className="flex items-center gap-space-xs shrink-0">
              <span className="inline-flex items-center gap-1.5 font-label-xs text-label-xs px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
                Đang tải lên {progress}%
              </span>
              <button
                type="button"
                className="p-1 text-outline hover:text-on-surface rounded-lg hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">more_vert</span>
              </button>
            </div>
          </div>

          {/* Upload progress visual */}
          <div className="mt-space-md p-space-sm bg-surface-container-low border border-outline-variant/40 rounded-xl flex flex-col gap-1.5">
            <div className="flex items-center justify-between font-label-xs text-label-xs">
              <span className="text-on-surface font-semibold">Đã chuyển 273 KB / 420 KB</span>
              <span className="text-secondary font-mono font-semibold">{doc.transferRate || '1.2 MB/s'}</span>
            </div>
            <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
              <div
                className="bg-secondary h-full rounded-full transition-all duration-300 shimmer-sweep"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between font-label-xs text-label-xs text-outline pt-0.5">
              <span>Đường truyền trực tiếp bảo mật</span>
              <span>Còn ~2 giây</span>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-3 gap-space-xs py-space-sm mt-space-sm bg-surface-container-low border border-outline-variant/40 rounded-xl px-space-sm text-center">
            <div>
              <span className="font-label-xs text-label-xs text-outline block">Tổng dung lượng</span>
              <span className="font-label-md text-label-md text-on-surface font-semibold">{fileSizeMB}</span>
            </div>
            <div>
              <span className="font-label-xs text-label-xs text-outline block">Số trang tương đương</span>
              <span className="font-label-md text-label-md text-on-surface font-semibold">{doc.pages || 4} Trang</span>
            </div>
            <div>
              <span className="font-label-xs text-label-xs text-outline block">Số từ ước tính</span>
              <span className="font-label-md text-label-md text-on-surface font-semibold">
                {(doc.wordCount || 3120).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Card Actions */}
        <div className="flex items-center justify-between gap-space-xs pt-space-lg mt-space-sm border-t border-outline-variant/40">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface font-body-sm text-body-sm transition-all shadow-2xs active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px]">pause</span>
            Tạm dừng
          </button>
          <button
            type="button"
            onClick={() => onPreview(doc)}
            className="px-3 py-1.5 rounded-xl bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface font-body-sm text-body-sm border border-outline-variant/40 transition-all active:scale-95"
          >
            Xem bản nháp
          </button>
        </div>
      </div>
    );
  }

  // CARD 4: FAILED STATE
  return (
    <div className="p-space-lg rounded-2xl bg-surface border border-rose-200 dark:border-rose-900/40 shadow-xs hover:shadow-xl hover:border-rose-400 -translate-y-0 hover:-translate-y-1 transition-all duration-300 card-interactive flex flex-col justify-between group">
      <div>
        {/* Card Header */}
        <div className="flex items-start justify-between gap-space-sm">
          <div className="flex items-center gap-space-sm min-w-0">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleSelect(doc.id)}
              className="w-4 h-4 rounded bg-surface-container-high accent-primary cursor-pointer mt-0.5"
            />
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600 shrink-0 border border-rose-200">
              <span className="material-symbols-outlined text-[20px]">error_outline</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-space-xs">
                <h3 className="font-headline-sm text-headline-sm text-rose-600 truncate font-semibold">{doc.name}</h3>
                <span className="font-label-xs text-label-xs px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-600 border border-rose-200 uppercase font-semibold">
                  LỖI TỆP
                </span>
              </div>
              <p className="font-label-xs text-label-xs text-outline mt-0.5 truncate">
                Quá trình nạp dừng {doc.uploadedAt || '14 phút trước'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-space-xs shrink-0">
            <span className="inline-flex items-center gap-1.5 font-label-xs text-label-xs px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-200 font-semibold">
              <span className="material-symbols-outlined text-[14px]">warning</span>
              Thất bại
            </span>
            <button
              type="button"
              className="p-1 text-outline hover:text-on-surface rounded-lg hover:bg-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">more_vert</span>
            </button>
          </div>
        </div>

        {/* Error Banner */}
        <div className="mt-space-md p-space-sm rounded-xl bg-rose-50/70 border border-rose-200 flex flex-col gap-1">
          <div className="flex items-center gap-space-xs text-rose-700 font-label-sm text-label-sm font-semibold">
            <span className="material-symbols-outlined text-[16px]">attribution</span>
            {doc.errorMsg || 'Phân tích tiêu đề thất bại (magic byte không hợp lệ)'}
          </div>
          <p className="font-body-sm text-body-sm text-rose-900/80 leading-relaxed">
            Bộ phân tích gặp cấu trúc tệp không thể đọc được. Vui lòng kiểm tra định dạng tệp trước khi gửi lại.
          </p>
        </div>

        {/* Diagnostics Metrics */}
        <div className="grid grid-cols-2 gap-space-xs py-space-sm mt-space-sm bg-surface-container-low border border-outline-variant/40 rounded-xl px-space-sm text-center">
          <div>
            <span className="font-label-xs text-label-xs text-outline block">Loại tệp nhận diện</span>
            <span className="font-label-md text-label-md text-on-surface font-semibold">Dữ liệu nhị phân lỗi</span>
          </div>
          <div>
            <span className="font-label-xs text-label-xs text-outline block">Mã lỗi</span>
            <span className="font-label-md text-label-md text-rose-600 font-mono font-semibold">
              {doc.errorCode || 'ERR_PDF_MAGIC_0x00'}
            </span>
          </div>
        </div>
      </div>

      {/* Card Actions */}
      <div className="flex items-center justify-between gap-space-xs pt-space-lg mt-space-sm border-t border-outline-variant/40">
        <button
          type="button"
          onClick={() => onRetry && onRetry(doc.id)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface font-body-sm text-body-sm transition-all shadow-2xs active:scale-95"
        >
          <span className="material-symbols-outlined text-[16px] text-tertiary">replay</span>
          Thử xử lý lại
        </button>
        <button
          type="button"
          onClick={() => onRetry && onRetry(doc.id)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary hover:bg-primary-fixed text-on-primary font-body-sm text-body-sm font-semibold transition-all shadow-xs active:scale-95"
        >
          <span className="material-symbols-outlined text-[16px]">file_upload</span>
          Thay thế tệp
        </button>
      </div>
    </div>
  );
}
