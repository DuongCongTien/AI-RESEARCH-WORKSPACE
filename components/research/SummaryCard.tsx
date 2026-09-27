'use client';

import React, { useState } from 'react';
import { Copy, Check, FileText } from 'lucide-react';

interface SummaryCardProps {
  summary: string;
}

export function SummaryCard({ summary }: SummaryCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/25 bg-surface p-5 shadow-xs transition-all duration-200 hover:shadow-md hover:border-primary/40">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-tertiary to-secondary" />

      {/* Tiêu đề */}
      <div className="flex items-center justify-between gap-2 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <h4 className="font-semibold text-sm sm:text-base tracking-tight text-foreground">
            Tóm tắt
          </h4>
        </div>

        {summary && (
          <button
            type="button"
            onClick={handleCopy}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface hover:bg-muted text-muted-foreground hover:text-foreground transition-all active:scale-95 shadow-2xs cursor-pointer"
            title="Sao chép tóm tắt"
            aria-label="Sao chép tóm tắt"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        )}
      </div>

      {/* Nội dung */}
      <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-line">
        {summary || 'Không có tóm tắt khả dụng.'}
      </p>
    </div>
  );
}
