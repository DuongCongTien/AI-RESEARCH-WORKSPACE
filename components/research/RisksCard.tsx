'use client';

import React from 'react';
import { AlertTriangle, AlertCircle, ShieldAlert, ShieldCheck } from 'lucide-react';
import { ResearchRisk } from '@/types/research';
import { MarkdownContent } from './MarkdownContent';

interface RisksCardProps {
  risks?: ResearchRisk[];
}

export function RisksCard({ risks = [] }: RisksCardProps) {
  const validRisks = risks.filter((r) => r && r.title);

  const getSeverityConfig = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'high':
        return {
          label: 'CAO',
          badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/50',
          wrapClass: 'border-l-[3px] border-l-rose-500 bg-rose-50/30 dark:bg-rose-950/10 border border-rose-200/60 dark:border-rose-900/40',
          dotClass: 'bg-rose-500 shadow-[0_0_6px_rgba(239,68,68,0.5)]',
          icon: <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />,
        };
      case 'medium':
        return {
          label: 'TRUNG BÌNH',
          badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50',
          wrapClass: 'border-l-[3px] border-l-amber-500 bg-amber-50/30 dark:bg-amber-950/10 border border-amber-200/60 dark:border-amber-900/40',
          dotClass: 'bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.5)]',
          icon: <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />,
        };
      default:
        return {
          label: 'THẤP',
          badgeClass: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/50',
          wrapClass: 'border-l-[3px] border-l-sky-400 bg-sky-50/30 dark:bg-sky-950/10 border border-sky-200/60 dark:border-sky-900/40',
          dotClass: 'bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.5)]',
          icon: <AlertCircle className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />,
        };
    }
  };

  return (
    <div
      className="rounded-2xl border border-border bg-surface p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-amber-400/30 animate-fade-in-up card-interactive"
      style={{ animationDelay: '0.08s' }}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 shrink-0 shadow-sm">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-sm tracking-tight text-foreground">Rủi ro & Lưu ý</h4>
          <p className="text-[11px] text-muted-foreground font-mono">Bẫy logic & lỗi thường gặp</p>
        </div>
        {validRisks.length > 0 && (
          <span className="text-xs text-amber-700 dark:text-amber-400 font-mono font-semibold bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 px-2 py-0.5 rounded-full shrink-0">
            {validRisks.length}
          </span>
        )}
      </div>

      {/* Content */}
      {validRisks.length === 0 ? (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200/60 bg-emerald-50/40 dark:bg-emerald-950/20 dark:border-emerald-800/40 p-4 text-sm text-emerald-800 dark:text-emerald-300">
          <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="font-medium">Không phát hiện rủi ro đáng chú ý.</span>
        </div>
      ) : (
        <div className="space-y-2.5">
          {validRisks.map((risk, index) => {
            const config = getSeverityConfig(risk.severity);
            return (
              <div
                key={index}
                className={`rounded-xl p-3.5 transition-all shadow-2xs overflow-hidden ${config.wrapClass}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {config.icon}
                    <span className="font-semibold text-sm text-foreground leading-snug">{risk.title}</span>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[10px] tracking-wide font-bold uppercase border ${config.badgeClass}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${config.dotClass}`} />
                    {config.label}
                  </span>
                </div>
                {risk.description && (
                  <div className="pl-6">
                    <MarkdownContent content={risk.description} compact />
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
