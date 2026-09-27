import React from 'react';
import { Loader2, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { DocumentStatus } from './DocumentStatus';

interface UploadProgressProps {
  progress: number;
  status: 'idle' | 'uploading' | 'processing' | 'ready' | 'failed';
  fileName?: string;
  stepMessage?: string;
  error?: string | null;
  onRetry?: () => void;
  className?: string;
}

export function UploadProgress({
  progress,
  status,
  fileName,
  stepMessage,
  error,
  onRetry,
  className = '',
}: UploadProgressProps) {
  if (status === 'idle') return null;

  return (
    <div
      className={`w-full p-4 rounded-xl border transition-all ${
        status === 'failed'
          ? 'bg-rose-500/5 border-rose-500/20'
          : status === 'ready'
            ? 'bg-emerald-500/5 border-emerald-500/20'
            : 'bg-surface border-border shadow-xs'
      } ${className}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 truncate">
          {status === 'uploading' && (
            <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" />
          )}
          {status === 'processing' && (
            <Loader2 className="w-4 h-4 animate-spin text-amber-500 shrink-0" />
          )}
          {status === 'ready' && (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          )}
          {status === 'failed' && (
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          )}
          <span className="text-xs font-semibold text-foreground truncate">
            {fileName || 'Uploading document...'}
          </span>
        </div>
        <DocumentStatus status={status} progress={progress} />
      </div>

      {/* Progress Track */}
      {(status === 'uploading' || status === 'processing') && (
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden relative mt-1">
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              status === 'processing' ? 'bg-amber-500' : 'bg-primary'
            }`}
            style={{ width: `${Math.max(5, Math.min(100, progress))}%` }}
          />
        </div>
      )}

      {/* Status Details */}
      <div className="flex items-center justify-between mt-2 text-[11px] text-muted-foreground">
        <span>
          {status === 'uploading' && `Uploading... ${progress}%`}
          {status === 'processing' && (stepMessage || 'Processing document & indexing...')}
          {status === 'ready' && 'Document ready for research synthesis!'}
          {status === 'failed' && (error || 'Failed to process document.')}
        </span>
        {status === 'failed' && onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1 text-xs font-medium text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Retry</span>
          </button>
        )}
      </div>
    </div>
  );
}
