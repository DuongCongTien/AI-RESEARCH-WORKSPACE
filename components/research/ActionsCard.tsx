'use client';

import React from 'react';

interface ActionItem {
  title: string;
  description?: string;
}

interface ActionsCardProps {
  actions?: ActionItem[];
}

export function ActionsCard({ actions = [] }: ActionsCardProps) {
  if (!actions || actions.length === 0) return null;

  return (
    <div className="rounded-2xl border border-outline-variant/60 bg-surface p-5 shadow-xs transition-all duration-300 hover:shadow-md hover:border-primary/40 card-interactive">
      <div className="flex items-center gap-2 pb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
          <span className="material-symbols-outlined text-[18px]">checklist</span>
        </div>
        <h4 className="font-headline-sm text-headline-sm font-bold tracking-tight text-on-surface">
          Recommended Actions ({actions.length})
        </h4>
      </div>

      <div className="space-y-3">
        {actions.map((action, index) => (
          <div
            key={index}
            className="flex items-start gap-3 rounded-xl border border-outline-variant/40 bg-surface-container-low p-3.5 transition-all shadow-2xs hover:bg-surface hover:border-primary/30"
          >
            <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary font-label-xs font-bold">
              {index + 1}
            </div>
            <div className="space-y-1">
              <h5 className="font-semibold text-body-sm text-on-surface">{action.title}</h5>
              {action.description && (
                <p className="text-body-sm text-on-surface-variant leading-relaxed">
                  {action.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
