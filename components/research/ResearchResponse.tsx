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
  const hasRisks = response.risks && response.risks.length > 0;
  const hasActions = response.actions && response.actions.length > 0;

  return (
    <div className={`space-y-4 my-2 w-full ${className}`}>
      {/* 1. Summary */}
      <SummaryCard summary={response.summary} />

      {/* 2. Key Points */}
      {keyPointsList.length > 0 && (
        <KeyPointsCard keyPoints={keyPointsList} />
      )}

      {/* 3. Risks & 4. Actions */}
      {(hasRisks || hasActions) && (
        hasRisks && hasActions ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <RisksCard risks={response.risks} />
            <ActionsCard actions={response.actions} />
          </div>
        ) : hasRisks ? (
          <RisksCard risks={response.risks} />
        ) : (
          <ActionsCard actions={response.actions} />
        )
      )}

      {/* 5. Sources */}
      {response.sources && response.sources.length > 0 && (
        <SourcesCard sources={response.sources} />
      )}
    </div>
  );
}

export default ResearchResponse;
