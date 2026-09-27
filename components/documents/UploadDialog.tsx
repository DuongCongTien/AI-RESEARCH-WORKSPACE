'use client';

import React, { useState, useRef } from 'react';
import { DocumentItem } from '@/types';
import { UploadProgress } from './UploadProgress';

interface UploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUploaded: (doc: DocumentItem) => void;
}

export function UploadDialog({ isOpen, onClose, onUploaded }: UploadDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'processing' | 'ready' | 'failed'>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [stepMessage, setStepMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      validateAndSetFile(selected);
    }
  };

  const validateAndSetFile = (selected: File) => {
    setErrorMessage(null);
    setUploadStatus('idle');
    const maxSizeBytes = 25 * 1024 * 1024; // 25MB limit
    if (selected.size > maxSizeBytes) {
      setErrorMessage('Dung lượng tệp vượt quá giới hạn tối đa 25MB.');
      return;
    }

    const validExtensions = ['.pdf', '.docx', '.txt', '.json', '.md'];
    const lowerName = selected.name.toLowerCase();
    const hasValidExt = validExtensions.some((ext) => lowerName.endsWith(ext));

    if (!hasValidExt) {
      setErrorMessage('Định dạng tệp không được hỗ trợ. Vui lòng tải lên tệp PDF, DOCX, TXT hoặc JSON.');
      return;
    }

    setFile(selected);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleUploadSubmit = async () => {
    if (!file) return;

    setUploadStatus('uploading');
    setUploadProgress(25);
    setStepMessage('Đang tải tệp dữ liệu lên...');
    setErrorMessage(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Simulate progressive network telemetry
      await new Promise((r) => setTimeout(r, 200));
      setUploadProgress(65);
      setUploadStatus('processing');
      setStepMessage('Đang trích xuất nội dung văn bản và phân tích...');

      const res = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
      });

      setUploadProgress(90);
      setStepMessage('Đang lập chỉ mục véc-tơ & hoàn tất...');
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Xử lý tải lên tài liệu thất bại');
      }

      setUploadProgress(100);
      setUploadStatus('ready');
      setStepMessage('Đã xử lý tài liệu thành công!');

      setTimeout(() => {
        onUploaded(json.data);
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
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in-up">
      <div className="w-full max-w-lg bg-surface border border-outline-variant/50 rounded-2xl shadow-2xl p-space-lg flex flex-col gap-space-md">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">cloud_upload</span>
            </div>
            <div>
              <span className="font-headline-sm text-headline-sm text-on-surface font-semibold block">
                Tải lên tài liệu nghiên cứu
              </span>
              <span className="font-label-xs text-label-xs text-outline block">
                Tự động trích xuất nội dung, OCR &amp; lập chỉ mục
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && uploadStatus !== 'failed' && (
          <div className="p-3 bg-error-container/30 border border-error/30 rounded-xl flex items-start gap-2 text-error">
            <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">report_problem</span>
            <span className="text-body-sm font-body-sm leading-tight">{errorMessage}</span>
          </div>
        )}

        {/* Drag & Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-space-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 card-interactive ${
            file
              ? 'border-primary/60 bg-primary/5 shadow-xs'
              : 'border-outline-variant/60 hover:border-primary/50 bg-surface-container-low hover:bg-surface-container/60'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.docx,.txt,.json,.md"
            className="hidden"
          />
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-transform ${
              file
                ? 'bg-primary text-on-primary scale-110 shadow-md'
                : 'bg-surface text-tertiary shadow-xs border border-outline-variant/40'
            }`}
          >
            <span className="material-symbols-outlined text-[30px]">
              {file ? 'check_circle' : 'upload_file'}
            </span>
          </div>
          {file ? (
            <div className="space-y-1">
              <span className="font-body-md text-body-md text-on-surface font-semibold block truncate max-w-xs">
                {file.name}
              </span>
              <span className="font-label-xs text-label-xs text-outline">
                {(file.size / 1024).toFixed(1)} KB • Nhấn để chọn tệp khác
              </span>
            </div>
          ) : (
            <div className="space-y-1">
              <span className="font-body-md text-body-md text-on-surface font-semibold block">
                Kéo và thả tài liệu nghiên cứu vào đây
              </span>
              <span className="font-label-xs text-label-xs text-outline block">
                Hỗ trợ PDF, DOCX, TXT, JSON (tối đa 25MB)
              </span>
            </div>
          )}
        </div>

        {/* Upload & Ingestion Progress Component */}
        {uploadStatus !== 'idle' && (
          <UploadProgress
            status={uploadStatus}
            progress={uploadProgress}
            fileName={file?.name}
            stepMessage={stepMessage}
            error={errorMessage}
            onRetry={handleUploadSubmit}
          />
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-space-sm pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="px-space-md py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface font-body-sm text-body-sm font-medium transition-colors cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleUploadSubmit}
            disabled={!file || isUploading || uploadStatus === 'ready'}
            className={`inline-flex items-center gap-2 px-space-lg py-2.5 rounded-xl font-body-sm text-body-sm font-semibold transition-all shadow-md active:scale-95 cursor-pointer ${
              file && !isUploading && uploadStatus !== 'ready'
                ? 'bg-primary hover:bg-primary-fixed text-on-primary hover:shadow-lg'
                : 'bg-surface-container-high text-outline cursor-not-allowed'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {uploadStatus === 'ready' ? 'check' : 'cloud_upload'}
            </span>
            {uploadStatus === 'uploading'
              ? 'Đang tải lên...'
              : uploadStatus === 'processing'
                ? 'Đang xử lý...'
                : uploadStatus === 'ready'
                  ? 'Đã hoàn thành'
                  : 'Bắt đầu nạp dữ liệu'}
          </button>
        </div>
      </div>
    </div>
  );
}
