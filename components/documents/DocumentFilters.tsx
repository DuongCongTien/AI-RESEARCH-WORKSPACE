'use client';

import React from 'react';

interface DocumentFiltersProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  typeFilter: string;
  onTypeFilterChange: (t: string) => void;
  statusFilter: string;
  onStatusFilterChange: (s: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
}

export function DocumentFilters({
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortChange,
}: DocumentFiltersProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-space-sm pt-2">
      {/* Search Input */}
      <div className="md:col-span-6 relative">
        <span className="material-symbols-outlined absolute left-3.5 top-2.5 text-[19px] text-primary pointer-events-none">
          search
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm kiếm tài liệu theo tên, thẻ hoặc nội dung..."
          className="w-full bg-surface pl-10 pr-4 py-2 rounded-xl text-on-surface font-body-sm text-body-sm placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs border border-outline-variant/60"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-2.5 text-outline hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        )}
      </div>

      {/* Type Filter */}
      <div className="md:col-span-2">
        <div className="relative w-full">
          <select
            value={typeFilter}
            onChange={(e) => onTypeFilterChange(e.target.value)}
            className="w-full bg-surface px-3 py-2 rounded-xl text-on-surface font-body-sm text-body-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer border border-outline-variant/60 shadow-xs transition-all"
          >
            <option value="all">Định dạng: Tất cả</option>
            <option value="pdf">Tài liệu PDF (.pdf)</option>
            <option value="docx">Tệp Word (.docx)</option>
            <option value="txt">Văn bản thuần (.txt)</option>
          </select>
          <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-[16px] text-outline pointer-events-none">
            unfold_more
          </span>
        </div>
      </div>

      {/* Status Filter */}
      <div className="md:col-span-2">
        <div className="relative w-full">
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="w-full bg-surface px-3 py-2 rounded-xl text-on-surface font-body-sm text-body-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer border border-outline-variant/60 shadow-xs transition-all"
          >
            <option value="all">Trạng thái: Tất cả</option>
            <option value="ready">Sẵn sàng (Đã chỉ mục)</option>
            <option value="processing">Đang xử lý</option>
            <option value="uploading">Đang tải lên</option>
            <option value="failed">Thất bại</option>
          </select>
          <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-[16px] text-outline pointer-events-none">
            unfold_more
          </span>
        </div>
      </div>

      {/* Sort By */}
      <div className="md:col-span-2">
        <div className="relative w-full">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full bg-surface px-3 py-2 rounded-xl text-on-surface font-body-sm text-body-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer border border-outline-variant/60 shadow-xs transition-all"
          >
            <option value="date">Sắp xếp: Ngày thêm</option>
            <option value="size">Sắp xếp: Dung lượng tệp</option>
            <option value="quality">Sắp xếp: Chất lượng chỉ mục</option>
            <option value="title">Sắp xếp: Tiêu đề (A-Z)</option>
          </select>
          <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-[16px] text-outline pointer-events-none">
            sort
          </span>
        </div>
      </div>
    </div>
  );
}
