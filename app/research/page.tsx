'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { DocumentStatus } from '@/components/documents/DocumentStatus';
import { DocumentItem, ChatMessage } from '@/types';
import {
  FileText,
  Upload,
  CheckSquare,
  Square,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';

export default function ResearchPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load documents
  useEffect(() => {
    async function fetchDocuments() {
      try {
        const res = await fetch('/api/documents');
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            setDocuments(json.data);
            // Default select ready documents
            const readyIds = json.data
              .filter((d: DocumentItem) => d.status.toLowerCase() === 'ready')
              .map((d: DocumentItem) => d.id);
            setSelectedDocIds(readyIds);
          }
        }
      } catch (err) {
        console.warn('Failed to load documents for research workspace:', err);
      }
    }
    fetchDocuments();
  }, []);

  const toggleSelectDoc = (id: string) => {
    setSelectedDocIds((prev) =>
      prev.includes(id) ? prev.filter((dId) => dId !== id) : [...prev, id]
    );
    if (errorMessage) setErrorMessage(null);
  };

  const handleSelectAll = () => {
    const allReady = documents
      .filter((d) => d.status.toLowerCase() === 'ready')
      .map((d) => d.id);
    setSelectedDocIds(allReady);
  };

  const handleDeselectAll = () => {
    setSelectedDocIds([]);
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    // Validation: Require at least one document
    if (selectedDocIds.length === 0) {
      setErrorMessage(
        'Please select at least one document above to provide context for your question.'
      );
      return;
    }

    setErrorMessage(null);

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentIds: selectedDocIds,
          message: text,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to synthesize research answer.');
      }

      const assistantMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: json.message || 'No response generated.',
        sources: json.sources || [],
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Research chat error:', err);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Unable to communicate with AI research assistant.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
        {/* Workspace Top Bar */}
        <div className="px-6 py-4 border-b border-border bg-surface/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h1 className="text-lg font-bold text-foreground">
                Research Workspace
              </h1>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Multi-document grounded inquiry &amp; AI synthesis
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/documents"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-surface hover:bg-muted text-xs font-medium text-foreground transition-all cursor-pointer shadow-2xs"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Manage Documents</span>
            </Link>
          </div>
        </div>

        {/* Main Content: Split View between Document Context Rail & Chat Area */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Documents Selection Rail */}
          <aside className="w-full md:w-80 border-b md:border-b-0 md:border-r border-border bg-surface/40 flex flex-col shrink-0 max-h-56 md:max-h-full">
            {/* Rail Header */}
            <div className="p-4 border-b border-border/60 flex items-center justify-between bg-surface/60">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold text-foreground">
                  Context Documents ({selectedDocIds.length}/{documents.length})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-[11px] text-primary hover:underline font-medium cursor-pointer"
                >
                  All
                </button>
                <span className="text-muted-foreground/40">•</span>
                <button
                  type="button"
                  onClick={handleDeselectAll}
                  className="text-[11px] text-muted-foreground hover:text-foreground font-medium cursor-pointer"
                >
                  None
                </button>
              </div>
            </div>

            {/* Document Checklist */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {documents.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-border text-center">
                  <FileText className="w-6 h-6 text-muted-foreground mx-auto mb-1.5" />
                  <p className="text-xs font-medium text-foreground">No documents yet</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 mb-3">
                    Upload documents to ask questions
                  </p>
                  <Link
                    href="/documents"
                    className="inline-flex items-center gap-1 text-xs text-primary font-semibold hover:underline"
                  >
                    Upload Now <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              ) : (
                documents.map((doc) => {
                  const isSelected = selectedDocIds.includes(doc.id);

                  return (
                    <div
                      key={doc.id}
                      onClick={() => toggleSelectDoc(doc.id)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer select-none flex items-start gap-2.5 ${
                        isSelected
                          ? 'bg-primary/5 border-primary/40 shadow-2xs'
                          : 'bg-surface border-border/70 hover:border-border hover:bg-muted/50'
                      }`}
                    >
                      <button
                        type="button"
                        aria-label={`Toggle ${doc.name}`}
                        className="mt-0.5 text-primary shrink-0"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 fill-primary text-primary-foreground" />
                        ) : (
                          <Square className="w-4 h-4 text-muted-foreground/60" />
                        )}
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-medium text-foreground truncate block">
                            {doc.name}
                          </span>
                          <span className="text-[10px] uppercase font-mono px-1 rounded bg-muted text-muted-foreground shrink-0">
                            {doc.fileType}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-1 mt-1 text-[11px] text-muted-foreground">
                          <span>
                            {doc.fileSize
                              ? `${(doc.fileSize / 1024).toFixed(0)} KB`
                              : ''}
                          </span>
                          <DocumentStatus status={doc.status} showIcon={false} />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Selection Guidance */}
            <div className="p-3 border-t border-border/60 bg-surface/50 text-[11px] text-muted-foreground">
              {selectedDocIds.length > 0 ? (
                <span className="text-primary font-medium">
                  ✓ {selectedDocIds.length} document{selectedDocIds.length > 1 ? 's' : ''} injected into prompt
                </span>
              ) : (
                <span className="text-amber-600 dark:text-amber-400">
                  ⚠ Check at least one document to start
                </span>
              )}
            </div>
          </aside>

          {/* Main Chat Workspace */}
          <main className="flex-1 flex flex-col h-full overflow-hidden bg-surface">
            <ChatWindow
              messages={messages}
              isLoading={isLoading}
              errorMessage={errorMessage}
              selectedCount={selectedDocIds.length}
              onSendMessage={handleSendMessage}
              onClearError={() => setErrorMessage(null)}
            />
          </main>
        </div>
      </div>
    </AppShell>
  );
}
