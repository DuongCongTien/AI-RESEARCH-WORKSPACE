import React from 'react';
import { DocumentStatus as DocumentStatusType } from '@/types';
import { CheckCircle2, Loader2, AlertCircle, UploadCloud } from 'lucide-react';

interface DocumentStatusProps {
  status: DocumentStatusType | string;
  progress?: number;
  className?: string;
  showIcon?: boolean;
}

export function DocumentStatus({
  status,
  progress,
  className = '',
  showIcon = true,
}: DocumentStatusProps) {
  const normalized = (status || '').toLowerCase();

  switch (normalized) {
    case 'ready':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 ${className}`}
        >
          {showIcon && <CheckCircle2 className="w-3.5 h-3.5" />}
          <span>Sẵn sàng</span>
        </span>
      );

    case 'processing':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 ${className}`}
        >
          {showIcon && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          <span>Đang xử lý{progress ? ` ${progress}%` : ''}</span>
        </span>
      );

    case 'uploading':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 ${className}`}
        >
          {showIcon && <UploadCloud className="w-3.5 h-3.5 animate-pulse" />}
          <span>Đang tải lên{progress ? ` ${progress}%` : ''}</span>
        </span>
      );

    case 'failed':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 ${className}`}
        >
          {showIcon && <AlertCircle className="w-3.5 h-3.5" />}
          <span>Thất bại</span>
        </span>
      );
  }
}
