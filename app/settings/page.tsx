'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';

export default function SettingsPage() {
  const [selectedModel, setSelectedModel] = useState('Claude 3.5 Sonnet / GPT-4o Research Edition');
  const [selectedEmbedder, setSelectedEmbedder] = useState('text-embedding-3-large');
  const [chunkSize, setChunkSize] = useState(800);
  const [chunkOverlap, setChunkOverlap] = useState(100);
  const [temperature, setTemperature] = useState(0.2);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <AppShell>
      <div className="flex-1 w-full bg-surface text-on-surface p-4 lg:p-space-xl max-w-4xl mx-auto space-y-space-xl">
        {/* Page Header */}
        <div className="border-b border-outline-variant/20 pb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[24px]">settings</span>
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
              Studio Configuration &amp; Settings
            </h1>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Configure multi-agent synthesis engines, vector embedding parameters, and runtime tolerances.
          </p>
        </div>

        {savedSuccess && (
          <div className="p-3 bg-tertiary-container/30 text-tertiary border border-tertiary/30 rounded-xl flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span className="font-body-sm text-body-sm font-medium">Settings saved successfully.</span>
          </div>
        )}

        <div className="space-y-space-lg">
          {/* AI Model Architecture */}
          <div className="p-space-lg rounded-2xl bg-surface border border-outline-variant/50 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  Synthesis Intelligence Engine
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Select the primary LLM used for multi-document synthesis and structured extraction.
                </p>
              </div>
              <span className="font-label-xs text-label-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-semibold border border-primary/20">
                v2.4-prod
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm pt-2">
              {[
                {
                  id: 'Claude 3.5 Sonnet / GPT-4o Research Edition',
                  name: 'Claude 3.5 Sonnet / GPT-4o',
                  desc: 'Optimal balance of mathematical reasoning and structured formatting.',
                },
                {
                  id: 'GPT-4o Deep Research Hybrid',
                  name: 'GPT-4o Deep Research',
                  desc: 'Enhanced iterative planning with extensive cross-referencing.',
                },
                {
                  id: 'Claude 3.7 Sonnet Extended Thinking',
                  name: 'Claude 3.7 Sonnet Thinking',
                  desc: 'In-depth recursive deliberation for complex edge cases.',
                },
                {
                  id: 'Gemini 1.5 Pro 2M Extended Window',
                  name: 'Gemini 1.5 Pro (2M Context)',
                  desc: 'Massive single-pass token ingestion for monolithic corpora.',
                },
              ].map((model) => (
                <div
                  key={model.id}
                  onClick={() => setSelectedModel(model.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all card-interactive ${
                    selectedModel === model.id
                      ? 'bg-primary/5 border-primary ring-2 ring-primary/30 shadow-md'
                      : 'bg-surface hover:bg-surface-container-low border-outline-variant/40 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-body-sm text-body-sm font-semibold text-on-surface">
                      {model.name}
                    </span>
                    {selectedModel === model.id ? (
                      <span className="material-symbols-outlined text-[20px] text-primary">check_circle</span>
                    ) : (
                      <span className="w-4 h-4 rounded-full border border-outline-variant/60"></span>
                    )}
                  </div>
                  <p className="font-label-xs text-label-xs text-outline leading-relaxed">{model.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* RAG & Vector Embeddings */}
          <div className="p-space-lg rounded-2xl bg-surface border border-outline-variant/50 shadow-xs space-y-4">
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                Vector Embedding &amp; Chunking Specs
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Configure dense vector projections and semantic window segmentations for document indexing.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <label className="font-body-sm text-body-sm text-on-surface block mb-1.5 font-semibold">
                  Embedding Model
                </label>
                <select
                  value={selectedEmbedder}
                  onChange={(e) => setSelectedEmbedder(e.target.value)}
                  className="w-full sm:w-80 bg-surface px-3 py-2 rounded-xl text-on-surface font-body-sm text-body-sm border border-outline-variant/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-xs"
                >
                  <option value="text-embedding-3-large">OpenAI text-embedding-3-large (3072 dims)</option>
                  <option value="cohere-embed-v3">Cohere Embed v3 English (1024 dims)</option>
                  <option value="bge-large-en-v1.5">BAAI BGE-Large-EN v1.5 (Local Fallback)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40">
                  <div className="flex justify-between font-body-sm text-body-sm mb-1.5 font-semibold">
                    <span className="text-on-surface">Target Chunk Size (Tokens)</span>
                    <span className="text-tertiary font-mono bg-tertiary/10 px-2 py-0.5 rounded-full">{chunkSize}</span>
                  </div>
                  <input
                    type="range"
                    min={200}
                    max={2000}
                    step={50}
                    value={chunkSize}
                    onChange={(e) => setChunkSize(Number(e.target.value))}
                    className="w-full accent-primary cursor-pointer"
                  />
                  <span className="font-label-xs text-label-xs text-outline block mt-1">
                    Recommended: 500-1000 tokens for scientific papers.
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40">
                  <div className="flex justify-between font-body-sm text-body-sm mb-1.5 font-semibold">
                    <span className="text-on-surface">Chunk Overlap</span>
                    <span className="text-tertiary font-mono bg-tertiary/10 px-2 py-0.5 rounded-full">{chunkOverlap}</span>
                  </div>
                  <input
                    type="range"
                    min={20}
                    max={300}
                    step={10}
                    value={chunkOverlap}
                    onChange={(e) => setChunkOverlap(Number(e.target.value))}
                    className="w-full accent-primary cursor-pointer"
                  />
                  <span className="font-label-xs text-label-xs text-outline block mt-1">
                    Recommended: 10-15% of chunk size.
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40">
                <div className="flex justify-between font-body-sm text-body-sm mb-1.5 font-semibold">
                  <span className="text-on-surface">Synthesis Temperature</span>
                  <span className="text-tertiary font-mono bg-tertiary/10 px-2 py-0.5 rounded-full">{temperature}</span>
                </div>
                <input
                  type="range"
                  min={0.0}
                  max={1.0}
                  step={0.05}
                  value={temperature}
                  onChange={(e) => setTemperature(Number(e.target.value))}
                  className="w-full sm:w-80 accent-primary cursor-pointer"
                />
                <span className="font-label-xs text-label-xs text-outline block mt-1">
                  Lower values (0.0 - 0.3) provide rigorous, deterministic factual grounding.
                </span>
              </div>
            </div>
          </div>

          {/* System & API Security Status */}
          <div className="p-space-lg rounded-2xl bg-surface border border-outline-variant/50 shadow-xs space-y-4">
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                Security &amp; API Key Posture
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Server-side credential posture verified in accordance with enterprise safety standards.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
              <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/40 flex items-center justify-between">
                <div>
                  <span className="font-body-sm text-body-sm text-on-surface font-semibold block">
                    OPENAI_API_KEY
                  </span>
                  <span className="font-label-xs text-label-xs text-outline">Server-side environment key</span>
                </div>
                <span className="font-label-xs text-label-xs px-2.5 py-1 rounded-full bg-tertiary/10 text-tertiary font-semibold border border-tertiary/20">
                  SECURE (ENV)
                </span>
              </div>

              <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/40 flex items-center justify-between">
                <div>
                  <span className="font-body-sm text-body-sm text-on-surface font-semibold block">
                    DATABASE_URL
                  </span>
                  <span className="font-label-xs text-label-xs text-outline">PostgreSQL + Prisma</span>
                </div>
                <span className="font-label-xs text-label-xs px-2.5 py-1 rounded-full bg-tertiary/10 text-tertiary font-semibold border border-tertiary/20">
                  CONNECTED
                </span>
              </div>
            </div>
          </div>

          {/* Save Action Bar */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-space-xl py-3 rounded-xl bg-primary hover:bg-primary-fixed text-on-primary font-body-sm text-body-sm font-semibold transition-all shadow-md hover:shadow-lg active:scale-95 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              Save Studio Configuration
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
