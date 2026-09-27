'use client';

import React from 'react';
import { ResearchResponse as ResearchResponseType } from '@/types/research';
import { SummaryCard } from './SummaryCard';
import { KeyPointsCard } from './KeyPointsCard';
import { RisksCard } from './RisksCard';
import { ActionsCard } from './ActionsCard';
import { SourcesCard } from './SourcesCard';

interface ResearchResponseProps {
  response: ResearchResponseType;
  className?: string;
}

export function ResearchResponse({ response, className = '' }: ResearchResponseProps) {
  if (!response) return null;

  const keyPointsList = response.key_points || response.keyPoints || [];

  return (
    <div className={`space-y-4 my-3 w-full ${className}`}>
      {/* 1. Summary Card */}
      <SummaryCard summary={response.summary} />

      {/* 2. Key Points Card */}
      <KeyPointsCard keyPoints={keyPointsList} />

      {/* 3. Risks & 4. Actions Cards (Responsive: 2 cols on desktop/tablet, stacked on mobile) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <RisksCard risks={response.risks} />
        <ActionsCard actions={response.actions} />
      </div>

      {/* 5. Sources Card */}
      <SourcesCard sources={response.sources} />
    </div>
  );
}

export default ResearchResponse;
