'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { ChatBox } from '@/components/chat/ChatBox';
import { DocumentStatus } from '@/components/documents/DocumentStatus';
import { UploadDialog } from '@/components/documents/UploadDialog';
import { DocumentItem, MessageItemType, ChatStatus } from '@/types';
import { ResearchResponse } from '@/types/research';
import {
  FileText,
  Upload,
  CheckSquare,
  Square,
  Sparkles,
  Layers,
  ArrowRight,
  Plus,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

interface ResearchWorkspaceProps {
  initialConversationId?: string;
  initialQuery?: string | null;
}

export function ResearchWorkspace({
  initialConversationId,
  initialQuery = null,
}: ResearchWorkspaceProps) {
  const [conversationId, setConversationId] = useState<string | null>(
    initialConversationId || null
  );
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [messages, setMessages] = useState<MessageItemType[]>([]);
  const [chatStatus, setChatStatus] = useState<ChatStatus>('idle');
  const [streamingContent, setStreamingContent] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRailOpen, setIsRailOpen] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const initialQueryHandledRef = useRef(false);

  // 1. Load documents and initial conversation on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [docsRes, convsRes] = await Promise.all([
          fetch('/api/documents'),
          initialConversationId
            ? fetch(`/api/conversations/${initialConversationId}`)
            : Promise.resolve(null),
        ]);

        if (docsRes.ok) {
          const docsJson = await docsRes.json();
          if (docsJson.success && Array.isArray(docsJson.data)) {
            setDocuments(docsJson.data);
            // Default select ready documents
            const readyIds = docsJson.data
              .filter((d: DocumentItem) => d.status.toLowerCase() === 'ready')
              .map((d: DocumentItem) => d.id);
            setSelectedDocIds(readyIds);
          }
        }

        if (convsRes && convsRes.ok) {
          const convJson = await convsRes.json();
          if (convJson.success && convJson.data?.messages) {
            setMessages(convJson.data.messages);
            if (convJson.data.documentIds && convJson.data.documentIds.length > 0) {
              setSelectedDocIds(convJson.data.documentIds);
            }
          }
        }
      } catch (err) {
        console.warn('ResearchWorkspace initial load warning:', err);
      }
    }

    loadData();
  }, [initialConversationId]);

  // 2. Handle sending message with real-time streaming
  const handleSendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || chatStatus === 'loading' || chatStatus === 'streaming') return;

      // Section XXXI: Edge case - No document selected
      if (selectedDocIds.length === 0) {
        setErrorMessage('Upload at least one document to start research.');
        return;
      }

      setErrorMessage(null);
      setChatStatus('loading');
      setStreamingContent('');

      const activeConvId = conversationId || `conv-${Date.now()}`;
      if (!conversationId) {
        setConversationId(activeConvId);
      }

      // Append user message immediately
      const userMsg: MessageItemType = {
        id: `user-${Date.now()}`,
        conversationId: activeConvId,
        role: 'user',
        content: trimmed,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversationId: activeConvId,
            documentIds: selectedDocIds,
            message: trimmed,
          }),
        });

        if (!res.ok) {
          const errorJson = await res.json().catch(() => null);
          throw new Error(
            errorJson?.error || `Server responded with HTTP ${res.status}`
          );
        }

        if (!res.body) {
          throw new Error('Streaming response body is unavailable.');
        }

        setChatStatus('streaming');
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulatedText = '';
        let structuredResult: ResearchResponse | null = null;
        let returnedConvId = activeConvId;

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          const chunkText = decoder.decode(value, { stream: true });
          const lines = chunkText.split('\n').filter(Boolean);

          for (const line of lines) {
            try {
              const parsed = JSON.parse(line);
              if (parsed.type === 'chunk' && parsed.text) {
                accumulatedText += parsed.text;
                setStreamingContent(accumulatedText);
              } else if (parsed.type === 'done') {
                if (parsed.structuredResponse) {
                  structuredResult = parsed.structuredResponse;
                }
                if (parsed.conversationId) {
                  returnedConvId = parsed.conversationId;
                }
              } else if (parsed.type === 'error') {
                throw new Error(parsed.error || 'Stream synthesis interrupted.');
              }
            } catch (parseErr) {
              if (parseErr instanceof Error && parseErr.message.includes('Stream synthesis')) {
                throw parseErr;
              }
              accumulatedText += line;
              setStreamingContent(accumulatedText);
            }
          }
        }

        // Finalize assistant message with structured cards
        const assistantMsg: MessageItemType = {
          id: `asst-${Date.now()}`,
          conversationId: returnedConvId,
          role: 'assistant',
          content: structuredResult?.summary || accumulatedText || 'Synthesis complete.',
          structuredResponse: structuredResult,
          createdAt: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, assistantMsg]);
        setStreamingContent('');
        setChatStatus('success');

        // Update URL state without page reload
        if (returnedConvId && window.location.pathname !== `/research/${returnedConvId}`) {
          window.history.pushState(null, '', `/research/${returnedConvId}`);
        }
      } catch (err) {
        console.error('Chat streaming failure:', err);
        setChatStatus('error');
        setErrorMessage(
          err instanceof Error
            ? err.message
            : 'Unable to communicate with AI research assistant.'
        );
        setStreamingContent('');
      }
    },
    [chatStatus, conversationId, selectedDocIds]
  );

  // 3. Handle initial query param `?q=` if provided
  useEffect(() => {
    if (
      initialQuery &&
      !initialQueryHandledRef.current &&
      documents.length > 0 &&
      selectedDocIds.length > 0
    ) {
      initialQueryHandledRef.current = true;
      handleSendMessage(initialQuery);
    }
  }, [initialQuery, documents, selectedDocIds, handleSendMessage]);

  // 4. Regenerate last answer
  const handleRegenerateLast = () => {
    const userMessages = messages.filter((m) => m.role === 'user');
    if (userMessages.length === 0) return;

    const lastUserMsg = userMessages[userMessages.length - 1];

    // Remove last assistant message
    setMessages((prev) => {
      if (prev.length > 0 && prev[prev.length - 1].role === 'assistant') {
        return prev.slice(0, -1);
      }
      return prev;
    });

    handleSendMessage(lastUserMsg.content);
  };

  // 5. Retry on error
  const handleRetry = () => {
    const userMessages = messages.filter((m) => m.role === 'user');
    if (userMessages.length > 0) {
      const lastUserMsg = userMessages[userMessages.length - 1];
      handleSendMessage(lastUserMsg.content);
    }
  };

  // 6. Create new research session without refreshing page
  const handleNewResearch = () => {
    setMessages([]);
    setStreamingContent('');
    setErrorMessage(null);
    setChatStatus('idle');
    const newId = `conv-${Date.now()}`;
    setConversationId(newId);
    window.history.pushState(null, '', '/research');
  };

  // 7. Context Selection Handlers
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
    if (errorMessage) setErrorMessage(null);
  };

  const handleDeselectAll = () => {
    setSelectedDocIds([]);
  };

  const handleRemoveSelectedDoc = (id: string) => {
    setSelectedDocIds((prev) => prev.filter((dId) => dId !== id));
  };

  const handleDocumentUploaded = (newDoc: DocumentItem) => {
    setDocuments((prev) => [newDoc, ...prev]);
    setSelectedDocIds((prev) => [newDoc.id, ...prev]);
    setIsUploadOpen(false);
  };

  return (
    <AppShell>
      <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
        {/* Workspace Top Header Bar */}
        <div className="px-4 sm:px-6 py-3 border-b border-border bg-surface/85 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsRailOpen((prev) => !prev)}
              className="p-1.5 rounded-lg border border-border bg-surface hover:bg-muted text-muted-foreground hover:text-foreground transition-colors hidden md:flex items-center justify-center cursor-pointer shadow-2xs"
              title={isRailOpen ? 'Hide context panel' : 'Show context panel'}
              aria-label={isRailOpen ? 'Hide context panel' : 'Show context panel'}
            >
              {isRailOpen ? (
                <PanelLeftClose className="w-4 h-4" />
              ) : (
                <PanelLeftOpen className="w-4 h-4" />
              )}
            </button>

            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <h1 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
                  Research Workspace
                </h1>
              </div>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Multi-document grounded inquiry &amp; AI synthesis
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleNewResearch}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-surface hover:bg-muted text-xs font-semibold text-foreground transition-all cursor-pointer shadow-2xs active:scale-95"
              title="Start a new research conversation"
            >
              <Plus className="w-3.5 h-3.5 text-primary" />
              <span>New Research</span>
            </button>

            <button
              type="button"
              onClick={() => setIsUploadOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all cursor-pointer shadow-2xs active:scale-95"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Document</span>
            </button>
          </div>
        </div>

        {/* Main Content: Split View between Context Rail & Chat Area */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
          {/* Documents Selection Rail */}
          {isRailOpen && (
            <aside className="w-full md:w-80 border-b md:border-b-0 md:border-r border-border bg-surface/50 flex flex-col shrink-0 max-h-48 md:max-h-full transition-all">
              {/* Rail Header */}
              <div className="p-3 sm:p-4 border-b border-border/60 flex items-center justify-between bg-surface/80">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold text-foreground">
                    Context Documents ({selectedDocIds.length}/{documents.length})
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-primary hover:underline font-medium cursor-pointer"
                  >
                    All
                  </button>
                  <span className="text-muted-foreground/40">•</span>
                  <button
                    type="button"
                    onClick={handleDeselectAll}
                    className="text-muted-foreground hover:text-foreground font-medium cursor-pointer"
                  >
                    None
                  </button>
                </div>
              </div>

              {/* Document Checklist */}
              <div className="flex-1 overflow-y-auto p-2.5 sm:p-3 space-y-2">
                {documents.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-border text-center">
                    <FileText className="w-6 h-6 text-muted-foreground mx-auto mb-1.5" />
                    <p className="text-xs font-medium text-foreground">No documents yet</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 mb-3">
                      Upload documents to ground your questions
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsUploadOpen(true)}
                      className="inline-flex items-center gap-1 text-xs text-primary font-semibold hover:underline cursor-pointer"
                    >
                      Upload Now <ArrowRight className="w-3 h-3" />
                    </button>
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
                          className="mt-0.5 text-primary shrink-0 cursor-pointer"
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

              {/* Selection Status Footer */}
              <div className="p-2.5 sm:p-3 border-t border-border/60 bg-surface/60 text-[11px] text-muted-foreground">
                {selectedDocIds.length > 0 ? (
                  <span className="text-primary font-medium">
                    ✓ {selectedDocIds.length} document{selectedDocIds.length > 1 ? 's' : ''} in context
                  </span>
                ) : (
                  <span className="text-amber-600 dark:text-amber-400">
                    ⚠ Select at least one document to start
                  </span>
                )}
              </div>
            </aside>
          )}

          {/* Main Chat Area */}
          <main className="flex-1 flex flex-col h-full overflow-hidden bg-surface relative">
            <ChatBox
              messages={messages}
              status={chatStatus}
              documents={documents}
              selectedDocumentIds={selectedDocIds}
              onSendMessage={handleSendMessage}
              onRemoveSelectedDoc={handleRemoveSelectedDoc}
              onRegenerateLast={handleRegenerateLast}
              onRetry={handleRetry}
              onOpenUpload={() => setIsUploadOpen(true)}
              streamingContent={streamingContent}
              errorMessage={errorMessage}
            />
          </main>
        </div>
      </div>

      {/* Upload Dialog Modal */}
      {isUploadOpen && (
        <UploadDialog
          isOpen={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
          onUploaded={handleDocumentUploaded}
        />
      )}
    </AppShell>
  );
}
