'use client';

import React, { useRef, useEffect } from 'react';
import { ArrowUp, Loader2, Paperclip } from 'lucide-react';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  disabled?: boolean;
  placeholder?: string;
  selectedCount?: number;
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  isLoading,
  disabled = false,
  placeholder = 'Đặt câu hỏi về tài liệu của bạn...',
  selectedCount = 0,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Tự động co giãn chiều cao textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        160,
        Math.max(44, textareaRef.current.scrollHeight)
      )}px`;
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && value.trim() && !disabled) {
        onSubmit();
      }
    }
  };

  return (
    <div className="w-full relative">
      <div className="relative flex flex-col w-full rounded-2xl border border-border bg-surface shadow-md focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 transition-all p-2">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isLoading}
          rows={1}
          className="w-full resize-none bg-transparent px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50 min-h-[40px] max-h-[160px]"
        />

        <div className="flex items-center justify-between pt-1.5 px-2 border-t border-border/40 mt-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {selectedCount > 0 ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium text-[11px]">
                <Paperclip className="w-3 h-3" />
                {selectedCount} tài liệu trong ngữ cảnh
              </span>
            ) : (
              <span className="text-amber-600 dark:text-amber-400 text-[11px]">
                Chưa chọn tài liệu nào
              </span>
            )}
            <span className="hidden sm:inline text-[11px] text-muted-foreground/70">
              Nhấn Enter để gửi, Shift+Enter để xuống dòng
            </span>
          </div>

          <button
            type="button"
            onClick={onSubmit}
            disabled={!value.trim() || isLoading || disabled}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
              value.trim() && !isLoading && !disabled
                ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm active:scale-95 cursor-pointer'
                : 'bg-muted text-muted-foreground/50 cursor-not-allowed'
            }`}
            title="Gửi câu hỏi"
            aria-label="Gửi câu hỏi"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ArrowUp className="w-4 h-4 stroke-[2.5]" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
