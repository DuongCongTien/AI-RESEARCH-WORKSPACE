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
      title: 'Tóm tắt các phát hiện cốt lõi',
      icon: <FileText className="w-4 h-4 text-primary" />,
      query: 'Tóm tắt các phát hiện cốt lõi và các chỉ số hoạt động quan trọng từ những tài liệu đã chọn.',
    },
    {
      title: 'Phân tích các rủi ro quan trọng',
      icon: <ShieldAlert className="w-4 h-4 text-amber-500" />,
      query: 'Những rủi ro, lỗ hổng kỹ thuật hoặc điểm nghẽn chính được xác định trong tài liệu là gì?',
    },
    {
      title: 'Trích xuất phương pháp & chỉ số',
      icon: <ListChecks className="w-4 h-4 text-emerald-500" />,
      query: 'Trích xuất các chỉ số định lượng, tiêu chuẩn kiểm thử và phương pháp luận nghiên cứu được sử dụng.',
    },
    {
      title: 'Kế hoạch hành động đề xuất',
      icon: <Sparkles className="w-4 h-4 text-indigo-500" />,
      query: 'Những hành động cụ thể và các bước tiếp theo được khuyến nghị dựa trên kết quả này là gì?',
    },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-2xl mx-auto my-auto animate-fade-in-up">
      {/* Biểu tượng thương hiệu */}
      <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4 shadow-sm border border-primary/20">
        <Sparkles className="w-7 h-7" />
      </div>

      <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1.5 tracking-tight">
        Bắt đầu nghiên cứu
      </h2>
      <p className="text-sm text-muted-foreground mb-6 max-w-md leading-relaxed">
        Tải tài liệu lên và đặt câu hỏi cho AI về nghiên cứu của bạn. Trợ lý AI sẽ đối chiếu và trả lời bám sát toàn bộ tài liệu đã cung cấp.
      </p>

      {/* Trường hợp 1: Chưa có tài liệu nào trong workspace */}
      {totalDocsCount === 0 && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 text-center max-w-md w-full">
          <p className="text-xs font-medium text-amber-800 dark:text-amber-300 mb-3">
            Tải lên ít nhất một tài liệu để bắt đầu nghiên cứu.
          </p>
          {onOpenUpload ? (
            <button
              type="button"
              onClick={onOpenUpload}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Tải tài liệu lên</span>
            </button>
          ) : (
            <Link
              href="/documents?upload=open"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Tải tài liệu lên</span>
            </Link>
          )}
        </div>
      )}

      {/* Trường hợp 2: Có tài liệu nhưng chưa chọn tài liệu nào */}
      {totalDocsCount > 0 && !hasSelectedDocs && (
        <div className="mb-6 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs flex items-center gap-2 text-left max-w-md">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Vui lòng chọn ít nhất một tài liệu từ bảng ngữ cảnh để đối chiếu câu hỏi.</span>
        </div>
      )}

      {/* Lưới các câu hỏi gợi ý */}
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

// Export EmptyState để tương thích ngược
export { EmptyChat as EmptyState };
