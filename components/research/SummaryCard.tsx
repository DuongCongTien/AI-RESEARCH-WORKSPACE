'use client';

import React, { useState } from 'react';

interface SummaryCardProps {
  summary: string;
}

export function SummaryCard({ summary }: SummaryCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-surface p-5 shadow-xs transition-all duration-300 hover:shadow-md hover:border-primary/50 card-interactive">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-tertiary to-secondary" />
      <div className="flex items-center justify-between gap-2 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
            <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
          </div>
          <h4 className="font-headline-sm text-headline-sm font-bold tracking-tight text-on-surface">
            Executive Summary
          </h4>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-outline-variant/50 bg-surface-container-low text-on-surface-variant hover:text-primary hover:border-primary/40 transition-all active:scale-95 shadow-2xs"
          title="Copy summary"
        >
          <span className="material-symbols-outlined text-[16px]">{copied ? 'done' : 'content_copy'}</span>
        </button>
      </div>
      <p className="text-body-md font-body-md leading-relaxed text-on-surface whitespace-pre-line">
        {summary}
      </p>
    </div>
  );
}
