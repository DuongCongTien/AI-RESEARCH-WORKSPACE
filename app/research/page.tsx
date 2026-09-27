'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ResearchWorkspace } from '@/components/research/ResearchWorkspace';

function ResearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');

  return <ResearchWorkspace initialQuery={query} />;
}

export default function ResearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center bg-surface">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <span className="text-xs font-medium">Đang tải không gian nghiên cứu...</span>
          </div>
        </div>
      }
    >
      <ResearchContent />
    </Suspense>
  );
}
