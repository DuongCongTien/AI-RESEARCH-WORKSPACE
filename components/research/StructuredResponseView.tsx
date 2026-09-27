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
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(response, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `bao-cao-nghien-cuu-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  return (
    <div className="space-y-4 my-2">
      {/* Thanh công cụ và bộ lọc tab */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto rounded-lg bg-muted/50 p-1 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-surface text-primary shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">grid_view</span>
            <span>Báo cáo đầy đủ</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('insights')}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium transition-all cursor-pointer ${
              activeTab === 'insights'
                ? 'bg-surface text-tertiary shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className="material-symbols-outlined text-[16px] text-tertiary">check_circle</span>
            <span>Điểm chính ({keyPointsList.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('risks')}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium transition-all cursor-pointer ${
              activeTab === 'risks'
                ? 'bg-surface text-rose-600 shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className="material-symbols-outlined text-[16px] text-rose-600">warning</span>
            <span>Rủi ro &amp; Hành động</span>
          </button>
          {response.sources && response.sources.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab('sources')}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium transition-all cursor-pointer ${
                activeTab === 'sources'
                  ? 'bg-surface text-secondary shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span className="material-symbols-outlined text-[16px] text-secondary">menu_book</span>
              <span>Trích dẫn ({response.sources.length})</span>
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={handleExportJSON}
          className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer shadow-2xs"
          title="Xuất báo cáo dưới dạng tệp tin JSON"
        >
          <span className="material-symbols-outlined text-[15px] text-primary">
            {downloaded ? 'done' : 'file_download'}
          </span>
          <span>{downloaded ? 'Đã xuất' : 'Xuất JSON'}</span>
        </button>
      </div>

      {/* Hiển thị các khối nội dung */}
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
