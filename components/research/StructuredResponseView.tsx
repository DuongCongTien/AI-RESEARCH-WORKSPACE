'use client';

import React, { useState } from 'react';
import { ResearchResponse } from '@/types/research';
import { SummaryCard } from './SummaryCard';
import { KeyPointsCard } from './KeyPointsCard';
import { RisksCard } from './RisksCard';
import { ActionsCard } from './ActionsCard';
import { SourcesCard } from './SourcesCard';

interface StructuredResponseViewProps {
  response: ResearchResponse;
}

export function StructuredResponseView({ response }: StructuredResponseViewProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'insights' | 'risks' | 'sources'>('all');
  const [downloaded, setDownloaded] = useState(false);

  const keyPointsList = response.keyPoints || response.key_points || [];

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(response, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `research-report-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  return (
    <div className="space-y-4 my-2">
      {/* Action and Filter Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant/30 pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto rounded-lg bg-surface-container p-1 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium transition-all ${
              activeTab === 'all'
                ? 'bg-surface-container-high text-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">grid_view</span>
            <span>Full Report</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('insights')}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium transition-all ${
              activeTab === 'insights'
                ? 'bg-surface-container-high text-tertiary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px] text-tertiary">check_circle</span>
            <span>Insights ({keyPointsList.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('risks')}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium transition-all ${
              activeTab === 'risks'
                ? 'bg-surface-container-high text-error shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px] text-error">warning</span>
            <span>Risks & Actions</span>
          </button>
          {response.sources && response.sources.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab('sources')}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium transition-all ${
                activeTab === 'sources'
                  ? 'bg-surface-container-high text-secondary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[16px] text-secondary">menu_book</span>
              <span>Citations ({response.sources.length})</span>
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={handleExportJSON}
          className="flex items-center gap-1.5 rounded-lg border border-outline-variant/30 bg-surface-container px-2.5 py-1 text-xs font-medium text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
          title="Export structured report as JSON"
        >
          <span className="material-symbols-outlined text-[15px] text-primary">
            {downloaded ? 'done' : 'file_download'}
          </span>
          <span>{downloaded ? 'Exported' : 'Export JSON'}</span>
        </button>
      </div>

      {/* Structured Content Views */}
      <div className="space-y-4">
        {(activeTab === 'all' || activeTab === 'insights') && (
          <>
            <SummaryCard summary={response.summary} />
            <KeyPointsCard keyPoints={keyPointsList} />
          </>
        )}

        {(activeTab === 'all' || activeTab === 'risks') && (
          <div className="grid gap-4 md:grid-cols-2">
            <RisksCard risks={response.risks} />
            <ActionsCard actions={response.actions} />
          </div>
        )}

        {(activeTab === 'all' || activeTab === 'sources') && response.sources && response.sources.length > 0 && (
          <SourcesCard sources={response.sources} />
        )}
      </div>
    </div>
  );
}
