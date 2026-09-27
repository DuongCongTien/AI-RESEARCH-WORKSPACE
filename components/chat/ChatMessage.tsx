'use client';

import React, { useState } from 'react';
import { ChatMessage as ChatMessageType } from '@/types';
import { Bot, User, Copy, Check, FileText } from 'lucide-react';

interface ChatMessageProps {
  message: ChatMessageType;
  onRegenerate?: () => void;
  isRegenerating?: boolean;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`flex gap-3.5 my-3 ${
        isUser ? 'flex-row-reverse pl-8' : 'pr-8'
      } animate-fade-in-up`}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
          isUser
            ? 'bg-primary text-primary-foreground font-semibold text-xs'
            : 'bg-muted text-foreground border border-border'
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-primary" />}
      </div>

      {/* Message Bubble Container */}
      <div
        className={`flex flex-col max-w-[85%] ${
          isUser ? 'items-end' : 'items-start'
        }`}
      >
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? 'bg-primary text-primary-foreground rounded-tr-xs shadow-xs'
              : 'bg-surface border border-border text-foreground rounded-tl-xs shadow-xs'
          }`}
        >
          {/* Message Text */}
          <div className="whitespace-pre-wrap break-words">{message.content}</div>

          {/* Sources badges if any */}
          {message.sources && message.sources.length > 0 && !isUser && (
            <div className="mt-3 pt-2.5 border-t border-border/60 flex flex-wrap gap-1.5 items-center">
              <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                <FileText className="w-3 h-3" /> Grounded sources:
              </span>
              {message.sources.map((src, i) => (
                <span
                  key={i}
                  className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] bg-muted/80 text-foreground font-medium border border-border"
                >
                  {src.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Message Meta & Actions */}
        {!isUser && (
          <div className="flex items-center gap-2 mt-1 px-1 text-[11px] text-muted-foreground">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer py-0.5 px-1.5 rounded hover:bg-muted"
              title="Copy message"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-500" />
                  <span className="text-emerald-500">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Re-export as MessageItem for backwards compatibility
export { ChatMessage as MessageItem };
