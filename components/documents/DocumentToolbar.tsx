'use client';

import React from 'react';

interface DocumentToolbarProps {
  allSelected: boolean;
  selectedCount: number;
  totalCount: number;
  onToggleSelectAll: () => void;
  onRemoveSelected: () => void;
  onToggleContextAll: () => void;
  embeddingModel?: string;
  tokensIndexed?: number;
}

export function DocumentToolbar({
  allSelected,
  selectedCount,
  totalCount,
  onToggleSelectAll,
  onRemoveSelected,
  onToggleContextAll,
  embeddingModel = 'text-embedding-3-large',
  tokensIndexed = 42190,
}: DocumentToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-space-sm pt-2">
      {/* Left: Checkbox & Bulk Actions */}
      <div className="flex items-center gap-space-md">
        <label className="flex items-center gap-space-xs cursor-pointer select-none group">
          <input
            type="checkbox"
            checked={allSelected && totalCount > 0}
            onChange={onToggleSelectAll}
            className="w-4 h-4 rounded bg-surface-container-high accent-primary cursor-pointer transition-transform group-hover:scale-110"
          />
          <span className="font-body-sm text-body-sm text-on-surface font-semibold group-hover:text-primary transition-colors">
            Chọn tất cả ({selectedCount} đã chọn)
          </span>
        </label>

        <div className="h-4 w-[1px] bg-outline-variant/40"></div>

        <button
          type="button"
          onClick={onRemoveSelected}
          disabled={selectedCount === 0}
          className={`inline-flex items-center gap-1.5 font-body-sm text-body-sm px-2.5 py-1 rounded-lg transition-all ${
            selectedCount > 0
              ? 'text-error hover:bg-error-container/20 cursor-pointer hover:shadow-xs active:scale-95'
              : 'text-outline/40 cursor-not-allowed'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">delete</span>
          Xóa các mục đã chọn
        </button>

        <button
          type="button"
          onClick={onToggleContextAll}
          disabled={totalCount === 0}
          className="inline-flex items-center gap-1.5 font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high px-2.5 py-1 rounded-lg transition-all cursor-pointer hover:shadow-xs active:scale-95"
        >
          <span className="material-symbols-outlined text-[16px] text-primary">toggle_on</span>
          Bật/Tắt ngữ cảnh tất cả
        </button>
      </div>

      {/* Right: Stats Pill */}
      <div className="inline-flex items-center gap-space-xs px-3 py-1 rounded-full bg-surface-container-low text-on-surface-variant font-label-xs text-label-xs border border-outline-variant/40 shadow-2xs hover:border-primary/30 transition-colors">
        <span className="material-symbols-outlined text-[14px] text-tertiary">hub</span>
        <span>
          Mô hình: <strong className="text-on-surface font-semibold">{embeddingModel}</strong>
        </span>
        <span className="text-outline">•</span>
        <span>
          <strong className="text-on-surface font-semibold">{tokensIndexed.toLocaleString()}</strong> Token
        </span>
      </div>
    </div>
  );
}
