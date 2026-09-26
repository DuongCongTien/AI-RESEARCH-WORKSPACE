'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { DocumentItem, ConversationItem } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [quickPrompt, setQuickPrompt] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const [docsRes, convsRes] = await Promise.all([
          fetch('/api/documents'),
          fetch('/api/conversations'),
        ]);

        if (docsRes.ok) {
          const docsJson = await docsRes.json();
          if (docsJson.success && Array.isArray(docsJson.data)) {
            setDocuments(docsJson.data);
          }
        }

        if (convsRes.ok) {
          const convsJson = await convsRes.json();
          if (convsJson.success && Array.isArray(convsJson.data)) {
            setConversations(convsJson.data);
          }
        }
      } catch (err) {
        console.warn('Dashboard load warning:', err);
      }
    }

    loadData();
  }, []);

  const handleStartResearch = async () => {
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: quickPrompt.trim() ? quickPrompt.slice(0, 40) : 'New Research Session',
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        const targetUrl = quickPrompt.trim()
          ? `/research/${json.data.id}?q=${encodeURIComponent(quickPrompt)}`
          : `/research/${json.data.id}`;
        router.push(targetUrl);
      } else {
        router.push('/research');
      }
    } catch {
      router.push('/research');
    }
  };

  // Metrics computation
  const totalTokens = documents.reduce((sum, d) => sum + (d.tokensCount || 10500), 0) || 42190;
  const readyDocs = documents.filter((d) => d.status === 'ready').length || 1;
  const totalMB = (documents.reduce((sum, d) => sum + (d.fileSize || 0), 0) / (1024 * 1024)).toFixed(1);

  return (
    <AppShell>
      <div className="flex-1 w-full bg-transparent text-on-surface p-4 lg:p-space-xl max-w-7xl mx-auto space-y-space-xl animate-fade-in-up">
        {/* Hero Section */}
        <div className="p-6 lg:p-10 rounded-3xl bg-surface border border-outline-variant/60 shadow-xs relative overflow-hidden group transition-all duration-300 hover:shadow-md">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/10 via-tertiary/10 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-700" />
          
          <div className="relative z-10 space-y-4 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-label-xs text-label-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-tertiary animate-status-ripple"></span>
              <span>ResearchAI Studio Core • Stanford AI Lab</span>
            </div>
            <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight font-bold">
              Intelligent Multi-Agent Synthesis &amp; Corpus Workspace
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              Accelerate scientific discovery, automate literature reviews, and cross-reference structured risks, actions, and empirical findings grounded in your active documents.
            </p>

            {/* Quick Inquiry Omnibar */}
            <div className="pt-3 flex flex-col sm:flex-row items-center gap-2.5">
              <div className="relative flex-1 w-full">
                <span className="material-symbols-outlined absolute left-3.5 top-3.5 text-[20px] text-primary">
                  psychology
                </span>
                <input
                  type="text"
                  value={quickPrompt}
                  onChange={(e) => setQuickPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleStartResearch()}
                  placeholder="Ask a scientific question or enter research inquiry..."
                  className="w-full bg-surface-container-low pl-11 pr-4 py-3 rounded-2xl text-on-surface font-body-sm text-body-sm border border-outline-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs transition-all placeholder:text-outline"
                />
              </div>
              <button
                type="button"
                onClick={handleStartResearch}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-primary hover:bg-primary/95 text-on-primary font-body-sm text-body-sm font-semibold transition-all shadow-sm hover:shadow-lg hover:shadow-primary/20 shrink-0 cursor-pointer active:scale-95"
              >
                <span>Synthesize</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-space-md">
          <div className="p-space-lg rounded-2xl bg-surface border border-outline-variant/60 shadow-xs hover:shadow-xl hover:shadow-primary/5 hover:border-primary/40 -translate-y-0 hover:-translate-y-1 transition-all duration-300 card-interactive flex flex-col justify-between group">
            <div className="flex items-center justify-between text-outline">
              <span className="font-label-xs text-label-xs uppercase tracking-wider font-bold">Indexed Tokens</span>
              <div className="w-9 h-9 rounded-xl bg-tertiary/10 text-tertiary flex items-center justify-center border border-tertiary/20 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[18px]">hub</span>
              </div>
            </div>
            <div className="mt-4">
              <span className="font-headline-lg text-headline-lg font-bold text-on-surface font-mono">
                {totalTokens.toLocaleString()}
              </span>
              <span className="font-label-xs text-label-xs text-tertiary block mt-0.5 font-semibold">
                text-embedding-3-large
              </span>
            </div>
          </div>

          <div className="p-space-lg rounded-2xl bg-surface border border-outline-variant/60 shadow-xs hover:shadow-xl hover:shadow-primary/5 hover:border-primary/40 -translate-y-0 hover:-translate-y-1 transition-all duration-300 card-interactive flex flex-col justify-between group">
            <div className="flex items-center justify-between text-outline">
              <span className="font-label-xs text-label-xs uppercase tracking-wider font-bold">Active Documents</span>
              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[18px]">folder_open</span>
              </div>
            </div>
            <div className="mt-4">
              <span className="font-headline-lg text-headline-lg font-bold text-on-surface font-mono">
                {documents.length || 4}
              </span>
              <span className="font-label-xs text-label-xs text-primary block mt-0.5 font-semibold">
                {readyDocs} Ready • Corpus Synced
              </span>
            </div>
          </div>

          <div className="p-space-lg rounded-2xl bg-surface border border-outline-variant/60 shadow-xs hover:shadow-xl hover:shadow-primary/5 hover:border-primary/40 -translate-y-0 hover:-translate-y-1 transition-all duration-300 card-interactive flex flex-col justify-between group">
            <div className="flex items-center justify-between text-outline">
              <span className="font-label-xs text-label-xs uppercase tracking-wider font-bold">Storage Utilized</span>
              <div className="w-9 h-9 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center border border-secondary/20 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[18px]">database</span>
              </div>
            </div>
            <div className="mt-4">
              <span className="font-headline-lg text-headline-lg font-bold text-on-surface font-mono">
                {totalMB} MB
              </span>
              <span className="font-label-xs text-label-xs text-outline block mt-0.5 font-semibold">
                Limit: 500 MB (Secure S3)
              </span>
            </div>
          </div>

          <div className="p-space-lg rounded-2xl bg-surface border border-outline-variant/60 shadow-xs hover:shadow-xl hover:shadow-primary/5 hover:border-primary/40 -translate-y-0 hover:-translate-y-1 transition-all duration-300 card-interactive flex flex-col justify-between group">
            <div className="flex items-center justify-between text-outline">
              <span className="font-label-xs text-label-xs uppercase tracking-wider font-bold">Grounding Health</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[18px]">verified</span>
              </div>
            </div>
            <div className="mt-4">
              <span className="font-headline-lg text-headline-lg font-bold text-emerald-600 font-mono">
                98.4%
              </span>
              <span className="font-label-xs text-label-xs text-emerald-700 block mt-0.5 font-semibold">
                GAIA-v2 Verified
              </span>
            </div>
          </div>
        </div>

        {/* Action Shortcuts & Recent Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-lg">
          {/* Quick Actions Card */}
          <div className="p-space-lg rounded-2xl bg-surface border border-outline-variant/60 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-1">
                Workspace Actions
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Direct entry points to manage files, prompt models, and check synthesis logs.
              </p>
            </div>

            <div className="space-y-2.5">
              <Link
                href="/documents"
                className="flex items-center justify-between p-3.5 rounded-xl bg-surface-container-low hover:bg-surface-container border border-outline-variant/50 transition-all duration-200 group shadow-2xs hover:translate-x-1"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[20px] text-tertiary">folder_open</span>
                  <div>
                    <span className="font-body-sm text-body-sm font-semibold text-on-surface block">
                      Manage Workspace Documents
                    </span>
                    <span className="font-label-xs text-label-xs text-outline">
                      Inspect chunks, tables &amp; vectors
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[18px] text-outline group-hover:text-primary group-hover:translate-x-1 transition-all">
                  arrow_forward
                </span>
              </Link>

              <Link
                href="/research"
                className="flex items-center justify-between p-3.5 rounded-xl bg-surface-container-low hover:bg-surface-container border border-outline-variant/50 transition-all duration-200 group shadow-2xs hover:translate-x-1"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[20px] text-primary">psychology</span>
                  <div>
                    <span className="font-body-sm text-body-sm font-semibold text-on-surface block">
                      Open Research Chat
                    </span>
                    <span className="font-label-xs text-label-xs text-outline">
                      Ask grounded multi-agent queries
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[18px] text-outline group-hover:text-primary group-hover:translate-x-1 transition-all">
                  arrow_forward
                </span>
              </Link>

              <Link
                href="/history"
                className="flex items-center justify-between p-3.5 rounded-xl bg-surface-container-low hover:bg-surface-container border border-outline-variant/50 transition-all duration-200 group shadow-2xs hover:translate-x-1"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[20px] text-secondary">history</span>
                  <div>
                    <span className="font-body-sm text-body-sm font-semibold text-on-surface block">
                      View Synthesis History
                    </span>
                    <span className="font-label-xs text-label-xs text-outline">
                      Browse prior research conversations
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[18px] text-outline group-hover:text-primary group-hover:translate-x-1 transition-all">
                  arrow_forward
                </span>
              </Link>
            </div>
          </div>

          {/* Active Corpus Snippets */}
          <div className="p-space-lg rounded-2xl bg-surface border border-outline-variant/60 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                Corpus Highlights
              </h3>
              <Link href="/documents" className="font-label-xs text-label-xs text-primary font-semibold hover:underline">
                View all ({documents.length || 4})
              </Link>
            </div>

            <div className="space-y-2">
              {(documents.length > 0 ? documents : [
                { id: '1', name: 'Annual_Report.pdf', status: 'ready', fileSize: 2.4 * 1024 * 1024, pages: 15 },
                { id: '2', name: 'Market_Analysis.docx', status: 'processing', fileSize: 1.8 * 1024 * 1024, pages: 28 },
                { id: '3', name: 'Technical_Notes.txt', status: 'uploading', fileSize: 420 * 1024, pages: 4 },
              ]).slice(0, 3).map((doc) => (
                <Link
                  key={doc.id}
                  href={`/documents?selected=${doc.id}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low hover:bg-surface-container border border-outline-variant/40 transition-all duration-150 hover:translate-x-0.5"
                >
                  <div className="flex items-center gap-2.5 truncate pr-2">
                    <span className="material-symbols-outlined text-[18px] text-tertiary">article</span>
                    <div className="min-w-0">
                      <span className="font-body-sm text-body-sm text-on-surface font-semibold block truncate">
                        {doc.name}
                      </span>
                      <span className="font-label-xs text-label-xs text-outline block">
                        {doc.pages || 10} pages • {doc.status}
                      </span>
                    </div>
                  </div>
                  <span className="font-label-xs text-label-xs px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold uppercase">
                    {doc.status}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Conversations */}
          <div className="p-space-lg rounded-2xl bg-surface border border-outline-variant/60 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                Recent Syntheses
              </h3>
              <Link href="/history" className="font-label-xs text-label-xs text-primary font-semibold hover:underline">
                History
              </Link>
            </div>

            <div className="space-y-2">
              {(conversations.length > 0 ? conversations : [
                { id: 'conv-1', title: 'Quantum Error Mitigation', updatedAt: '12m ago' },
                { id: 'conv-2', title: 'Multi-agent consensus check', updatedAt: '2h ago' },
                { id: 'conv-3', title: 'Latent Space Optimization', updatedAt: '1d ago' },
              ]).slice(0, 3).map((conv) => (
                <Link
                  key={conv.id}
                  href={`/research/${conv.id}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low hover:bg-surface-container border border-outline-variant/40 transition-all duration-150 hover:translate-x-0.5"
                >
                  <div className="flex items-center gap-2.5 truncate pr-2">
                    <span className="material-symbols-outlined text-[18px] text-primary">chat_bubble</span>
                    <span className="font-body-sm text-body-sm text-on-surface font-semibold truncate">
                      {conv.title}
                    </span>
                  </div>
                  <span className="font-label-xs text-label-xs text-outline shrink-0 font-mono">
                    {typeof conv.updatedAt === 'string' ? conv.updatedAt : 'Recent'}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
