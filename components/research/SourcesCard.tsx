'use client';

import React from 'react';

interface SourceItem {
  documentId: string;
  documentName: string;
  page?: number;
  excerpt?: string;
}

interface SourcesCardProps {
  sources?: SourceItem[];
}

export function SourcesCard({ sources = [] }: SourcesCardProps) {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="rounded-2xl border border-outline-variant/60 bg-surface p-5 shadow-xs transition-all duration-300 hover:shadow-md hover:border-secondary/40 card-interactive">
      <div className="flex items-center gap-2 pb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-secondary/10 text-secondary border border-secondary/20">
          <span className="material-symbols-outlined text-[18px]">menu_book</span>
        </div>
        <h4 className="font-headline-sm text-headline-sm font-bold tracking-tight text-on-surface">
          Referenced Sources &amp; Citations ({sources.length})
        </h4>
      </div>

      <div className="grid gap-3 sm:grid-cols-1">
        {sources.map((src, index) => (
          <div
            key={index}
            className="rounded-xl border border-outline-variant/40 bg-surface-container-low p-3.5 transition-all shadow-2xs hover:bg-surface hover:border-secondary/30"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="material-symbols-outlined text-[16px] shrink-0 text-secondary">
                  description
                </span>
                <span className="text-body-sm font-bold text-on-surface truncate">
                  {src.documentName}
                </span>
              </div>
              {src.page && (
                <span className="shrink-0 rounded-md bg-surface-container-high px-2 py-0.5 font-label-xs text-label-xs text-on-surface-variant font-mono border border-outline-variant/40">
                  Page {src.page}
                </span>
              )}
            </div>

            {src.excerpt && (
              <div className="mt-2.5 flex items-start gap-2 rounded-lg bg-surface p-2.5 text-xs text-on-surface-variant border border-outline-variant/30 font-mono">
                <span className="material-symbols-outlined text-[14px] shrink-0 text-secondary mt-0.5">
                  format_quote
                </span>
                <p className="italic leading-relaxed">{src.excerpt}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
