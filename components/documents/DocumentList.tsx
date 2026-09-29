'use client';

import React, { useState } from 'react';
import { DocumentItem } from '@/types';
import { DocumentCard } from './DocumentCard';
import { DocumentUpload } from './DocumentUpload';
import { Search, FolderOpen } from 'lucide-react';

interface DocumentListProps {
  documents: DocumentItem[];
  selectedDocumentIds: string[];
  onToggleSelect: (id: string) => void;
  onUploaded: (doc: DocumentItem | DocumentItem[]) => void;
  onDelete: (id: string) => void;
}

export function DocumentList({
  documents,
  selectedDocumentIds,
  onToggleSelect,
  onUploaded,
  onDelete,
}: DocumentListProps) {
  const [search, setSearch] = useState('');

  const filteredDocs = documents.filter((doc) =>
    doc.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-3">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Lọc tệp trong không gian..."
          className="w-full rounded-md border border-border bg-background py-1.5 pl-8 pr-3 text-xs placeholder:text-muted-foreground focus:border-primary focus:outline-none"
        />
      </div>

      {/* Upload trigger button */}
      <DocumentUpload onUploaded={onUploaded} compact />

      {/* Documents List */}
      <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
        {filteredDocs.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/70 p-4 text-center">
            <FolderOpen className="h-6 w-6 text-muted-foreground/60 mb-1" />
            <p className="text-xs text-muted-foreground font-medium">Chưa có tài liệu nào</p>
            <p className="text-[11px] text-muted-foreground/80">
              Đính kèm tệp PDF hoặc văn bản để cung cấp ngữ cảnh nghiên cứu
            </p>
          </div>
        ) : (
          filteredDocs.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              isSelected={selectedDocumentIds.includes(doc.id)}
              onToggleSelect={onToggleSelect}
              onDelete={onDelete}
            />
          ))
        )}
      </div>

      {documents.length > 0 && (
        <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/50 pt-2">
          <span>
            Đã chọn {selectedDocumentIds.length} / {documents.length} tài liệu
          </span>
          {selectedDocumentIds.length > 0 && (
            <span className="text-primary font-medium">Đang dùng trong ngữ cảnh AI</span>
          )}
        </div>
      )}
    </div>
  );
}
