'use client';

import React from 'react';
import { Sparkles, FileText, ShieldAlert, ListChecks, HelpCircle } from 'lucide-react';

interface EmptyChatProps {
  onSelectPrompt?: (prompt: string) => void;
  hasSelectedDocs?: boolean;
}

export function EmptyChat({ onSelectPrompt, hasSelectedDocs = true }: EmptyChatProps) {
  const suggestions = [
    {
      title: 'Summarize this document',
      icon: <FileText className="w-4 h-4 text-primary" />,
      query: 'Summarize the core findings and executive takeaways of the selected documents.',
    },
    {
      title: 'What are the main risks?',
      icon: <ShieldAlert className="w-4 h-4 text-amber-500" />,
      query: 'What are the primary technical risks, limitations, or vulnerabilities highlighted in the text?',
    },
    {
      title: 'Extract key metrics & methodologies',
      icon: <ListChecks className="w-4 h-4 text-emerald-500" />,
      query: 'Extract the key quantitative metrics, benchmarks, and experimental methodologies used.',
    },
    {
      title: 'What are the recommended actions?',
      icon: <Sparkles className="w-4 h-4 text-indigo-500" />,
      query: 'What actionable next steps or roadmaps are recommended based on these findings?',
    },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-2xl mx-auto my-auto animate-fade-in-up">
      {/* Brand Icon Badge */}
      <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4 shadow-sm border border-primary/20">
        <Sparkles className="w-7 h-7 animate-pulse" />
      </div>

      <h2 className="text-xl font-bold text-foreground mb-1">
        AI Research Assistant
      </h2>
      <p className="text-sm text-muted-foreground mb-6 max-w-md">
        Ask anything about your uploaded research documents. The AI grounds every response strictly in the document context.
      </p>

      {!hasSelectedDocs && (
        <div className="mb-6 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs flex items-center gap-2">
          <HelpCircle className="w-4 h-4 shrink-0" />
          <span>Please select at least one document from the list above or sidebar to attach context.</span>
        </div>
      )}

      {/* Suggested prompts grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
        {suggestions.map((item, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onSelectPrompt && onSelectPrompt(item.query)}
            className="flex items-start gap-3 p-3.5 rounded-xl bg-surface border border-border/80 hover:border-primary/50 hover:bg-primary/5 text-left transition-all duration-200 shadow-2xs hover:shadow-sm cursor-pointer group"
          >
            <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors shrink-0">
              {item.icon}
            </div>
            <div>
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
