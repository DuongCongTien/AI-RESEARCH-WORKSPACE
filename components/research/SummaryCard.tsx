'use client';

import React, { useState } from 'react';
import { Copy, Check, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { MarkdownContent } from './MarkdownContent';

interface SummaryCardProps {
  summary: string;
}

export function SummaryCard({ summary }: SummaryCardProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const isLong = summary && summary.length > 1500;

  const handleCopy = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-surface via-surface to-primary/3 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/35 animate-fade-in-up card-interactive">
      {/* Gradient top bar */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary via-secondary to-tertiary" />

      {/* Shimmer bg accent */}
      <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-primary/4 blur-3xl pointer-events-none" />

      <div className="relative p-5">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/12 text-primary border border-primary/20 shrink-0 shadow-sm">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-sm tracking-tight text-foreground">Nội dung phản hồi & Phân tích</h4>
              <p className="text-[11px] text-muted-foreground font-mono">Giải pháp & tổng hợp bám sát tài liệu</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {summary && (
              <button
                type="button"
                onClick={handleCopy}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-surface hover:bg-muted text-muted-foreground hover:text-foreground transition-all active:scale-90 shadow-2xs cursor-pointer"
                title="Sao chép tóm tắt"
                aria-label="Sao chép tóm tắt"
              >
                {copied ? (
                  <Check className="w-3 h-3 text-emerald-500" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            )}
            {isLong && (
              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-surface hover:bg-muted text-muted-foreground hover:text-foreground transition-all active:scale-90 shadow-2xs cursor-pointer"
                title={expanded ? 'Thu gọn' : 'Xem thêm'}
              >
                {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className={`transition-all duration-300 overflow-hidden ${isLong && !expanded ? 'max-h-48' : 'max-h-none'}`}>
          <MarkdownContent content={summary || 'Không có tóm tắt khả dụng.'} />
        </div>
        {isLong && !expanded && (
          <div className="mt-2 pt-2 border-t border-border/30 flex justify-center">
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="text-xs text-primary hover:underline font-medium cursor-pointer flex items-center gap-1"
            >
              Xem thêm <ChevronDown className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
