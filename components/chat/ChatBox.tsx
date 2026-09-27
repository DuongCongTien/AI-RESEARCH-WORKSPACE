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
      {/* Messages Scroll Area */}
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

            {/* Real-time Streaming Response Display */}
            {status === 'streaming' && (
              <div className="flex w-full gap-3 sm:gap-4 py-3 justify-start animate-fade-in-up">
                <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary mt-1 shadow-2xs">
                  <Sparkles className="w-4 h-4 animate-pulse text-primary" />
                </div>
                <div className="flex flex-col items-start w-full max-w-full">
                  <div className="flex items-center gap-2 mb-2 px-1 text-xs text-muted-foreground font-mono">
                    <span className="font-semibold text-primary">Streaming Synthesis</span>
                    <span>•</span>
                    <div className="flex items-center gap-1 h-3.5">
                      <span className="w-1 h-2 bg-primary rounded-full animate-bounce"></span>
                      <span className="w-1 h-3 bg-primary rounded-full animate-bounce delay-75"></span>
                      <span className="w-1 h-2 bg-primary rounded-full animate-bounce delay-150"></span>
                    </div>
                    <span>•</span>
                    <span className="text-muted-foreground">Real-time token pipeline</span>
                  </div>
                  <div className="w-full rounded-2xl rounded-tl-xs border border-border bg-surface p-4 sm:p-5 shadow-xs space-y-2">
                    <p className="text-sm leading-relaxed text-foreground whitespace-pre-line font-mono">
                      {streamingContent || 'Synthesizing grounded analysis from indexed corpus...'}
                      <span className="inline-block w-2 h-4 ml-1.5 bg-primary rounded-xs animate-pulse align-middle"></span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Loading State Spinner */}
            {status === 'loading' && (
              <div className="flex items-center gap-3 py-4 text-xs text-muted-foreground animate-fade-in-up">
                <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary shadow-2xs">
                  <RotateCw className="w-4 h-4 animate-spin text-primary" />
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 shadow-2xs">
                  <span className="font-medium text-foreground">
                    Analyzing document context and verifying grounded citations...
                  </span>
                </div>
              </div>
            )}

            {/* Error State Card with Retry */}
            {status === 'error' && (
              <div className="mx-auto max-w-md my-6 p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 text-center flex flex-col items-center gap-2 animate-fade-in-up shadow-sm">
                <div className="p-2.5 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-base text-rose-700 dark:text-rose-400">
                  Something went wrong.
                </h4>
                <p className="text-xs text-rose-900/80 dark:text-rose-300 max-w-sm leading-relaxed">
                  {errorMessage || "We couldn't generate a response right now. Please check your network or try again."}
                </p>
                <button
                  type="button"
                  onClick={handleRetryAction}
                  className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-all shadow-xs active:scale-95 cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Retry</span>
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Sticky Bottom Input Bar */}
      <div className="border-t border-border bg-surface/85 backdrop-blur-xl px-3 sm:px-6 md:px-8 py-3 shadow-xs shrink-0">
        <div className="mx-auto max-w-4xl">
          {/* Active Context Documents Badges */}
          {selectedDocs.length > 0 && (
            <div className="mb-2 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-semibold text-muted-foreground mr-1">
                Active Context:
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
                      title={`Remove ${doc.name} from context`}
                      aria-label={`Remove ${doc.name}`}
                    >
                      &times;
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Input Box Form */}
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
              placeholder="Ask a scientific research question, request synthesis, or formulate hypotheses..."
              className="max-h-40 min-h-[44px] flex-1 resize-none bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
            />

            <button
              type="submit"
              disabled={!inputValue.trim() || status === 'loading' || status === 'streaming'}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs transition-all hover:bg-primary/90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
              title="Send inquiry (Enter)"
              aria-label="Send message"
            >
              {status === 'loading' || status === 'streaming' ? (
                <RotateCw className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>

          <p className="mt-2 text-center text-[11px] text-muted-foreground font-mono">
            ResearchAI Studio Core • Multi-Document Grounded Synthesis
          </p>
        </div>
      </div>
    </div>
  );
}

// Re-export as ChatWindow for backwards compatibility
export { ChatBox as ChatWindow };
