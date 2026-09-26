'use client';

import React, { useRef, useState } from 'react';
import { UploadCloud, Loader2, Plus } from 'lucide-react';
import { DocumentItem } from '@/types';

interface DocumentUploadProps {
  onUploaded?: (doc: DocumentItem) => void;
  compact?: boolean;
}

export function DocumentUpload({ onUploaded, compact = false }: DocumentUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadFile = async (file: File) => {
    setErrorMessage(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to upload document');
      }

      if (onUploaded && json.data) {
        onUploaded(json.data);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUploadFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleUploadFile(file);
    }
  };

  if (compact) {
    return (
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.doc,.txt,.md"
          className="hidden"
          onChange={handleFileChange}
          disabled={isUploading}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border py-2 px-3 text-xs font-medium text-muted-foreground hover:border-primary/50 hover:bg-accent hover:text-foreground transition-all disabled:opacity-60"
        >
          {isUploading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
          ) : (
            <Plus className="h-3.5 w-3.5" />
          )}
          <span>{isUploading ? 'Parsing text...' : 'Attach Document'}</span>
        </button>
        {errorMessage && (
          <p className="mt-1.5 text-[11px] text-destructive">{errorMessage}</p>
        )}
      </div>
    );
  }

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.doc,.txt,.md"
        className="hidden"
        onChange={handleFileChange}
        disabled={isUploading}
      />
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 text-center transition-all ${
          isDragging
            ? 'border-primary bg-primary/10'
            : 'border-border/80 bg-muted/20 hover:border-primary/50 hover:bg-muted/40'
        } ${isUploading ? 'pointer-events-none opacity-70' : ''}`}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary mb-2">
          {isUploading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <UploadCloud className="h-5 w-5" />
          )}
        </div>
        <p className="text-xs font-medium text-foreground">
          {isUploading ? 'Extracting text and structure...' : 'Upload Research Papers & Docs'}
        </p>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Supports PDF, DOCX, TXT, MD
        </p>
      </div>
      {errorMessage && (
        <p className="mt-2 text-center text-xs text-destructive">{errorMessage}</p>
      )}
    </div>
  );
}
