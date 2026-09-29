'use client';

import React, { useState } from 'react';
import { BookOpen, FileText, Quote, ChevronDown, ChevronUp } from 'lucide-react';
import { ResearchSource } from '@/types/research';

interface SourcesCardProps {
  sources?: ResearchSource[];
}

export function SourcesCard({ sources = [] }: SourcesCardProps) {
  const validSources = sources.filter((s) => s && (s.documentName || s.documentId));
  const [showAll, setShowAll] = useState(false);
  const PREVIEW_COUNT = 3;
  const displayed = showAll || validSources.length <= PREVIEW_COUNT ? validSources : validSources.slice(0, PREVIEW_COUNT);

  return (
    <div
      className="rounded-2xl border border-border bg-surface p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-secondary/30 animate-fade-in-up card-interactive"
      style={{ animationDelay: '0.12s' }}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-secondary/10 border border-secondary/20 shrink-0 shadow-sm">
          <BookOpen className="w-4 h-4 text-secondary" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-sm tracking-tight text-foreground">Nguồn trích dẫn</h4>
          <p className="text-[11px] text-muted-foreground font-mono">Bằng chứng từ tài liệu</p>
        </div>
        {validSources.length > 0 && (
          <span className="text-xs text-secondary font-mono font-semibold bg-secondary/8 border border-secondary/20 px-2 py-0.5 rounded-full shrink-0">
            {validSources.length} trích dẫn
          </span>
        )}
      </div>

      {/* Content */}
      {validSources.length === 0 ? (
        <div className="flex items-center gap-2 rounded-xl border border-dashed border-border/70 bg-muted/20 p-3.5 text-xs text-muted-foreground">
          <FileText className="w-4 h-4 text-muted-foreground/60 shrink-0" />
          <span>Không có nguồn trích dẫn khả dụng.</span>
        </div>
      ) : (
        <>
          <div className="space-y-2.5">
            {displayed.map((src, index) => {
              const hasPage = typeof src.page === 'number' && !isNaN(src.page) && src.page > 0;

              return (
                <div
                  key={index}
                  className="rounded-xl border border-border/50 bg-gradient-to-br from-surface-container-low/30 to-surface p-3.5 transition-all shadow-2xs hover:border-secondary/30 hover:shadow-sm"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-secondary/8 border border-secondary/20">
                        <FileText className="w-3 h-3 text-secondary" />
                      </div>
                      <span className="text-xs font-semibold text-foreground truncate">
                        {src.documentName}
                      </span>
                    </div>
                    {hasPage && (
                      <span className="shrink-0 rounded-md bg-secondary/8 border border-secondary/20 px-2 py-0.5 font-mono text-[10px] font-semibold text-secondary">
                        Trang {src.page}
                      </span>
                    )}
                  </div>

                  {src.excerpt && (
                    <div className="mt-2 flex items-start gap-2 rounded-lg bg-surface/70 p-2.5 border border-border/40">
                      <Quote className="w-3 h-3 shrink-0 text-secondary/60 mt-0.5" />
                      <p className="italic leading-relaxed text-[11px] text-muted-foreground font-serif line-clamp-3">
                        &ldquo;{src.excerpt}&rdquo;
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {validSources.length > PREVIEW_COUNT && (
            <button
              type="button"
              onClick={() => setShowAll(!showAll)}
              className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-dashed border-border/60 hover:border-border rounded-xl py-2 transition-all cursor-pointer hover:bg-muted/30"
            >
              {showAll ? (
                <><ChevronUp className="w-3.5 h-3.5" /> Thu gọn</>
              ) : (
                <><ChevronDown className="w-3.5 h-3.5" /> Xem thêm {validSources.length - PREVIEW_COUNT} nguồn</>
              )}
            </button>
          )}
        </>
      )}
    </div>
  );
}
