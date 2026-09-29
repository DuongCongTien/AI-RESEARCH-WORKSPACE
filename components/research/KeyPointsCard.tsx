'use client';

import React, { useState } from 'react';
import { CheckCircle2, ListFilter, ChevronDown, ChevronUp } from 'lucide-react';
import { MarkdownContent } from './MarkdownContent';

interface KeyPointsCardProps {
  keyPoints?: string[];
}

export function KeyPointsCard({ keyPoints = [] }: KeyPointsCardProps) {
  const points = keyPoints.filter((p) => typeof p === 'string' && p.trim().length > 0);
  const [showAll, setShowAll] = useState(false);
  const PREVIEW_COUNT = 4;
  const displayedPoints = showAll || points.length <= PREVIEW_COUNT ? points : points.slice(0, PREVIEW_COUNT);

  return (
    <div
      className="rounded-2xl border border-border bg-surface p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-emerald-400/30 animate-fade-in-up card-interactive"
      style={{ animationDelay: '0.05s' }}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 shrink-0 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-sm tracking-tight text-foreground">Điểm cốt lõi</h4>
          <p className="text-[11px] text-muted-foreground font-mono">Phát hiện quan trọng</p>
        </div>
        {points.length > 0 && (
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-semibold bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 px-2 py-0.5 rounded-full shrink-0">
            {points.length}
          </span>
        )}
      </div>

      {/* Content */}
      {points.length === 0 ? (
        <div className="flex items-center gap-2 rounded-xl border border-dashed border-border/70 bg-muted/20 p-3.5 text-xs text-muted-foreground">
          <ListFilter className="w-4 h-4 text-muted-foreground/60 shrink-0" />
          <span>Không có điểm quan trọng nào được ghi nhận.</span>
        </div>
      ) : (
        <>
          <ul className="space-y-2">
            {displayedPoints.map((point, index) => (
              <li
                key={index}
                className="flex items-start gap-3 rounded-xl border border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/15 p-3 text-sm text-foreground transition-all hover:border-emerald-300/50 hover:bg-emerald-50/60 dark:hover:border-emerald-800/60 shadow-2xs"
                style={{ animationDelay: `${index * 0.04}s` }}
              >
                <div className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.5)]" />
                </div>
                <div className="leading-relaxed min-w-0 flex-1">
                  <MarkdownContent content={point} compact />
                </div>
              </li>
            ))}
          </ul>

          {points.length > PREVIEW_COUNT && (
            <button
              type="button"
              onClick={() => setShowAll(!showAll)}
              className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-dashed border-border/60 hover:border-border rounded-xl py-2 transition-all cursor-pointer hover:bg-muted/30"
            >
              {showAll ? (
                <><ChevronUp className="w-3.5 h-3.5" /> Thu gọn</>
              ) : (
                <><ChevronDown className="w-3.5 h-3.5" /> Xem thêm {points.length - PREVIEW_COUNT} điểm</>
              )}
            </button>
          )}
        </>
      )}
    </div>
  );
}
