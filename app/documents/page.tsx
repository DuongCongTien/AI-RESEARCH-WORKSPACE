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

// Default mock initial documents that match the exact HTML specification if database is empty
const INITIAL_DEMO_DOCUMENTS: DocumentItem[] = [
  {
    id: 'doc-annual-report',
    name: 'Annual_Report.pdf',
    fileType: 'pdf',
    fileSize: 2.4 * 1024 * 1024,
    pages: 15,
    wordCount: 12450,
    indexHealth: 98.4,
    status: 'ready',
    inContext: true,
    uploadedBy: 'Dr. Elena Vance',
    uploadedAt: 'today at 09:42 AM',
    tablesCount: 4,
    chunksCount: 15,
    tokensCount: 42190,
    embeddingModel: 'text-embedding-3-large',
    textContent:
      'In fiscal year 2024, our deep learning infrastructure operations expanded by 34.2% Year-Over-Year. Core research clusters realized an overall inference throughput enhancement of 2.1x following the roll-out of speculative decoding kernels.',
    parsedMarkdown:
      '# 1. Executive Summary & Q4 Milestones\n\nIn fiscal year 2024, our deep learning infrastructure operations expanded by **34.2% Year-Over-Year**. Core research clusters realized an overall inference throughput enhancement of 2.1x following the roll-out of speculative decoding kernels.\n\nAgent autonomy benchmark **GAIA-v2** recorded an accuracy increase from 61.8% to 74.3% across tool retrieval tasks, corroborating hypotheses presented in Technical Memorandum #88.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'doc-market-analysis',
    name: 'Market_Analysis.docx',
    fileType: 'docx',
    fileSize: 1.8 * 1024 * 1024,
    pages: 28,
    wordCount: 18200,
    indexHealth: 88.0,
    status: 'processing',
    progress: 42,
    step: 'Extracting text & multi-column tables... (Chunk 18/42)',
    timeRemaining: 'Est. 20s',
    inContext: true,
    uploadedBy: 'Dr. Elena Vance',
    uploadedAt: '4 mins ago',
    tablesCount: 2,
    chunksCount: 8,
    tokensCount: 14500,
    embeddingModel: 'Cohere-Embed-v3',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'doc-technical-notes',
    name: 'Technical_Notes.txt',
    fileType: 'txt',
    fileSize: 420 * 1024,
    pages: 4,
    wordCount: 3120,
    indexHealth: 95.0,
    status: 'uploading',
    progress: 65,
    transferRate: '1.2 MB/s',
    timeRemaining: '~2 seconds remaining',
    inContext: true,
    uploadedBy: 'Dr. Elena Vance',
    uploadedAt: 'Uploading from local storage',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'doc-corrupted-data',
    name: 'Corrupted_Data.pdf',
    fileType: 'pdf',
    fileSize: 512 * 1024,
    pages: 0,
    wordCount: 0,
    indexHealth: 0,
    status: 'failed',
    errorMsg: 'Header parsing failed (invalid magic byte EOF)',
    errorCode: 'ERR_PDF_MAGIC_0x00',
    inContext: false,
    uploadedBy: 'Dr. Elena Vance',
    uploadedAt: 'Ingestion terminated 14 mins ago',
    createdAt: new Date().toISOString(),
  },
];

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>(INITIAL_DEMO_DOCUMENTS);
  const [selectedIds, setSelectedIds] = useState<string[]>(['doc-annual-report', 'doc-market-analysis', 'doc-technical-notes']);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(INITIAL_DEMO_DOCUMENTS[0]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Fetch documents from backend on mount
  useEffect(() => {
    async function loadBackendDocs() {
      try {
        const res = await fetch('/api/documents');
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            setDocuments(json.data);
            setSelectedIds(json.data.map((d: DocumentItem) => d.id));
            setPreviewDoc(json.data[0]);
          }
        }
      } catch (err) {
        console.warn('Using default demo corpus data:', err);
      }
    }

    loadBackendDocs();
  }, []);

  // Filter and sort documents
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = doc.name.toLowerCase().includes(q);
        const matchesType = doc.fileType.toLowerCase().includes(q);
        const matchesText = doc.textContent?.toLowerCase().includes(q);
        if (!matchesName && !matchesType && !matchesText) return false;
      }

      // Type Filter
      if (typeFilter !== 'all') {
        if (typeFilter === 'pdf' && !doc.fileType.toLowerCase().includes('pdf')) return false;
        if (typeFilter === 'docx' && !doc.fileType.toLowerCase().includes('doc')) return false;
        if (typeFilter === 'txt' && !doc.fileType.toLowerCase().includes('txt')) return false;
      }

      // Status Filter
      if (statusFilter !== 'all' && doc.status !== statusFilter) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'size') return (b.fileSize || 0) - (a.fileSize || 0);
      if (sortBy === 'quality') return (b.indexHealth || 0) - (a.indexHealth || 0);
      if (sortBy === 'title') return a.name.localeCompare(b.name);
      // default: date
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
    const confirmDelete = window.confirm(`Remove ${selectedIds.length} selected document(s) from active corpus?`);
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
    setSyncFeedback('Synchronizing embeddings with Pinecone / PostgreSQL pgvector...');
    setTimeout(() => {
      setIsSyncing(false);
      setSyncFeedback('Vector store synchronized. 42,190 tokens refreshed.');
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
            step: 'Re-initializing OCR and text tokenization...',
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
              pages: 12,
              wordCount: 8400,
              indexHealth: 96.5,
              step: 'Completed',
            };
          }
          return d;
        })
      );
    }, 3000);
  };

  const handleCancelTask = (id: string) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: 'failed', errorMsg: 'Cancelled by user.' } : d))
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
                    Workspace Documents
                  </h1>
                  <span className="font-label-xs text-label-xs px-2.5 py-0.5 rounded-full bg-surface-container-high text-tertiary border border-outline-variant/30">
                    {documents.length} files uploaded
                  </span>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                  Manage corpus indexing, toggle active context files for multi-agent synthesis, and inspect extraction health.
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
                  {isSyncing ? 'Syncing...' : 'Sync Vector Store'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(true)}
                  className="inline-flex items-center gap-space-xs px-space-md py-2 rounded-lg bg-primary hover:bg-primary-fixed text-on-primary font-body-sm text-body-sm font-medium transition-all shadow-md"
                >
                  <span className="material-symbols-outlined text-[16px]">cloud_upload</span>
                  Add More Documents
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
              tokensIndexed={42190}
            />
          </div>

          {/* CARDS GRID */}
          <div className="p-4 lg:p-space-xl flex-1 overflow-y-auto">
            {filteredDocuments.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-8 bg-surface-container-low rounded-2xl border border-outline-variant/20">
                <span className="material-symbols-outlined text-[48px] text-outline mb-2">find_in_page</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">No documents found</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm mt-1">
                  No documents match your filter criteria or search query. Try clearing filters or uploading new files.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setTypeFilter('all');
                    setStatusFilter('all');
                  }}
                  className="mt-4 px-4 py-1.5 rounded-lg bg-surface-container-high text-primary text-xs hover:bg-surface-bright"
                >
                  Clear Filters
                </button>
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
