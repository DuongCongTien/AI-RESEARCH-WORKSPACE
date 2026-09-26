'use client';

import React, { useState, useRef } from 'react';
import { DocumentItem } from '@/types';

interface UploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUploaded: (doc: DocumentItem) => void;
}

export function UploadDialog({ isOpen, onClose, onUploaded }: UploadDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
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
    const maxSizeBytes = 25 * 1024 * 1024; // 25MB limit
    if (selected.size > maxSizeBytes) {
      setErrorMessage('File size exceeds the 25MB maximum limit.');
      return;
    }

    const validExtensions = ['.pdf', '.docx', '.txt', '.json', '.md'];
    const lowerName = selected.name.toLowerCase();
    const hasValidExt = validExtensions.some((ext) => lowerName.endsWith(ext));

    if (!hasValidExt) {
      setErrorMessage('Unsupported file format. Please upload PDF, DOCX, TXT, or JSON files.');
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

    setIsUploading(true);
    setUploadProgress(20);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploadProgress(45);
      const res = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
      });

      setUploadProgress(85);
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to process document upload');
      }

      setUploadProgress(100);
      onUploaded(json.data);
    } catch (err) {
      console.error('Upload error:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Upload failed. Please check network connection.');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

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
              <span className="font-headline-sm text-headline-sm text-on-surface font-semibold block">Upload Research Document</span>
              <span className="font-label-xs text-label-xs text-outline block">Auto OCR &amp; High-Dimension Embedding</span>
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
        {errorMessage && (
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
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-transform ${
            file ? 'bg-primary text-on-primary scale-110 shadow-md' : 'bg-surface text-tertiary shadow-xs border border-outline-variant/40'
          }`}>
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
                {(file.size / 1024).toFixed(1)} KB • Click to choose a different file
              </span>
            </div>
          ) : (
            <div className="space-y-1">
              <span className="font-body-md text-body-md text-on-surface font-semibold block">
                Drag and drop research papers or documents here
              </span>
              <span className="font-label-xs text-label-xs text-outline block">
                Supports PDF, DOCX, TXT, JSON (up to 25MB)
              </span>
            </div>
          )}
        </div>

        {/* Progress Bar when uploading */}
        {isUploading && (
          <div className="space-y-1.5 p-3 rounded-xl bg-surface-container-low border border-outline-variant/40">
            <div className="flex justify-between font-label-xs text-label-xs text-on-surface-variant font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                Extracting and indexing text chunks...
              </span>
              <span className="text-primary font-mono font-semibold">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden relative">
              <div
                className="bg-primary h-full rounded-full transition-all duration-300 shimmer-sweep"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-space-sm pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="px-space-md py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface font-body-sm text-body-sm font-medium transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleUploadSubmit}
            disabled={!file || isUploading}
            className={`inline-flex items-center gap-2 px-space-lg py-2.5 rounded-xl font-body-sm text-body-sm font-semibold transition-all shadow-md active:scale-95 cursor-pointer ${
              file && !isUploading
                ? 'bg-primary hover:bg-primary-fixed text-on-primary hover:shadow-lg'
                : 'bg-surface-container-high text-outline cursor-not-allowed'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
            {isUploading ? 'Ingesting...' : 'Start Ingestion'}
          </button>
        </div>
      </div>
    </div>
  );
}
