'use client';

import React from 'react';

interface RiskItem {
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

interface RisksCardProps {
  risks?: RiskItem[];
}

export function RisksCard({ risks = [] }: RisksCardProps) {
  if (!risks || risks.length === 0) return null;

  const getSeverityStyle = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'high':
        return {
          badge: 'bg-rose-50 text-rose-700 border-rose-200',
          border: 'border-rose-200 hover:border-rose-400',
          dot: 'bg-rose-500',
        };
      case 'medium':
        return {
          badge: 'bg-amber-50 text-amber-700 border-amber-200',
          border: 'border-amber-200 hover:border-amber-400',
          dot: 'bg-amber-500',
        };
      case 'low':
      default:
        return {
          badge: 'bg-sky-50 text-sky-700 border-sky-200',
          border: 'border-sky-200 hover:border-sky-400',
          dot: 'bg-sky-500',
        };
    }
  };

  return (
    <div className="rounded-2xl border border-outline-variant/60 bg-surface p-5 shadow-xs transition-all duration-300 hover:shadow-md hover:border-rose-300 card-interactive">
      <div className="flex items-center gap-2 pb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-600 border border-rose-200">
          <span className="material-symbols-outlined text-[18px]">warning</span>
        </div>
        <h4 className="font-headline-sm text-headline-sm font-bold tracking-tight text-on-surface">
          Risk Assessment ({risks.length})
        </h4>
      </div>

      <div className="space-y-3">
        {risks.map((risk, index) => {
          const style = getSeverityStyle(risk.severity);
          return (
            <div
              key={index}
              className={`rounded-xl border bg-surface-container-low p-3.5 transition-all shadow-2xs hover:bg-surface ${style.border}`}
            >
              <div className="flex items-center justify-between gap-2 pb-1.5">
                <span className="font-semibold text-body-sm text-on-surface">{risk.title}</span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-label-xs text-label-xs font-bold uppercase border ${style.badge}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`}></span>
                  {risk.severity}
                </span>
              </div>
              <p className="text-body-sm text-on-surface-variant leading-relaxed">
                {risk.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
