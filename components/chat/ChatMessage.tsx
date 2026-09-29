'use client';

import React, { useState } from 'react';
import { ChatMessage as ChatMessageType } from '@/types';
import { ResearchResponse as ResearchResponseType } from '@/types/research';
import { ResearchResponse } from '@/components/research/ResearchResponse';
import { MarkdownContent } from '@/components/research/MarkdownContent';
import { Bot, User, Copy, Check, RotateCw, Loader2 } from 'lucide-react';

interface ChatMessageProps {
  message: ChatMessageType;
  onRegenerate?: () => void;
  isRegenerating?: boolean;
}

function formatResponseForClipboard(
  fallbackText: string,
  structured?: ResearchResponseType | null
): string {
  if (!structured) return fallbackText;

  const parts: string[] = [];

  if (structured.summary) {
    parts.push(`TÓM TẮT:\n${structured.summary}`);
  }

  const keyPoints = structured.key_points || structured.keyPoints || [];
  if (keyPoints.length > 0) {
    parts.push(`ĐIỂM CỐT LÕI:\n${keyPoints.map((p) => `• ${p}`).join('\n')}`);
  }

  if (structured.risks && structured.risks.length > 0) {
    parts.push(
      `RỦI RO:\n${structured.risks
        .map(
          (r) =>
            `• [${
              r.severity === 'high'
                ? 'RỦI RO CAO'
                : r.severity === 'medium'
                ? 'RỦI RO TRUNG BÌNH'
                : 'RỦI RO THẤP'
            }] ${r.title}${r.description ? `: ${r.description}` : ''}`
        )
        .join('\n')}`
    );
  }

  if (structured.actions && structured.actions.length > 0) {
    parts.push(
      `KHUYẾN NGHỊ HÀNH ĐỘNG:\n${structured.actions
        .map(
          (a, i) =>
            `${i + 1}. ${a.title}${a.description ? ` - ${a.description}` : ''}`
        )
        .join('\n')}`
    );
  }

  if (structured.sources && structured.sources.length > 0) {
    parts.push(
      `NGUỒN TRÍCH DẪN:\n${structured.sources
        .map(
          (s) =>
            `• ${s.documentName}${s.page ? ` (Trang ${s.page})` : ''}${
              s.excerpt ? ` - "${s.excerpt}"` : ''
            }`
        )
        .join('\n')}`
    );
  }

  return parts.join('\n\n') || fallbackText;
}

export function ChatMessage({
  message,
  onRegenerate,
  isRegenerating = false,
}: ChatMessageProps) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const textToCopy = formatResponseForClipboard(
      message.content,
      message.structuredResponse
    );

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Lỗi sao chép vào bộ nhớ tạm:', err);
    }
  };

  return (
    <div
      className={`flex gap-3 sm:gap-4 my-4 w-full ${
        isUser ? 'flex-row-reverse pl-4 sm:pl-12' : 'pr-2 sm:pr-6'
      } animate-fade-in-up`}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform hover:scale-105 ${
          isUser
            ? 'bg-gradient-to-br from-primary to-secondary text-primary-foreground'
            : 'bg-primary/10 text-primary border border-primary/20'
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4" />
        ) : (
          <Bot className="w-4 h-4 text-primary" />
        )}
      </div>

      {/* Message content */}
      <div
        className={`flex flex-col flex-1 min-w-0 ${
          isUser ? 'items-end max-w-[85%]' : 'items-start max-w-full'
        }`}
      >
        {isUser ? (
          /* User message bubble */
          <div className="rounded-2xl rounded-tr-sm px-4 py-3 bg-gradient-to-br from-primary to-primary/90 text-primary-foreground text-sm leading-relaxed shadow-sm whitespace-pre-wrap break-words">
            {message.content}
          </div>
        ) : (
          /* AI response container */
          <div className="w-full space-y-2.5">
            {message.structuredResponse ? (
              /* Structured cards response */
              <ResearchResponse response={message.structuredResponse} />
            ) : (
              /* Plain text fallback with markdown rendering */
              <div className="rounded-2xl rounded-tl-sm px-4 py-4 bg-surface border border-border text-foreground shadow-sm">
                <MarkdownContent content={message.content} />
              </div>
            )}

            {/* Action bar: Copy & Regenerate */}
            <div className="flex items-center gap-2 pt-0.5 px-1 text-xs text-muted-foreground">
              {/* Copy button */}
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border bg-surface hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer shadow-2xs active:scale-95"
                title="Sao chép câu trả lời có định dạng"
                aria-label="Sao chép câu trả lời"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-500 font-medium">Đã sao chép</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Sao chép</span>
                  </>
                )}
              </button>

              {/* Regenerate button */}
              {onRegenerate && (
                <button
                  type="button"
                  onClick={onRegenerate}
                  disabled={isRegenerating}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border bg-surface hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer shadow-2xs active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Tạo lại câu trả lời này"
                  aria-label="Tạo lại câu trả lời"
                >
                  {isRegenerating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                      <span>Đang tạo lại...</span>
                    </>
                  ) : (
                    <>
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Tạo lại</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
