'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageItemType, DocumentItem, ChatStatus } from '@/types';
import { ChatMessage } from './ChatMessage';
import { EmptyChat } from './EmptyChat';
import { RotateCw, AlertTriangle, Sparkles, Send } from 'lucide-react';

interface ChatBoxProps {
  messages: MessageItemType[];
  status: ChatStatus;
  documents: DocumentItem[];
  selectedDocumentIds: string[];
  onSendMessage: (text: string) => Promise<void>;
  onRemoveSelectedDoc?: (id: string) => void;
  onRegenerateLast?: () => void;
  onRetry?: () => void;
  onOpenUpload?: () => void;
  streamingContent?: string;
  errorMessage?: string | null;
}

function formatStreamingDisplay(raw: string): string {
  if (!raw) return 'Đang khởi tạo phân tích...';
  const trimmed = raw.trim();
  const summaryMatch = trimmed.match(/"summary"\s*:\s*"([\s\S]*)/);
  if (summaryMatch) {
    let clean = summaryMatch[1];
    clean = clean.replace(/"\s*,\s*"(?:key_points|keyPoints|risks|actions|sources)[\s\S]*$/, '');
    clean = clean.replace(/"\s*\}?$/, '');
    clean = clean.replace(/\\n/g, '\n').replace(/\\"/g, '"');
    return clean.trim() || 'Đang xây dựng lời giải và phân tích chi tiết...';
  }
  if (trimmed.startsWith('{') || trimmed.startsWith('```json')) {
    return 'Đang đọc hiểu tài liệu và xây dựng cấu trúc lời giải...';
  }
  return raw;
}

export function ChatBox({
  messages,
  status,
  documents,
  selectedDocumentIds,
  onSendMessage,
  onRemoveSelectedDoc,
  onRegenerateLast,
  onRetry,
  onOpenUpload,
  streamingContent = '',
  errorMessage = null,
}: ChatBoxProps) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const selectedDocs = documents.filter((doc) =>
    selectedDocumentIds.includes(doc.id)
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, status, streamingContent]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed || status === 'loading' || status === 'streaming') return;

    setInputValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    await onSendMessage(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSelectPrompt = (prompt: string) => {
    setInputValue(prompt);
    textareaRef.current?.focus();
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 180)}px`;
  };

  const handleRetryAction = () => {
    if (onRetry) {
      onRetry();
    } else if (onRegenerateLast) {
      onRegenerateLast();
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden bg-transparent w-full">
      {/* Vùng cuộn tin nhắn */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-6 md:px-8 py-4 sm:py-6">
        {messages.length === 0 && !streamingContent && status === 'idle' ? (
          <EmptyChat
            onSelectPrompt={handleSelectPrompt}
            hasSelectedDocs={selectedDocs.length > 0}
            totalDocsCount={documents.length}
            onOpenUpload={onOpenUpload}
          />
        ) : (
          <div className="mx-auto max-w-4xl space-y-4">
            {messages.map((msg, idx) => {
              const isLastAssistant =
                idx === messages.length - 1 && msg.role === 'assistant';

              return (
                <ChatMessage
                  key={msg.id || idx}
                  message={msg}
                  onRegenerate={isLastAssistant ? onRegenerateLast : undefined}
                  isRegenerating={status === 'loading' || status === 'streaming'}
                />
              );
            })}

            {/* Real-time AI streaming state */}
            {status === 'streaming' && (
              <div className="flex w-full gap-3 sm:gap-4 py-2 justify-start animate-fade-in-up">
                <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-secondary/15 border border-primary/25 mt-1 shadow-sm">
                  <Sparkles className="w-4 h-4 animate-pulse text-primary" />
                </div>
                <div className="flex flex-col items-start w-full max-w-full">
                  {/* Status bar */}
                  <div className="flex items-center gap-2 mb-2 px-0.5">
                    <div className="flex items-center gap-1.5 h-4">
                      <span className="w-1 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1 h-4 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '120ms' }} />
                      <span className="w-1 h-2 bg-tertiary rounded-full animate-bounce" style={{ animationDelay: '240ms' }} />
                    </div>
                    <span className="text-xs font-semibold text-primary">AI đang phân tích</span>
                    <span className="text-xs text-muted-foreground font-mono">• trực tiếp</span>
                  </div>
                  {/* Content panel */}
                  <div className="relative w-full rounded-2xl rounded-tl-sm border border-primary/20 bg-gradient-to-br from-surface via-surface to-primary/3 p-4 sm:p-5 shadow-sm overflow-hidden">
                    {/* Animated scan line */}
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent animate-scan-line" />
                    <p className="text-sm leading-relaxed text-foreground whitespace-pre-line">
                      {formatStreamingDisplay(streamingContent)}
                      <span className="inline-block w-0.5 h-4 ml-1 bg-primary rounded-full animate-pulse align-middle" />
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Loading state */}
            {status === 'loading' && (
              <div className="flex items-start gap-3 py-2 animate-fade-in-up">
                <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-secondary/15 border border-primary/25 shadow-sm shrink-0">
                  <RotateCw className="w-4 h-4 animate-spin text-primary" />
                </div>
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-3 w-48 bg-gradient-to-r from-muted via-muted/60 to-muted rounded-full shimmer-sweep" />
                  <div className="h-3 w-64 bg-gradient-to-r from-muted via-muted/60 to-muted rounded-full shimmer-sweep" style={{ animationDelay: '0.2s' }} />
                  <div className="h-3 w-40 bg-gradient-to-r from-muted via-muted/60 to-muted rounded-full shimmer-sweep" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            )}

            {/* Thẻ hiển thị lỗi kèm nút Thử lại */}
            {status === 'error' && (
              <div className="mx-auto max-w-md my-6 p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 text-center flex flex-col items-center gap-2 animate-fade-in-up shadow-sm">
                <div className="p-2.5 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-base text-rose-700 dark:text-rose-400">
                  Đã xảy ra lỗi.
                </h4>
                <p className="text-xs text-rose-900/80 dark:text-rose-300 max-w-sm leading-relaxed">
                  {errorMessage || 'Không thể tạo câu trả lời vào lúc này. Vui lòng kiểm tra kết nối mạng hoặc thử lại.'}
                </p>
                <button
                  type="button"
                  onClick={handleRetryAction}
                  className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-all shadow-xs active:scale-95 cursor-pointer"
                  title="Thử lại yêu cầu"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Thử lại</span>
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Thanh nhập tin nhắn cố định ở đáy */}
      <div className="border-t border-border bg-surface/85 backdrop-blur-xl px-3 sm:px-6 md:px-8 py-3 shadow-xs shrink-0">
        <div className="mx-auto max-w-4xl">
          {/* Nhãn tài liệu đang được chọn làm ngữ cảnh */}
          {selectedDocs.length > 0 && (
            <div className="mb-2 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-semibold text-muted-foreground mr-1">
                Ngữ cảnh hoạt động:
              </span>
              {selectedDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] text-foreground shadow-2xs"
                >
                  <span className="max-w-[140px] sm:max-w-[200px] truncate font-medium">
                    {doc.name}
                  </span>
                  {onRemoveSelectedDoc && (
                    <button
                      type="button"
                      onClick={() => onRemoveSelectedDoc(doc.id)}
                      className="ml-0.5 text-muted-foreground hover:text-rose-600 transition-colors cursor-pointer"
                      title={`Bỏ chọn ${doc.name} khỏi ngữ cảnh`}
                      aria-label={`Bỏ chọn ${doc.name}`}
                    >
                      &times;
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Biểu mẫu nhập liệu */}
          <form
            onSubmit={handleSubmit}
            className="relative flex items-end gap-2 rounded-2xl border border-border bg-surface p-2 shadow-xs transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10"
          >
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputValue}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              disabled={status === 'loading' || status === 'streaming'}
              placeholder="Đặt câu hỏi nghiên cứu, yêu cầu tổng hợp hoặc phân tích giả thuyết..."
              className="max-h-40 min-h-[44px] flex-1 resize-none bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
            />

            <button
              type="submit"
              disabled={!inputValue.trim() || status === 'loading' || status === 'streaming'}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs transition-all hover:bg-primary/90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
              title="Gửi câu hỏi (Enter)"
              aria-label="Gửi câu hỏi"
            >
              {status === 'loading' || status === 'streaming' ? (
                <RotateCw className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>

          <p className="mt-2 text-center text-[11px] text-muted-foreground font-mono">
            Không gian Nghiên cứu AI • Tổng hợp bám sát đa tài liệu
          </p>
        </div>
      </div>
    </div>
  );
}
