'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageItemType, DocumentItem, ChatStatus } from '@/types';
import { MessageItem } from './MessageItem';
import { EmptyState } from './EmptyState';

interface ChatBoxProps {
  messages: MessageItemType[];
  status: ChatStatus;
  documents: DocumentItem[];
  selectedDocumentIds: string[];
  onSendMessage: (text: string) => Promise<void>;
  onRemoveSelectedDoc?: (id: string) => void;
  onRegenerateLast?: () => void;
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

  return (
    <div className="flex h-full flex-col overflow-hidden bg-transparent">
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-8">
        {messages.length === 0 && !streamingContent && status === 'idle' ? (
          <EmptyState onSelectPrompt={handleSelectPrompt} />
        ) : (
          <div className="mx-auto max-w-4xl space-y-4">
            {messages.map((msg, idx) => (
              <MessageItem
                key={msg.id || idx}
                message={msg}
                onRegenerate={
                  idx === messages.length - 1 && msg.role === 'assistant'
                    ? onRegenerateLast
                    : undefined
                }
                isRegenerating={status === 'loading' || status === 'streaming'}
              />
            ))}

            {/* Real-time Streaming Response Display */}
            {status === 'streaming' && (
              <div className="flex w-full gap-3 py-3 justify-start animate-fade-in-up">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary mt-1 shadow-2xs">
                  <span className="material-symbols-outlined text-[19px] text-primary animate-subtle-pulse">
                    psychology
                  </span>
                </div>
                <div className="flex flex-col items-start w-full max-w-full sm:max-w-[92%]">
                  <div className="flex items-center gap-2 mb-1.5 px-1 text-[11px] text-outline font-mono">
                    <span className="font-semibold text-primary">Streaming Synthesis</span>
                    <span>•</span>
                    {/* Animated soundwave equalizer bars */}
                    <div className="flex items-center gap-1 h-3.5">
                      <span className="w-1 bg-primary rounded-full soundwave-bar-1 inline-block"></span>
                      <span className="w-1 bg-primary rounded-full soundwave-bar-2 inline-block"></span>
                      <span className="w-1 bg-primary rounded-full soundwave-bar-3 inline-block"></span>
                    </div>
                    <span>•</span>
                    <span className="text-tertiary">Real-time SSE token pipe</span>
                  </div>
                  <div className="w-full rounded-2xl rounded-tl-sm border border-outline-variant/60 bg-surface p-4 sm:p-5 shadow-xs space-y-2">
                    <p className="font-body-md text-body-md leading-relaxed text-on-surface whitespace-pre-line font-mono text-sm">
                      {streamingContent || 'Synthesizing grounded analysis from indexed corpus...'}
                      <span className="inline-block w-2 h-4 ml-1.5 bg-primary rounded-xs animate-cursor-blink align-middle"></span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Loading State Spinner */}
            {status === 'loading' && (
              <div className="flex items-center gap-3 py-4 text-xs text-on-surface-variant animate-fade-in-up">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary shadow-2xs">
                  <span className="material-symbols-outlined text-[19px] animate-spin text-primary">
                    progress_activity
                  </span>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-outline-variant/50 bg-surface px-4 py-2.5 shadow-2xs">
                  <span className="material-symbols-outlined text-[16px] animate-spin text-tertiary">
                    sync
                  </span>
                  <span className="font-medium text-on-surface">Synthesizing multi-agent research analysis and cross-referencing citations...</span>
                </div>
              </div>
            )}

            {/* Error State Card with Retry */}
            {status === 'error' && (
              <div className="mx-auto max-w-md my-6 p-space-md rounded-2xl bg-rose-50 border border-rose-200 text-center flex flex-col items-center gap-2 animate-fade-in-up shadow-sm">
                <div className="p-2.5 rounded-full bg-rose-100 text-rose-600">
                  <span className="material-symbols-outlined text-[24px]">report_problem</span>
                </div>
                <h4 className="font-headline-sm text-headline-sm font-bold text-rose-700">
                  Something went wrong
                </h4>
                <p className="font-body-sm text-body-sm text-rose-900/80 max-w-sm">
                  {errorMessage || "We couldn't generate an answer right now. Please check your connection or API key."}
                </p>
                {onRegenerateLast && (
                  <button
                    type="button"
                    onClick={onRegenerateLast}
                    className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-body-sm text-body-sm font-semibold transition-all shadow-xs active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[16px]">refresh</span>
                    Try again
                  </button>
                )}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Sticky Bottom Input Bar */}
      <div className="border-t border-outline-variant/60 bg-surface/85 backdrop-blur-xl px-4 py-3 sm:px-8 shadow-xs">
        <div className="mx-auto max-w-4xl">
          {/* Active Document Badges */}
          {selectedDocs.length > 0 && (
            <div className="mb-2 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-semibold text-outline mr-1">
                Active Grounding Context:
              </span>
              {selectedDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] text-on-surface shadow-2xs"
                >
                  <span className="material-symbols-outlined text-[14px] text-tertiary">article</span>
                  <span className="max-w-[150px] truncate font-medium">{doc.name}</span>
                  {onRemoveSelectedDoc && (
                    <button
                      type="button"
                      onClick={() => onRemoveSelectedDoc(doc.id)}
                      className="ml-0.5 text-outline hover:text-rose-600 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[13px]">close</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Input Box Form */}
          <form
            onSubmit={handleSubmit}
            className="relative flex items-end gap-2 rounded-2xl border border-outline-variant/60 bg-surface p-2 shadow-xs transition-all focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10"
          >
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputValue}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Ask a scientific research question, request synthesis, or formulate hypotheses..."
              className="max-h-40 min-h-[44px] flex-1 resize-none bg-transparent px-3 py-2 font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none"
            />

            <button
              type="submit"
              disabled={!inputValue.trim() || status === 'loading' || status === 'streaming'}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-on-primary shadow-xs transition-all hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              title="Send inquiry (Enter)"
            >
              {status === 'loading' || status === 'streaming' ? (
                <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
              ) : (
                <span className="material-symbols-outlined text-[18px]">send</span>
              )}
            </button>
          </form>

          <p className="mt-2 text-center font-label-xs text-label-xs text-outline font-medium">
            ResearchAI Studio Core • v2.4-prod • Multi-Document RAG &amp; Grounded Citations
          </p>
        </div>
      </div>
    </div>
  );
}
