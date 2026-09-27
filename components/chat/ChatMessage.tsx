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
    parts.push(`SUMMARY:\n${structured.summary}`);
  }

  const keyPoints = structured.key_points || structured.keyPoints || [];
  if (keyPoints.length > 0) {
    parts.push(`KEY POINTS:\n${keyPoints.map((p) => `• ${p}`).join('\n')}`);
  }

  if (structured.risks && structured.risks.length > 0) {
    parts.push(
      `RISKS:\n${structured.risks
        .map(
          (r) =>
            `• [${r.severity.toUpperCase()}] ${r.title}${
              r.description ? `: ${r.description}` : ''
            }`
        )
        .join('\n')}`
    );
  }

  if (structured.actions && structured.actions.length > 0) {
    parts.push(
      `RECOMMENDED ACTIONS:\n${structured.actions
        .map(
          (a, i) =>
            `${i + 1}. ${a.title}${a.description ? ` - ${a.description}` : ''}`
        )
        .join('\n')}`
    );
  }

  if (structured.sources && structured.sources.length > 0) {
    parts.push(
      `SOURCES:\n${structured.sources
        .map(
          (s) =>
            `• ${s.documentName}${s.page ? ` (Page ${s.page})` : ''}${
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
        // Fallback for non-secure contexts
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
      console.error('Failed to copy to clipboard:', err);
    }
  };

  return (
    <div
      className={`flex gap-3 sm:gap-4 my-4 w-full ${
        isUser ? 'flex-row-reverse pl-6 sm:pl-16' : 'pr-2 sm:pr-8'
      } animate-fade-in-up`}
    >
      {/* Avatar */}
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

      {/* Message Content Container */}
      <div
        className={`flex flex-col flex-1 min-w-0 ${
          isUser ? 'items-end max-w-[85%]' : 'items-start max-w-full'
        }`}
      >
        {isUser ? (
          /* User Bubble */
          <div className="rounded-2xl rounded-tr-xs px-4 py-3 bg-primary text-primary-foreground text-sm leading-relaxed shadow-xs whitespace-pre-wrap break-words">
            {message.content}
          </div>
        ) : (
          /* Assistant Response */
          <div className="w-full space-y-3">
            {message.structuredResponse ? (
              /* Structured Response View */
              <ResearchResponse response={message.structuredResponse} />
            ) : (
              /* Plain text fallback */
              <div className="rounded-2xl rounded-tl-xs px-4 py-3 bg-surface border border-border text-foreground text-sm leading-relaxed shadow-xs whitespace-pre-wrap break-words">
                {message.content}
              </div>
            )}

            {/* Action Bar: Copy & Regenerate */}
            <div className="flex items-center gap-2 pt-1 px-1 text-xs text-muted-foreground">
              {/* Copy Button */}
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border bg-surface hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer shadow-2xs active:scale-95"
                title="Copy formatted answer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-500 font-medium">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>

              {/* Regenerate Button */}
              {onRegenerate && (
                <button
                  type="button"
                  onClick={onRegenerate}
                  disabled={isRegenerating}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border bg-surface hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer shadow-2xs active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Regenerate this response"
                >
                  {isRegenerating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                      <span>Regenerating...</span>
                    </>
                  ) : (
                    <>
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Regenerate</span>
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

// Re-export as MessageItem for backwards compatibility
export { ChatMessage as MessageItem };
