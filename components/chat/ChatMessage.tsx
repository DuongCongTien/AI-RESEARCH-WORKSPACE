'use client';

import React, { useState } from 'react';
import { ChatMessage as ChatMessageType } from '@/types';
import { ResearchResponse as ResearchResponseType } from '@/types/research';
import { ResearchResponse } from '@/components/research/ResearchResponse';
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
        isUser ? 'flex-row-reverse pl-6 sm:pl-16' : 'pr-2 sm:pr-8'
      } animate-fade-in-up`}
    >
      {/* Ảnh đại diện */}
      <div
        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
          isUser
            ? 'bg-primary text-primary-foreground font-semibold text-xs'
            : 'bg-primary/10 text-primary border border-primary/20'
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4" />
        ) : (
          <Bot className="w-4 h-4 text-primary" />
        )}
      </div>

      {/* Khung nội dung tin nhắn */}
      <div
        className={`flex flex-col flex-1 min-w-0 ${
          isUser ? 'items-end max-w-[85%]' : 'items-start max-w-full'
        }`}
      >
        {isUser ? (
          /* Bong bóng tin nhắn người dùng */
          <div className="rounded-2xl rounded-tr-xs px-4 py-3 bg-primary text-primary-foreground text-sm leading-relaxed shadow-xs whitespace-pre-wrap break-words">
            {message.content}
          </div>
        ) : (
          /* Khung phản hồi trợ lý AI */
          <div className="w-full space-y-3">
            {message.structuredResponse ? (
              /* Thẻ có cấu trúc */
              <ResearchResponse response={message.structuredResponse} />
            ) : (
              /* Dạng văn bản thuần dự phòng */
              <div className="rounded-2xl rounded-tl-xs px-4 py-3 bg-surface border border-border text-foreground text-sm leading-relaxed shadow-xs whitespace-pre-wrap break-words">
                {message.content}
              </div>
            )}

            {/* Thanh tác vụ: Sao chép & Tạo lại */}
            <div className="flex items-center gap-2 pt-1 px-1 text-xs text-muted-foreground">
              {/* Nút Sao chép */}
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

              {/* Nút Tạo lại */}
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
