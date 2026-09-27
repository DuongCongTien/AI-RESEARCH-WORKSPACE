'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, FileText, ShieldAlert, ListChecks, Upload, AlertCircle } from 'lucide-react';

interface EmptyChatProps {
  onSelectPrompt?: (prompt: string) => void;
  hasSelectedDocs?: boolean;
  totalDocsCount?: number;
  onOpenUpload?: () => void;
}

export function EmptyChat({
  onSelectPrompt,
  hasSelectedDocs = true,
  totalDocsCount = 1,
  onOpenUpload,
}: EmptyChatProps) {
  const suggestions = [
    {
      title: 'Summarize key findings',
      icon: <FileText className="w-4 h-4 text-primary" />,
      query: 'Summarize the core findings and operational takeaways from the selected documents.',
    },
    {
      title: 'Analyze critical risks',
      icon: <ShieldAlert className="w-4 h-4 text-amber-500" />,
      query: 'What are the main risks, vulnerabilities, or bottlenecks identified in the documents?',
    },
    {
      title: 'Extract methodologies & metrics',
      icon: <ListChecks className="w-4 h-4 text-emerald-500" />,
      query: 'Extract the key metrics, quantitative benchmarks, and experimental methodologies used.',
    },
    {
      title: 'Recommended action plan',
      icon: <Sparkles className="w-4 h-4 text-indigo-500" />,
      query: 'What concrete actions and next steps are recommended based on these findings?',
    },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-2xl mx-auto my-auto animate-fade-in-up">
      {/* Brand Icon Badge */}
      <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4 shadow-sm border border-primary/20">
        <Sparkles className="w-7 h-7" />
      </div>

      <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1.5 tracking-tight">
        Start your research
      </h2>
      <p className="text-sm text-muted-foreground mb-6 max-w-md leading-relaxed">
        Upload documents and ask AI questions about your research. The assistant grounds every answer strictly in your document corpus.
      </p>

      {/* Edge Case 1: No documents uploaded at all */}
      {totalDocsCount === 0 && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 text-center max-w-md w-full">
          <p className="text-xs font-medium text-amber-800 dark:text-amber-300 mb-3">
            Upload at least one document to start research.
          </p>
          {onOpenUpload ? (
            <button
              type="button"
              onClick={onOpenUpload}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Document</span>
            </button>
          ) : (
            <Link
              href="/documents?upload=open"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Document</span>
            </Link>
          )}
        </div>
      )}

      {/* Edge Case 2: Documents exist, but none currently checked */}
      {totalDocsCount > 0 && !hasSelectedDocs && (
        <div className="mb-6 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs flex items-center gap-2 text-left max-w-md">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Please select at least one document from the context panel to ground your inquiry.</span>
        </div>
      )}

      {/* Suggested Prompts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
        {suggestions.map((item, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onSelectPrompt && onSelectPrompt(item.query)}
            className="flex items-start gap-3 p-3.5 rounded-xl bg-surface border border-border hover:border-primary/50 hover:bg-primary/5 text-left transition-all duration-200 shadow-2xs hover:shadow-sm cursor-pointer group"
          >
            <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors shrink-0">
              {item.icon}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors block">
                {item.title}
              </span>
              <span className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                &ldquo;{item.query}&rdquo;
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// Re-export as EmptyState for backwards compatibility
export { EmptyChat as EmptyState };
