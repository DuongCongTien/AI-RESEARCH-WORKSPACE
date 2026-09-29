'use client';

import React, { useState } from 'react';
import { CheckSquare, ListTodo, ChevronDown, ChevronUp, Code2 } from 'lucide-react';
import { ResearchAction } from '@/types/research';
import { MarkdownContent } from './MarkdownContent';

interface ActionsCardProps {
  actions?: ResearchAction[];
}

export function ActionsCard({ actions = [] }: ActionsCardProps) {
  const validActions = actions.filter((a) => a && a.title);

  // Default expand all if <= 4 actions so solutions and code are immediately readable
  const [expandedIndices, setExpandedIndices] = useState<Set<number>>(() => {
    return new Set(validActions.map((_, i) => i));
  });

  const toggleExpand = (idx: number) => {
    setExpandedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  const toggleAll = () => {
    if (expandedIndices.size === validActions.length) {
      setExpandedIndices(new Set());
    } else {
      setExpandedIndices(new Set(validActions.map((_, i) => i)));
    }
  };

  // Heuristic: action with code in description
  const hasCode = (desc?: string) => Boolean(desc && /```/.test(desc));

  return (
    <div
      className="rounded-2xl border border-border bg-surface p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/25 animate-fade-in-up card-interactive"
      style={{ animationDelay: '0.1s' }}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 shrink-0 shadow-sm">
          <ListTodo className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-sm tracking-tight text-foreground">Khuyến nghị hành động & Giải thuật</h4>
          <p className="text-[11px] text-muted-foreground font-mono">Hướng dẫn & mã nguồn</p>
        </div>
        {validActions.length > 0 && (
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={toggleAll}
              className="text-[11px] text-muted-foreground hover:text-foreground font-medium transition-colors cursor-pointer mr-1"
            >
              {expandedIndices.size === validActions.length ? 'Thu gọn' : 'Mở tất cả'}
            </button>
            <span className="text-xs text-primary font-mono font-semibold bg-primary/8 border border-primary/20 px-2 py-0.5 rounded-full">
              {validActions.length} bước
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      {validActions.length === 0 ? (
        <div className="flex items-center gap-2 rounded-xl border border-dashed border-border/70 bg-muted/20 p-3.5 text-xs text-muted-foreground">
          <CheckSquare className="w-4 h-4 text-muted-foreground/60 shrink-0" />
          <span>Không có khuyến nghị hành động cụ thể nào cho ngữ cảnh này.</span>
        </div>
      ) : (
        <div className="space-y-2.5">
          {validActions.map((action, index) => {
            const isExpanded = expandedIndices.has(index);

            return (
              <div
                key={index}
                className="rounded-xl border border-border/60 bg-surface-container-low/30 shadow-2xs overflow-hidden transition-all duration-200 hover:border-primary/30 hover:shadow-sm"
              >
                {/* Action header — clickable */}
                <div
                  className="flex items-start gap-3 p-3.5 cursor-pointer hover:bg-muted/20 select-none transition-colors"
                  onClick={() => toggleExpand(index)}
                >
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/12 text-primary text-xs font-bold font-mono border border-primary/20 shadow-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h5 className="font-semibold text-sm text-foreground leading-snug">
                        {action.title}
                      </h5>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {hasCode(action.description) && (
                          <span className="flex items-center gap-1 text-[10px] bg-primary/10 text-primary border border-primary/20 rounded px-1.5 py-0.5 font-mono font-medium">
                            <Code2 className="w-3 h-3" /> code
                          </span>
                        )}
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action description */}
                {action.description && isExpanded && (
                  <div className="px-3.5 pb-3.5 pt-0 border-t border-border/30">
                    <MarkdownContent content={action.description} className="mt-2.5" />
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
