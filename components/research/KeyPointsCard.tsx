'use client';

import React from 'react';

interface KeyPointsCardProps {
  keyPoints?: string[];
}

export function KeyPointsCard({ keyPoints = [] }: KeyPointsCardProps) {
  if (!keyPoints || keyPoints.length === 0) return null;

  return (
    <div className="rounded-2xl border border-outline-variant/60 bg-surface p-5 shadow-xs transition-all duration-300 hover:shadow-md hover:border-tertiary/40 card-interactive">
      <div className="flex items-center gap-2 pb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-tertiary/10 text-tertiary border border-tertiary/20">
          <span className="material-symbols-outlined text-[18px]">verified</span>
        </div>
        <h4 className="font-headline-sm text-headline-sm font-bold tracking-tight text-on-surface">
          Key Insights &amp; Findings ({keyPoints.length})
        </h4>
      </div>

      <ul className="space-y-2.5">
        {keyPoints.map((point, index) => (
          <li
            key={index}
            className="flex items-start gap-3 rounded-xl border border-outline-variant/40 bg-surface-container-low p-3.5 text-body-sm text-on-surface transition-all hover:bg-surface hover:border-tertiary/30 shadow-2xs hover:translate-x-0.5"
          >
            <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center text-tertiary">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
            </div>
            <span className="leading-relaxed font-medium">{point}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
