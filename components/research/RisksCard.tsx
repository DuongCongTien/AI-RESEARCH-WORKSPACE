'use client';

import React from 'react';
import { AlertTriangle, AlertCircle, ShieldAlert, ShieldCheck } from 'lucide-react';
import { ResearchRisk } from '@/types/research';

interface RisksCardProps {
  risks?: ResearchRisk[];
}

export function RisksCard({ risks = [] }: RisksCardProps) {
  const validRisks = risks.filter((r) => r && r.title);

  const getSeverityConfig = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'high':
        return {
          label: 'RỦI RO CAO',
          badgeClass: 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800 font-bold',
          borderClass: 'border-l-4 border-l-rose-500 border-rose-200 dark:border-rose-900/60',
          icon: <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />,
        };
      case 'medium':
        return {
          label: 'RỦI RO TRUNG BÌNH',
          badgeClass: 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800 font-semibold',
          borderClass: 'border-l-4 border-l-amber-500 border-amber-200 dark:border-amber-900/60',
          icon: <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />,
        };
      case 'low':
      default:
        return {
          label: 'RỦI RO THẤP',
          badgeClass: 'bg-sky-50 text-sky-700 border-sky-300 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800 font-medium',
          borderClass: 'border-l-4 border-l-sky-500 border-sky-200 dark:border-sky-900/60',
          icon: <AlertCircle className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />,
        };
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs transition-all duration-200 hover:shadow-md hover:border-border/80">
      {/* Tiêu đề */}
      <div className="flex items-center gap-2.5 pb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
          <AlertTriangle className="w-4 h-4" />
        </div>
        <h4 className="font-semibold text-sm sm:text-base tracking-tight text-foreground">
          Rủi ro
        </h4>
        {validRisks.length > 0 && (
          <span className="text-xs text-muted-foreground ml-auto font-mono">
            {validRisks.length} rủi ro
          </span>
        )}
      </div>

      {/* Danh sách rủi ro hoặc Trạng thái trống */}
      {validRisks.length === 0 ? (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200/60 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-800/40 p-4 text-sm text-emerald-800 dark:text-emerald-300">
          <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="font-medium">Không phát hiện rủi ro đáng chú ý.</span>
        </div>
      ) : (
        <div className="space-y-3">
          {validRisks.map((risk, index) => {
            const config = getSeverityConfig(risk.severity);
            return (
              <div
                key={index}
                className={`rounded-xl border bg-surface-container-low/40 p-3.5 transition-all shadow-2xs ${config.borderClass}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-1.5">
                  <div className="flex items-center gap-2">
                    {config.icon}
                    <span className="font-semibold text-sm text-foreground">
                      {risk.title}
                    </span>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] tracking-wide uppercase border ${config.badgeClass}`}
                  >
                    {config.label}
                  </span>
                </div>
                {risk.description && (
                  <p className="text-xs leading-relaxed text-muted-foreground pl-6">
                    {risk.description}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
