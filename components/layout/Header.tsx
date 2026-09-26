'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface HeaderProps {
  onToggleMobileMenu?: () => void;
}

export function Header({ onToggleMobileMenu }: HeaderProps) {
  const [activeModel, setActiveModel] = useState('Claude 3.5 Sonnet / GPT-4o Research Edition');
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [showTelemetryModal, setShowTelemetryModal] = useState(false);

  const models = [
    'Claude 3.5 Sonnet / GPT-4o Research Edition',
    'OpenAI GPT-4o Omni Deep Research',
    'Anthropic Claude 3.7 Sonnet Thinking',
    'Gemini 1.5 Pro 2M Extended Window',
  ];

  const [isDarkMode, setIsDarkMode] = useState(false);

  React.useEffect(() => {
    // Default is light (white background) unless explicitly saved as dark
    const saved = localStorage.getItem('researchai_theme');
    if (saved === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const handleToggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('researchai_theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('researchai_theme', 'dark');
      setIsDarkMode(true);
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 lg:left-72 right-0 h-16 bg-surface/80 backdrop-blur-2xl border-b border-outline-variant/60 z-40 px-4 lg:px-space-lg flex items-center justify-between transition-all shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]">
        {/* Left Section: Mobile Menu Button + Workspace Selector + Model Pill */}
        <div className="flex items-center gap-space-sm lg:gap-space-md min-w-0">
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors active:scale-95"
            aria-label="Open Navigation Drawer"
          >
            <span className="material-symbols-outlined text-[22px]">menu</span>
          </button>

          {/* Lab Selector */}
          <div className="hidden sm:flex items-center gap-space-xs text-on-surface-variant hover:text-on-surface cursor-pointer bg-surface-container-low hover:bg-surface-container-high px-space-sm py-1.5 rounded-lg border border-outline-variant/60 shadow-xs transition-all duration-200">
            <span className="material-symbols-outlined text-[16px] text-tertiary animate-subtle-pulse">science</span>
            <span className="font-body-sm text-body-sm font-semibold text-on-surface">Stanford AI Lab</span>
            <span className="material-symbols-outlined text-[16px]">unfold_more</span>
          </div>

          <div className="hidden sm:block h-4 w-[1px] bg-outline-variant/40"></div>

          {/* Model Selector Pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowModelMenu(!showModelMenu)}
              className="flex items-center gap-space-xs px-3 py-1.5 rounded-full bg-surface-container-low hover:bg-surface-container border border-outline-variant/70 shadow-xs hover:shadow-sm hover:border-primary/40 transition-all duration-200 text-left active:scale-[0.98]"
              title="Select Active Intelligence Engine"
            >
              <span className="w-2 h-2 rounded-full bg-tertiary animate-status-ripple shrink-0"></span>
              <span className="font-label-sm text-label-sm text-on-surface font-medium truncate max-w-[170px] sm:max-w-[280px]">
                {activeModel}
              </span>
              <span className={`material-symbols-outlined text-[14px] text-on-surface-variant transition-transform duration-200 ${showModelMenu ? 'rotate-180' : ''}`}>
                expand_more
              </span>
            </button>

            {showModelMenu && (
              <div className="absolute left-0 mt-2 w-72 rounded-xl bg-surface border border-outline-variant/80 shadow-xl py-1.5 z-50 animate-fade-in-up">
                <div className="px-3 py-1 font-label-xs text-label-xs uppercase tracking-wider text-outline font-semibold">
                  Synthesizing Engines
                </div>
                {models.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setActiveModel(m);
                      setShowModelMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-primary-container/40 transition-colors ${
                      m === activeModel ? 'text-primary font-semibold bg-primary-container/30' : 'text-on-surface-variant'
                    }`}
                  >
                    <span>{m}</span>
                    {m === activeModel && (
                      <span className="material-symbols-outlined text-[16px] text-primary">check</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Section: Theme Toggle, Telemetry, and User Avatar */}
        <div className="flex items-center gap-2 lg:gap-space-md shrink-0">
          <button
            className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg border border-outline-variant/40 hover:border-primary/30 shadow-2xs transition-all duration-200 active:scale-90"
            title={isDarkMode ? 'Switch to Light Theme (White Background)' : 'Switch to Dark Theme'}
            type="button"
            onClick={handleToggleTheme}
          >
            <span className="material-symbols-outlined text-[18px] text-primary transition-transform duration-300">
              {isDarkMode ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          <button
            className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg border border-outline-variant/40 hover:border-tertiary/30 shadow-2xs transition-all duration-200 active:scale-90"
            title="Execution Telemetry"
            type="button"
            onClick={() => setShowTelemetryModal(!showTelemetryModal)}
          >
            <span className="material-symbols-outlined text-[18px] text-tertiary">terminal</span>
          </button>

          <div className="h-4 w-[1px] bg-outline-variant/40"></div>

          {/* User Profile */}
          <Link
            href="/settings"
            className="flex items-center gap-space-sm pl-space-xs hover:opacity-90 transition-all group"
            title="Account Profile"
          >
            <div className="w-8 h-8 rounded-full border border-outline-variant/60 overflow-hidden bg-primary-container text-primary font-bold text-xs flex items-center justify-center shadow-xs group-hover:ring-2 group-hover:ring-primary/30 transition-all">
              EV
            </div>
            <div className="hidden xl:flex flex-col text-left">
              <span className="font-body-sm text-body-sm leading-none font-semibold text-on-surface">Dr. Elena Vance</span>
              <span className="font-label-xs text-label-xs text-on-surface-variant mt-0.5">Lead Investigator</span>
            </div>
          </Link>
        </div>
      </header>

      {/* Telemetry Modal */}
      {showTelemetryModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in-up">
          <div className="w-full max-w-xl bg-surface border border-outline-variant/70 rounded-2xl shadow-2xl p-space-lg flex flex-col gap-space-md">
            <div className="flex items-center justify-between border-b border-outline-variant/40 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary text-[20px] animate-pulse">terminal</span>
                <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">Studio Runtime Telemetry</span>
              </div>
              <button
                type="button"
                onClick={() => setShowTelemetryModal(false)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <div className="bg-surface-container-low border border-outline-variant/50 p-3.5 rounded-xl font-label-xs text-label-xs text-tertiary space-y-1.5 font-mono shadow-inner">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                <span>[SYSTEM] Memory allocated: 382.4 MB / 1024 MB</span>
              </div>
              <div>[RAG_PIPELINE] Vector database index health: 98.4%</div>
              <div>[EMBEDDING] text-embedding-3-large active</div>
              <div>[STREAMING] Server-Sent Events SSE latency: 12ms</div>
              <div>[ACTIVE_SESSIONS] 1 investigator session active</div>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowTelemetryModal(false)}
                className="px-4 py-2 rounded-xl bg-primary text-on-primary font-body-sm text-body-sm font-medium hover:opacity-90 transition-all shadow-xs active:scale-95"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
