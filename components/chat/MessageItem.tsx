'use client';

import React, { useState } from 'react';
import { MessageItemType } from '@/types';
import { StructuredResponseView } from '@/components/research/StructuredResponseView';

interface MessageItemProps {
  message: MessageItemType;
  onRegenerate?: () => void;
  isRegenerating?: boolean;
}

export function MessageItem({ message, onRegenerate, isRegenerating = false }: MessageItemProps) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const formatTime = (date: string | Date) => {
    try {
      const d = new Date(date);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const handleCopy = () => {
    let textToCopy = message.content;
    if (message.structuredResponse) {
      const sr = message.structuredResponse;
      textToCopy = `SUMMARY:\n${sr.summary}\n\nKEY POINTS:\n${(sr.keyPoints || sr.key_points || []).map((p) => `- ${p}`).join('\n')}\n\nRISKS:\n${sr.risks.map((r) => `- [${r.severity.toUpperCase()}] ${r.title}: ${r.description}`).join('\n')}\n\nACTIONS:\n${sr.actions.map((a) => `- ${a.title}: ${a.description || ''}`).join('\n')}`;
    }
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`flex w-full gap-3 py-3 transition-all ${
        isUser ? 'justify-end' : 'justify-start'
      }`}
    >
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-container-high border border-outline-variant/30 text-primary mt-1">
          <span className="material-symbols-outlined text-[18px] text-tertiary">psychology</span>
        </div>
      )}

      <div
        className={`flex flex-col ${
          isUser
            ? 'items-end max-w-[85%] sm:max-w-[75%]'
            : 'items-start w-full max-w-full sm:max-w-[92%]'
        }`}
      >
        {/* Author & Timestamp Bar */}
        <div className="flex items-center gap-2 mb-1 px-1 text-[11px] text-outline">
          <span className="font-semibold text-on-surface">
            {isUser ? 'Dr. Elena Vance (You)' : 'ResearchAI Multi-Agent Engine'}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px]">schedule</span>
            {formatTime(message.createdAt)}
          </span>
        </div>

        {/* Message Bubble */}
        {isUser ? (
          <div className="rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-on-primary font-body-sm text-body-sm shadow-md leading-relaxed">
            {message.content}
          </div>
        ) : (
          <div className="w-full rounded-2xl rounded-tl-sm border border-outline-variant/30 bg-surface-container-low p-4 sm:p-5 shadow-sm space-y-3">
            {message.structuredResponse ? (
              <StructuredResponseView response={message.structuredResponse} />
            ) : (
              <p className="font-body-md text-body-md leading-relaxed text-on-surface whitespace-pre-line">
                {message.content}
              </p>
            )}

            {/* Actions: Copy & Regenerate */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-outline-variant/20">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-surface-container-high hover:bg-surface-bright text-on-surface-variant hover:text-on-surface font-label-xs text-label-xs transition-colors"
                title="Copy entire response"
              >
                <span className="material-symbols-outlined text-[14px]">
                  {copied ? 'done' : 'content_copy'}
                </span>
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              {onRegenerate && (
                <button
                  type="button"
                  onClick={onRegenerate}
                  disabled={isRegenerating}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-surface-container-high hover:bg-surface-bright text-tertiary hover:text-primary font-label-xs text-label-xs transition-colors disabled:opacity-50"
                  title="Regenerate with same context"
                >
                  <span className={`material-symbols-outlined text-[14px] ${isRegenerating ? 'animate-spin' : ''}`}>
                    replay
                  </span>
                  <span>{isRegenerating ? 'Regenerating...' : 'Regenerate'}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-container-high border border-outline-variant/30 text-on-surface mt-1">
          <span className="material-symbols-outlined text-[18px]">person</span>
        </div>
      )}
    </div>
  );
}
