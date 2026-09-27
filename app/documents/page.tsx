'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { ActiveCorpusRail } from '@/components/documents/ActiveCorpusRail';
import { DocumentCard } from '@/components/documents/DocumentCard';
import { DocumentFilters } from '@/components/documents/DocumentFilters';
import { DocumentToolbar } from '@/components/documents/DocumentToolbar';
import { DocumentPreviewDrawer } from '@/components/documents/DocumentPreviewDrawer';
import { UploadDialog } from '@/components/documents/UploadDialog';
import { DocumentItem } from '@/types';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch documents from backend on mount
  useEffect(() => {
    async function loadBackendDocs() {
      try {
        const res = await fetch('/api/documents');
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            setDocuments(json.data);
            setSelectedIds(json.data.map((d: DocumentItem) => d.id));
            if (json.data.length > 0) setPreviewDoc(json.data[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load documents:', err);
      } finally {
        setLoading(false);
      }
    }

    loadBackendDocs();
  }, []);

  // Filter and sort documents
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = doc.name.toLowerCase().includes(q);
        const matchesType = doc.fileType.toLowerCase().includes(q);
        const matchesText = doc.textContent?.toLowerCase().includes(q);
        if (!matchesName && !matchesType && !matchesText) return false;
      }
      if (typeFilter !== 'all') {
        if (typeFilter === 'pdf' && !doc.fileType.toLowerCase().includes('pdf')) return false;
        if (typeFilter === 'docx' && !doc.fileType.toLowerCase().includes('doc')) return false;
        if (typeFilter === 'txt' && !doc.fileType.toLowerCase().includes('txt')) return false;
      }
      if (statusFilter !== 'all' && doc.status !== statusFilter) return false;
      return true;
    }).sort((a, b) => {
      if (sortBy === 'size') return (b.fileSize || 0) - (a.fileSize || 0);
      if (sortBy === 'quality') return (b.indexHealth || 0) - (a.indexHealth || 0);
      if (sortBy === 'title') return a.name.localeCompare(b.name);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [documents, searchQuery, typeFilter, statusFilter, sortBy]);

  // Bulk Selection Handlers
  const handleToggleSelectDoc = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((dId) => dId !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredDocuments.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredDocuments.map((d) => d.id));
    }
  };

  const handleRemoveSelected = async () => {
    if (selectedIds.length === 0) return;
    const confirmDelete = window.confirm(`Xóa ${selectedIds.length} tài liệu đã chọn khỏi không gian nghiên cứu?`);
    if (!confirmDelete) return;

    for (const id of selectedIds) {
      try {
        await fetch(`/api/documents?id=${id}`, { method: 'DELETE' });
      } catch (e) {
        console.error('Delete document error:', e);
      }
    }

    setDocuments((prev) => prev.filter((d) => !selectedIds.includes(d.id)));
    setSelectedIds([]);
    if (previewDoc && selectedIds.includes(previewDoc.id)) {
      setIsPreviewOpen(false);
      setPreviewDoc(null);
    }
  };

  const handleToggleContextAll = () => {
    const allInContext = filteredDocuments.every((d) => d.inContext !== false);
    const newContextState = !allInContext;
    setDocuments((prev) =>
      prev.map((doc) =>
        filteredDocuments.some((fd) => fd.id === doc.id)
          ? { ...doc, inContext: newContextState }
          : doc
      )
    );
  };

  const handleToggleContext = (id: string, inContext: boolean) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, inContext } : d))
    );
  };

  const handleSyncVectorStore = async () => {
    setIsSyncing(true);
    setSyncFeedback('Đang đồng bộ hóa dữ liệu nhúng với cơ sở dữ liệu véc-tơ...');
    const totalTokens = documents.reduce((sum, d) => sum + (d.tokensCount || 0), 0);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncFeedback(`Kho lưu trữ véc-tơ đã đồng bộ. ${totalTokens.toLocaleString()} token đã làm mới.`);
      setTimeout(() => setSyncFeedback(null), 4000);
    }, 1500);
  };

  const handleRetryProcessing = (id: string) => {
    setDocuments((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          return {
            ...d,
            status: 'processing',
            progress: 15,
            step: 'Đang khởi tạo lại OCR và mã hóa văn bản...',
            errorMsg: null,
            errorCode: null,
          };
        }
        return d;
      })
    );

    setTimeout(() => {
      setDocuments((prev) =>
        prev.map((d) => {
          if (d.id === id) {
            return {
              ...d,
              status: 'ready',
              progress: 100,
              step: 'Đã hoàn thành',
            };
          }
          return d;
        })
      );
    }, 3000);
  };

  const handleCancelTask = (id: string) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: 'failed', errorMsg: 'Bị hủy bởi người dùng.' } : d))
    );
  };

  const handleOpenPreview = (doc: DocumentItem) => {
    setPreviewDoc(doc);
    setIsPreviewOpen(true);
  };

  return (
    <AppShell>
      <div className="flex flex-1 w-full min-h-[calc(100vh-4rem)] bg-surface text-on-surface">
        {/* LEFT DOCUMENT STATUS RAIL */}
        <div className="hidden md:block">
          <ActiveCorpusRail
            documents={documents}
            selectedDocId={previewDoc?.id}
            onSelectDoc={(id) => {
              const found = documents.find((d) => d.id === id);
              if (found) handleOpenPreview(found);
            }}
            onRetryDoc={handleRetryProcessing}
          />
        </div>

        {/* CENTER MAIN WORKSPACE */}
        <div className="flex-1 flex flex-col min-w-0 bg-surface">
          {/* Workspace Viewport Header */}
          <div className="px-4 lg:px-space-xl py-space-lg flex flex-col gap-space-md bg-surface-container-lowest border-b border-outline-variant/20">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-sm">
              <div>
                <div className="flex items-center gap-space-sm">
                  <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
                    Tài liệu không gian làm việc
                  </h1>
                  <span className="font-label-xs text-label-xs px-2.5 py-0.5 rounded-full bg-surface-container-high text-tertiary border border-outline-variant/30">
                    {documents.length} tệp đã tải lên
                  </span>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                  Quản lý chỉ mục tài liệu, bật/tắt tệp ngữ cảnh cho mô hình AI và kiểm tra tình trạng trích xuất.
                </p>
              </div>

              {/* Top Action Buttons */}
              <div className="flex items-center gap-space-sm shrink-0">
                <button
                  type="button"
                  onClick={handleSyncVectorStore}
                  disabled={isSyncing}
                  className="inline-flex items-center gap-space-xs px-space-md py-2 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-body-sm text-body-sm transition-all shadow-sm border border-outline-variant/30"
                >
                  <span className={`material-symbols-outlined text-[16px] ${isSyncing ? 'animate-spin' : ''}`}>
                    sync
                  </span>
                  {isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ hóa véc-tơ'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(true)}
                  className="inline-flex items-center gap-space-xs px-space-md py-2 rounded-lg bg-primary hover:bg-primary-fixed text-on-primary font-body-sm text-body-sm font-medium transition-all shadow-md"
                >
                  <span className="material-symbols-outlined text-[16px]">cloud_upload</span>
                  Tải thêm tài liệu
                </button>
              </div>
            </div>

            {/* Sync Feedback Toast */}
            {syncFeedback && (
              <div className="p-2 bg-surface-container-high text-tertiary text-xs rounded-lg flex items-center gap-2 border border-tertiary/30 animate-pulse">
                <span className="material-symbols-outlined text-[16px]">done_all</span>
                <span>{syncFeedback}</span>
              </div>
            )}

            {/* Filter & Search Omnibar */}
            <DocumentFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              typeFilter={typeFilter}
              onTypeFilterChange={setTypeFilter}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />

            {/* Action Bar Toolbar & Stats Pill */}
            <DocumentToolbar
              allSelected={selectedIds.length === filteredDocuments.length && filteredDocuments.length > 0}
              selectedCount={selectedIds.length}
              totalCount={filteredDocuments.length}
              onToggleSelectAll={handleToggleSelectAll}
              onRemoveSelected={handleRemoveSelected}
              onToggleContextAll={handleToggleContextAll}
              embeddingModel="text-embedding-3-large"
              tokensIndexed={documents.reduce((sum, d) => sum + (d.tokensCount || 0), 0)}
            />
          </div>

          {/* CARDS GRID */}
          <div className="p-4 lg:p-space-xl flex-1 overflow-y-auto">
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <span className="material-symbols-outlined text-[32px] text-outline animate-spin">progress_activity</span>
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-8 bg-surface-container-low rounded-2xl border border-outline-variant/20">
                <span className="material-symbols-outlined text-[48px] text-outline mb-2">
                  {documents.length === 0 ? 'cloud_upload' : 'find_in_page'}
                </span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">
                  {documents.length === 0 ? 'Chưa có tài liệu nào' : 'Không tìm thấy tài liệu'}
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm mt-1">
                  {documents.length === 0
                    ? 'Tải tài liệu lên để bắt đầu nghiên cứu.'
                    : 'Không có tài liệu nào khớp với tiêu chí lọc. Hãy thử xóa bộ lọc.'}
                </p>
                {documents.length === 0 ? (
                  <button
                    type="button"
                    onClick={() => setIsUploadOpen(true)}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-on-primary font-body-sm text-body-sm font-semibold hover:bg-primary/90 transition-all shadow-xs cursor-pointer active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[16px]">cloud_upload</span>
                    Tải tài liệu lên
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => { setSearchQuery(''); setTypeFilter('all'); setStatusFilter('all'); }}
                    className="mt-4 px-4 py-1.5 rounded-lg bg-surface-container-high text-primary text-xs hover:bg-surface-bright"
                  >
                    Xóa bộ lọc
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-space-lg">
                {filteredDocuments.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    document={doc}
                    isSelected={selectedIds.includes(doc.id)}
                    onToggleSelect={handleToggleSelectDoc}
                    onPreview={handleOpenPreview}
                    onToggleContext={handleToggleContext}
                    onRetry={handleRetryProcessing}
                    onCancel={handleCancelTask}
                    onInspectChunks={handleOpenPreview}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* QUICK PREVIEW DRAWER (Docked on Right) */}
        <DocumentPreviewDrawer
          document={previewDoc}
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
        />
      </div>

      {/* Upload Dialog Modal */}
      {isUploadOpen && (
        <UploadDialog
          isOpen={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
          onUploaded={(newDoc) => {
            setDocuments((prev) => [newDoc, ...prev]);
            setSelectedIds((prev) => [...prev, newDoc.id]);
            setPreviewDoc(newDoc);
            setIsUploadOpen(false);
          }}
        />
      )}
    </AppShell>
  );
}
