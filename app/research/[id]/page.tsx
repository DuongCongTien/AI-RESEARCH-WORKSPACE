'use client';

import React, { use, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ResearchWorkspace } from '@/components/research/ResearchWorkspace';

interface ResearchSessionPageProps {
  params: Promise<{ id: string }>;
}

function SessionContent({ params }: ResearchSessionPageProps) {
  const resolvedParams = use(params);
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q');

  return (
    <ResearchWorkspace
      initialConversationId={resolvedParams.id}
      initialQuery={initialQuery}
    />
  );
}

export default function ResearchSessionPage({ params }: ResearchSessionPageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center bg-surface">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <span className="text-xs font-medium">Đang tải phiên nghiên cứu...</span>
          </div>
        </div>
      }
    >
      <SessionContent params={params} />
    </Suspense>
  );
}
