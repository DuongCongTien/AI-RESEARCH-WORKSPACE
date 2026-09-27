'use client';

import React from 'react';
import { CheckCircle2, ListFilter } from 'lucide-react';

interface KeyPointsCardProps {
  keyPoints?: string[];
}

export function KeyPointsCard({ keyPoints = [] }: KeyPointsCardProps) {
  const points = keyPoints.filter((p) => typeof p === 'string' && p.trim().length > 0);

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs transition-all duration-200 hover:shadow-md hover:border-border/80">
      {/* Tiêu đề */}
      <div className="flex items-center gap-2.5 pb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-tertiary/10 text-tertiary border border-tertiary/20 shrink-0">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        </div>
        <h4 className="font-semibold text-sm sm:text-base tracking-tight text-foreground">
          Điểm cốt lõi
        </h4>
        {points.length > 0 && (
          <span className="text-xs text-muted-foreground ml-auto font-mono">
            {points.length} điểm
          </span>
        )}
      </div>

      {/* Danh sách hoặc Trạng thái trống */}
      {points.length === 0 ? (
        <div className="flex items-center gap-2 rounded-xl border border-dashed border-border/70 bg-muted/30 p-3.5 text-xs text-muted-foreground">
          <ListFilter className="w-4 h-4 text-muted-foreground/60 shrink-0" />
          <span>Không có điểm quan trọng nào được ghi nhận cho phân tích này.</span>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {points.map((point, index) => (
            <li
              key={index}
              className="flex items-start gap-3 rounded-xl border border-border/50 bg-surface-container-low/50 p-3 text-sm text-foreground transition-all hover:bg-surface hover:border-border shadow-2xs"
            >
              <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center text-emerald-500">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              </div>
              <span className="leading-relaxed font-normal">{point}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
