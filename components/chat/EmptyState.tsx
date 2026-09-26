'use client';

import React from 'react';

interface EmptyStateProps {
  onSelectPrompt: (prompt: string) => void;
}

export function EmptyState({ onSelectPrompt }: EmptyStateProps) {
  const suggestedPrompts = [
    {
      title: 'Literature Synthesis',
      description: 'Summarize core paradigms, advantages, and algorithmic tradeoffs from uploaded papers.',
      prompt: 'Synthesize the main paradigms and algorithmic breakthroughs discussed in our attached research papers.',
      icon: 'auto_awesome',
      color: 'text-tertiary',
    },
    {
      title: 'Risk & Limitations Audit',
      description: 'Identify potential safety hazards, context window limitations, and bias vulnerabilities.',
      prompt: 'Identify critical vulnerabilities, hallucinations, and scalability bottlenecks in our proposed architecture.',
      icon: 'warning',
      color: 'text-error',
    },
    {
      title: 'Actionable Implementation Plan',
      description: 'Extract concrete engineering steps, dataset recommendations, and evaluation benchmarks.',
      prompt: 'Formulate an actionable 3-phase roadmap and experimental benchmarks based on current findings.',
      icon: 'checklist',
      color: 'text-primary',
    },
  ];

  return (
    <div className="flex h-full flex-col items-center justify-center px-4 py-8 text-center max-w-3xl mx-auto">
      {/* Hero Badge */}
      <div className="inline-flex items-center gap-2 rounded-full border border-tertiary/30 bg-tertiary/10 px-3.5 py-1.5 text-label-xs font-label-xs font-medium text-tertiary mb-6">
        <span className="material-symbols-outlined text-[14px] animate-pulse">psychology</span>
        <span>Autonomous Multi-Agent Synthesis</span>
      </div>

      {/* Main Title & Subtitle */}
      <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">
        Start Your Research Inquiry
      </h1>
      <p className="mt-3 max-w-xl font-body-md text-body-md text-on-surface-variant leading-relaxed">
        Upload scientific papers, engineering specs, or literature notes. The AI agent will extract executive summaries, key findings, risk severity analyses, and actionable next steps grounded in your indexed corpus.
      </p>

      {/* Prompt Cards */}
      <div className="mt-8 grid w-full gap-4 sm:grid-cols-3 text-left">
        {suggestedPrompts.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectPrompt(item.prompt)}
            className="group relative flex flex-col justify-between rounded-2xl border border-outline-variant/60 bg-surface p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 cursor-pointer card-interactive shadow-xs"
          >
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-container-high mb-3 group-hover:scale-110 transition-transform">
                <span className={`material-symbols-outlined text-[20px] ${item.color}`}>
                  {item.icon}
                </span>
              </div>
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface group-hover:text-primary transition-colors">
                {item.title}
              </h3>
              <p className="mt-1 text-body-sm font-body-sm leading-relaxed text-on-surface-variant line-clamp-3">
                {item.description}
              </p>
            </div>

            <div className="mt-4 flex items-center gap-1 font-label-xs text-label-xs font-semibold text-primary group-hover:translate-x-1 transition-transform">
              <span>Run analysis</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </div>
          </button>
        ))}
      </div>

      {/* Pro tip */}
      <div className="mt-8 flex items-center gap-2 font-body-sm text-body-sm text-outline bg-surface-container-low px-4 py-2 rounded-full border border-outline-variant/40 shadow-2xs">
        <span className="material-symbols-outlined text-[16px] text-tertiary">lightbulb</span>
        <span>Tip: Toggle active documents in the Workspace Documents hub to ground multi-agent inquiries.</span>
      </div>
    </div>
  );
}
