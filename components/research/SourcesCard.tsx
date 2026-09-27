'use client';

import React from 'react';
import { BookOpen, FileText, Quote } from 'lucide-react';
import { ResearchSource } from '@/types/research';

interface SourcesCardProps {
  sources?: ResearchSource[];
}

export function SourcesCard({ sources = [] }: SourcesCardProps) {
  const validSources = sources.filter((s) => s && (s.documentName || s.documentId));

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs transition-all duration-200 hover:shadow-md hover:border-border/80">
      {/* Tiêu đề */}
      <div className="flex items-center gap-2.5 pb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-secondary/10 text-secondary border border-secondary/20 shrink-0">
          <BookOpen className="w-4 h-4" />
        </div>
        <h4 className="font-semibold text-sm sm:text-base tracking-tight text-foreground">
          Nguồn trích dẫn
        </h4>
        {validSources.length > 0 && (
          <span className="text-xs text-muted-foreground ml-auto font-mono">
            {validSources.length} trích dẫn
          </span>
        )}
      </div>

      {/* Danh sách trích dẫn hoặc Trạng thái trống */}
      {validSources.length === 0 ? (
        <div className="flex items-center gap-2 rounded-xl border border-dashed border-border/70 bg-muted/30 p-3.5 text-xs text-muted-foreground">
          <FileText className="w-4 h-4 text-muted-foreground/60 shrink-0" />
          <span>Không có nguồn trích dẫn khả dụng.</span>
        </div>
      ) : (
        <div className="space-y-3">
          {validSources.map((src, index) => {
            const hasPage = typeof src.page === 'number' && !isNaN(src.page) && src.page > 0;

            return (
              <div
                key={index}
                className="rounded-xl border border-border/60 bg-surface-container-low/40 p-3.5 transition-all shadow-2xs hover:bg-surface hover:border-secondary/30"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-4 h-4 shrink-0 text-secondary" />
                    <span className="text-xs font-semibold text-foreground truncate">
                      {src.documentName}
                    </span>
                  </div>

                  {/* Bỏ qua nếu không có số trang */}
                  {hasPage && (
                    <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 font-mono text-[11px] font-medium text-foreground border border-border">
                      Trang {src.page}
                    </span>
                  )}
                </div>

                {src.excerpt && (
                  <div className="mt-2.5 flex items-start gap-2 rounded-lg bg-surface/80 p-2.5 text-xs text-muted-foreground border border-border/50">
                    <Quote className="w-3.5 h-3.5 shrink-0 text-secondary/70 mt-0.5" />
                    <p className="italic leading-relaxed font-serif text-[12px]">
                      &ldquo;{src.excerpt}&rdquo;
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
