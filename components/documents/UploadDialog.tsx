'use client';

import React, { useState, useRef } from 'react';
import { DocumentItem } from '@/types';
import { UploadProgress } from './UploadProgress';
import { FileText, X, Plus, Trash2, CheckCircle2, AlertTriangle, UploadCloud } from 'lucide-react';

interface UploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUploaded: (docs: DocumentItem | DocumentItem[]) => void;
}

export function UploadDialog({ isOpen, onClose, onUploaded }: UploadDialogProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'processing' | 'ready' | 'failed'>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [stepMessage, setStepMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const validExtensions = ['.pdf', '.docx', '.txt', '.json', '.md'];
  const maxSizeBytes = 25 * 1024 * 1024; // 25MB per file

  const validateFiles = (incomingFiles: FileList | File[]): { valid: File[]; rejected: string[] } => {
    const valid: File[] = [];
    const rejected: string[] = [];

    Array.from(incomingFiles).forEach((f) => {
      const lowerName = f.name.toLowerCase();
      const hasValidExt = validExtensions.some((ext) => lowerName.endsWith(ext));
      if (!hasValidExt) {
        rejected.push(`${f.name} (định dạng không hỗ trợ)`);
        return;
      }
      if (f.size > maxSizeBytes) {
        rejected.push(`${f.name} (vượt quá 25MB)`);
        return;
      }
      valid.push(f);
    });

    return { valid, rejected };
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      appendFiles(e.target.files);
    }
  };

  const appendFiles = (incomingFiles: FileList | File[]) => {
    setErrorMessage(null);
    setUploadStatus('idle');

    const { valid, rejected } = validateFiles(incomingFiles);

    if (rejected.length > 0) {
      setErrorMessage(`Một số tệp bị từ chối: ${rejected.join(', ')}`);
    }

    if (valid.length > 0) {
      setFiles((prev) => {
        const existingKeys = new Set(prev.map((f) => `${f.name}-${f.size}`));
        const newUnique = valid.filter((f) => !existingKeys.has(`${f.name}-${f.size}`));
        return [...prev, ...newUnique];
      });
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    if (errorMessage) setErrorMessage(null);
  };

  const clearAllFiles = () => {
    setFiles([]);
    setErrorMessage(null);
    setUploadStatus('idle');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      appendFiles(e.dataTransfer.files);
    }
  };

  const totalSizeBytes = files.reduce((acc, f) => acc + f.size, 0);
  const totalSizeFormatted =
    totalSizeBytes > 1024 * 1024
      ? `${(totalSizeBytes / (1024 * 1024)).toFixed(1)} MB`
      : `${(totalSizeBytes / 1024).toFixed(0)} KB`;

  const handleUploadSubmit = async () => {
    if (files.length === 0) return;

    setUploadStatus('uploading');
    setUploadProgress(20);
    setStepMessage(`Đang tải lên ${files.length} tệp dữ liệu...`);
    setErrorMessage(null);

    const formData = new FormData();
    files.forEach((f) => {
      formData.append('files', f);
      formData.append('file', f);
    });

    try {
      await new Promise((r) => setTimeout(r, 200));
      setUploadProgress(60);
      setUploadStatus('processing');
      setStepMessage(`Đang trích xuất nội dung văn bản và cấu trúc ${files.length} tệp...`);

      const res = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
      });

      setUploadProgress(85);
      setStepMessage('Đang lập chỉ mục véc-tơ & cập nhật không gian nghiên cứu...');
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Xử lý tải lên tài liệu thất bại');
      }

      setUploadProgress(100);
      setUploadStatus('ready');
      setStepMessage(`Đã nạp thành công ${json.count || files.length} tài liệu vào không gian nghiên cứu!`);

      setTimeout(() => {
        const uploadedDocs = json.items || (Array.isArray(json.data) ? json.data : [json.data]);
        onUploaded(uploadedDocs);
      }, 700);
    } catch (err) {
      console.error('Upload error:', err);
      const msg = err instanceof Error ? err.message : 'Tải lên thất bại. Vui lòng kiểm tra kết nối mạng hoặc định dạng tệp.';
      setErrorMessage(msg);
      setUploadStatus('failed');
      setUploadProgress(0);
    }
  };

  const isUploading = uploadStatus === 'uploading' || uploadStatus === 'processing';

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in-up">
      <div className="w-full max-w-xl bg-surface border border-border/80 rounded-2xl shadow-2xl p-5 sm:p-6 flex flex-col gap-4 max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border/60 pb-3.5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shadow-xs">
              <UploadCloud className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-base text-foreground">
                Tải lên tài liệu nghiên cứu
              </h3>
              <p className="text-xs text-muted-foreground">
                Hỗ trợ chọn và nạp đồng thời nhiều tệp (PDF, DOCX, TXT, JSON, MD)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="text-muted-foreground hover:text-foreground hover:bg-muted p-1.5 rounded-lg transition-colors cursor-pointer"
            title="Đóng hộp thoại"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && uploadStatus !== 'failed' && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-2.5 text-rose-600 dark:text-rose-400 text-xs shrink-0">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* Scrollable middle area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-0.5">
          {/* Hidden multi-file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.docx,.txt,.json,.md"
            multiple
            className="hidden"
          />

          {/* Drag & Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 sm:p-7 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 select-none ${
              files.length > 0
                ? 'border-primary/40 bg-primary/4 hover:bg-primary/7'
                : 'border-border/80 hover:border-primary/60 bg-muted/20 hover:bg-muted/40'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mb-2.5 shadow-xs">
              <UploadCloud className="w-6 h-6 text-primary" />
            </div>
            <p className="font-semibold text-sm text-foreground">
              Kéo &amp; thả một hoặc nhiều tệp vào đây
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Hoặc nhấn để mở trình chọn tệp (Có thể giữ phím Ctrl / Shift để chọn nhiều tệp)
            </p>
            <div className="mt-2 flex flex-wrap justify-center gap-1.5">
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-muted text-muted-foreground">PDF</span>
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-muted text-muted-foreground">DOCX</span>
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-muted text-muted-foreground">TXT</span>
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-muted text-muted-foreground">JSON</span>
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-muted text-muted-foreground">MD</span>
              <span className="text-[10px] font-mono text-muted-foreground/80">• Tối đa 25MB/tệp</span>
            </div>
          </div>

          {/* Selected Files List */}
          {files.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs px-1">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  Đã chọn {files.length} tệp ({totalSizeFormatted})
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="inline-flex items-center gap-1 text-primary hover:underline font-semibold cursor-pointer disabled:opacity-50"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Thêm tệp
                  </button>
                  <span className="text-muted-foreground/40">•</span>
                  <button
                    type="button"
                    onClick={clearAllFiles}
                    disabled={isUploading}
                    className="inline-flex items-center gap-1 text-rose-500 hover:underline font-medium cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Xóa tất cả
                  </button>
                </div>
              </div>

              <div className="max-h-48 overflow-y-auto rounded-xl border border-border/70 bg-surface divide-y divide-border/50">
                {files.map((f, idx) => {
                  const ext = f.name.split('.').pop()?.toUpperCase() || 'FILE';
                  const sizeKb = (f.size / 1024).toFixed(0);

                  return (
                    <div
                      key={`${f.name}-${idx}`}
                      className="flex items-center justify-between gap-3 px-3.5 py-2.5 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
                          <FileText className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-xs font-medium text-foreground truncate block">
                            {f.name}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {ext} • {sizeKb} KB
                          </span>
                        </div>
                      </div>

                      {!isUploading && (
                        <button
                          type="button"
                          onClick={() => removeFile(idx)}
                          className="text-muted-foreground hover:text-rose-500 p-1 rounded transition-colors cursor-pointer shrink-0"
                          title={`Bỏ tệp ${f.name}`}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Upload & Ingestion Progress Component */}
          {uploadStatus !== 'idle' && (
            <div className="flex flex-col gap-2 pt-1">
              <UploadProgress
                status={uploadStatus}
                progress={uploadProgress}
                fileName={files.length === 1 ? files[0].name : `${files.length} tệp nghiên cứu`}
                stepMessage={stepMessage}
                error={errorMessage}
                onRetry={handleUploadSubmit}
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border/60 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="px-4 py-2 rounded-xl border border-border bg-surface hover:bg-muted text-foreground text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleUploadSubmit}
            disabled={files.length === 0 || isUploading || uploadStatus === 'ready'}
            className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm active:scale-95 cursor-pointer ${
              files.length > 0 && !isUploading && uploadStatus !== 'ready'
                ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20'
                : 'bg-muted text-muted-foreground cursor-not-allowed opacity-60'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            {uploadStatus === 'uploading'
              ? `Đang tải ${files.length} tệp...`
              : uploadStatus === 'processing'
              ? 'Đang xử lý & lập chỉ mục...'
              : uploadStatus === 'ready'
              ? 'Hoàn thành'
              : `Bắt đầu nạp ${files.length > 0 ? `${files.length} tệp` : 'dữ liệu'}`}
          </button>
        </div>
      </div>
    </div>
  );
}
