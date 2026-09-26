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
          placeholder="Search documents by name, tag, or content..."
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
            <option value="all">Type: All Types</option>
            <option value="pdf">PDF Document (.pdf)</option>
            <option value="docx">Word File (.docx)</option>
            <option value="txt">Plain Text (.txt)</option>
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
            <option value="all">Status: All Statuses</option>
            <option value="ready">Ready (Indexed)</option>
            <option value="processing">Processing</option>
            <option value="uploading">Uploading</option>
            <option value="failed">Failed</option>
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
            <option value="date">Sort: Date Added</option>
            <option value="size">Sort: File Size</option>
            <option value="quality">Sort: Index Quality</option>
            <option value="title">Sort: Title (A-Z)</option>
          </select>
          <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-[16px] text-outline pointer-events-none">
            sort
          </span>
        </div>
      </div>
    </div>
  );
}
