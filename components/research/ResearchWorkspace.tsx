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

  // 1. Tải danh sách tài liệu và cuộc trò chuyện ban đầu
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
            // Mặc định chọn các tài liệu ở trạng thái sẵn sàng
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
        console.warn('Lỗi tải dữ liệu ban đầu cho ResearchWorkspace:', err);
      }
    }

    loadData();
  }, [initialConversationId]);

  // 2. Gửi câu hỏi và nhận stream thời gian thực
  const handleSendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || chatStatus === 'loading' || chatStatus === 'streaming') return;

      // Xử lý trường hợp chưa chọn tài liệu
      if (selectedDocIds.length === 0) {
        setErrorMessage('Tải lên ít nhất một tài liệu để bắt đầu nghiên cứu.');
        return;
      }

      setErrorMessage(null);
      setChatStatus('loading');
      setStreamingContent('');

      const activeConvId = conversationId || `conv-${Date.now()}`;
      if (!conversationId) {
        setConversationId(activeConvId);
      }

      // Thêm ngay câu hỏi của người dùng vào giao diện
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
            errorJson?.error || `Máy chủ phản hồi với mã lỗi HTTP ${res.status}`
          );
        }

        if (!res.body) {
          throw new Error('Đường truyền luồng dữ liệu không khả dụng.');
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
                throw new Error(parsed.error || 'Quá trình tổng hợp câu trả lời bị ngắt quãng.');
              }
            } catch (parseErr) {
              if (parseErr instanceof Error && parseErr.message.includes('tổng hợp câu trả lời')) {
                throw parseErr;
              }
              accumulatedText += line;
              setStreamingContent(accumulatedText);
            }
          }
        }

        // Hoàn tất tin nhắn của trợ lý với các thẻ có cấu trúc
        const assistantMsg: MessageItemType = {
          id: `asst-${Date.now()}`,
          conversationId: returnedConvId,
          role: 'assistant',
          content: structuredResult?.summary || accumulatedText || 'Đã hoàn thành tổng hợp.',
          structuredResponse: structuredResult,
          createdAt: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, assistantMsg]);
        setStreamingContent('');
        setChatStatus('success');

        // Cập nhật URL mà không reload trang
        if (returnedConvId && window.location.pathname !== `/research/${returnedConvId}`) {
          window.history.pushState(null, '', `/research/${returnedConvId}`);
        }
      } catch (err) {
        console.error('Lỗi truyền dữ liệu chat:', err);
        setChatStatus('error');
        setErrorMessage(
          err instanceof Error
            ? err.message
            : 'Không thể kết nối với trợ lý nghiên cứu AI.'
        );
        setStreamingContent('');
      }
    },
    [chatStatus, conversationId, selectedDocIds]
  );

  // 3. Xử lý tham số câu hỏi ban đầu nếu có trên URL `?q=`
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

  // 4. Tạo lại câu trả lời gần nhất
  const handleRegenerateLast = () => {
    const userMessages = messages.filter((m) => m.role === 'user');
    if (userMessages.length === 0) return;

    const lastUserMsg = userMessages[userMessages.length - 1];

    // Xóa câu trả lời gần nhất của AI
    setMessages((prev) => {
      if (prev.length > 0 && prev[prev.length - 1].role === 'assistant') {
        return prev.slice(0, -1);
      }
      return prev;
    });

    handleSendMessage(lastUserMsg.content);
  };

  // 5. Thử lại khi gặp lỗi
  const handleRetry = () => {
    const userMessages = messages.filter((m) => m.role === 'user');
    if (userMessages.length > 0) {
      const lastUserMsg = userMessages[userMessages.length - 1];
      handleSendMessage(lastUserMsg.content);
    }
  };

  // 6. Bắt đầu phiên nghiên cứu mới mà không tải lại trang
  const handleNewResearch = () => {
    setMessages([]);
    setStreamingContent('');
    setErrorMessage(null);
    setChatStatus('idle');
    const newId = `conv-${Date.now()}`;
    setConversationId(newId);
    window.history.pushState(null, '', '/research');
  };

  // 7. Xử lý chọn/bỏ chọn tài liệu ngữ cảnh
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
        {/* Thanh tiêu đề trên cùng của Không gian Nghiên cứu */}
        <div className="px-4 sm:px-6 py-3 border-b border-border bg-surface/85 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsRailOpen((prev) => !prev)}
              className="p-1.5 rounded-lg border border-border bg-surface hover:bg-muted text-muted-foreground hover:text-foreground transition-colors hidden md:flex items-center justify-center cursor-pointer shadow-2xs"
              title={isRailOpen ? 'Ẩn bảng ngữ cảnh' : 'Hiện bảng ngữ cảnh'}
              aria-label={isRailOpen ? 'Ẩn bảng ngữ cảnh' : 'Hiện bảng ngữ cảnh'}
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
                  Không gian Nghiên cứu
                </h1>
              </div>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Vấn đáp và tổng hợp thông minh bám sát đa tài liệu
              </p>
            </div>
          </div>

          {/* Các nút hành động */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleNewResearch}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-surface hover:bg-muted text-xs font-semibold text-foreground transition-all cursor-pointer shadow-2xs active:scale-95"
              title="Bắt đầu phiên nghiên cứu mới"
            >
              <Plus className="w-3.5 h-3.5 text-primary" />
              <span>Nghiên cứu mới</span>
            </button>

            <button
              type="button"
              onClick={() => setIsUploadOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all cursor-pointer shadow-2xs active:scale-95"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Tải tài liệu lên</span>
            </button>
          </div>
        </div>

        {/* Nội dung chính: Chia cột giữa Bảng chọn tài liệu và Khung Chat */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
          {/* Bảng chọn tài liệu ngữ cảnh */}
          {isRailOpen && (
            <aside className="w-full md:w-80 border-b md:border-b-0 md:border-r border-border bg-surface/50 flex flex-col shrink-0 max-h-48 md:max-h-full transition-all">
              {/* Tiêu đề bảng tài liệu */}
              <div className="p-3 sm:p-4 border-b border-border/60 flex items-center justify-between bg-surface/80">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold text-foreground">
                    Tài liệu ngữ cảnh ({selectedDocIds.length}/{documents.length})
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-primary hover:underline font-medium cursor-pointer"
                  >
                    Tất cả
                  </button>
                  <span className="text-muted-foreground/40">•</span>
                  <button
                    type="button"
                    onClick={handleDeselectAll}
                    className="text-muted-foreground hover:text-foreground font-medium cursor-pointer"
                  >
                    Bỏ chọn
                  </button>
                </div>
              </div>

              {/* Danh sách chọn tài liệu */}
              <div className="flex-1 overflow-y-auto p-2.5 sm:p-3 space-y-2">
                {documents.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-border text-center">
                    <FileText className="w-6 h-6 text-muted-foreground mx-auto mb-1.5" />
                    <p className="text-xs font-medium text-foreground">Chưa có tài liệu nào</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 mb-3">
                      Tải tài liệu lên để đặt câu hỏi đối chiếu
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsUploadOpen(true)}
                      className="inline-flex items-center gap-1 text-xs text-primary font-semibold hover:underline cursor-pointer"
                    >
                      Tải lên ngay <ArrowRight className="w-3 h-3" />
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
                          aria-label={`Chọn ${doc.name}`}
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

              {/* Chân bảng: Thông báo trạng thái chọn */}
              <div className="p-2.5 sm:p-3 border-t border-border/60 bg-surface/60 text-[11px] text-muted-foreground">
                {selectedDocIds.length > 0 ? (
                  <span className="text-primary font-medium">
                    ✓ {selectedDocIds.length} tài liệu trong ngữ cảnh
                  </span>
                ) : (
                  <span className="text-amber-600 dark:text-amber-400">
                    ⚠ Chọn ít nhất một tài liệu để bắt đầu
                  </span>
                )}
              </div>
            </aside>
          )}

          {/* Khung chat chính */}
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

      {/* Hộp thoại tải tài liệu lên */}
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
