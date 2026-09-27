'use client';

import React from 'react';
import { CheckSquare, ListTodo } from 'lucide-react';
import { ResearchAction } from '@/types/research';

interface ActionsCardProps {
  actions?: ResearchAction[];
}

export function ActionsCard({ actions = [] }: ActionsCardProps) {
  const validActions = actions.filter((a) => a && a.title);

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs transition-all duration-200 hover:shadow-md hover:border-border/80">
      {/* Tiêu đề */}
      <div className="flex items-center gap-2.5 pb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
          <ListTodo className="w-4 h-4" />
        </div>
        <h4 className="font-semibold text-sm sm:text-base tracking-tight text-foreground">
          Khuyến nghị hành động
        </h4>
        {validActions.length > 0 && (
          <span className="text-xs text-muted-foreground ml-auto font-mono">
            {validActions.length} bước
          </span>
        )}
      </div>

      {/* Danh sách hành động hoặc Trạng thái trống */}
      {validActions.length === 0 ? (
        <div className="flex items-center gap-2 rounded-xl border border-dashed border-border/70 bg-muted/30 p-3.5 text-xs text-muted-foreground">
          <CheckSquare className="w-4 h-4 text-muted-foreground/60 shrink-0" />
          <span>Không có khuyến nghị hành động cụ thể nào cho ngữ cảnh này.</span>
        </div>
      ) : (
        <div className="space-y-3">
          {validActions.map((action, index) => (
            <div
              key={index}
              className="flex items-start gap-3 rounded-xl border border-border/50 bg-surface-container-low/40 p-3.5 transition-all shadow-2xs hover:bg-surface hover:border-primary/30"
            >
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold font-mono">
                {index + 1}
              </div>
              <div className="space-y-1 min-w-0 flex-1">
                <h5 className="font-medium text-sm text-foreground">
                  {action.title}
                </h5>
                {action.description && (
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {action.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
