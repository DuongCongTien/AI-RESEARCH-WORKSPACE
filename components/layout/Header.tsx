'use client';

import React, { useState } from 'react';

interface HeaderProps {
  onToggleMobileMenu?: () => void;
}

export function Header({ onToggleMobileMenu }: HeaderProps) {
  const [showTelemetryModal, setShowTelemetryModal] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(false);

  React.useEffect(() => {
    const saved = localStorage.getItem('researchai_theme');
    const shouldBeDark = saved === 'dark';
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    const timer = setTimeout(() => setIsDarkMode(shouldBeDark), 0);
    return () => clearTimeout(timer);
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
        {/* Left Section: Mobile Menu Button */}
        <div className="flex items-center gap-space-sm min-w-0">
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors active:scale-95"
            aria-label="Mở danh mục điều hướng"
          >
            <span className="material-symbols-outlined text-[22px]">menu</span>
          </button>
        </div>

        {/* Right Section: Theme Toggle, Telemetry, and User Avatar */}
        <div className="flex items-center gap-2 lg:gap-space-md shrink-0">
          <button
            className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg border border-outline-variant/40 hover:border-primary/30 shadow-2xs transition-all duration-200 active:scale-90"
            title={isDarkMode ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
            type="button"
            onClick={handleToggleTheme}
          >
            <span className="material-symbols-outlined text-[18px] text-primary transition-transform duration-300">
              {isDarkMode ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          <button
            className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg border border-outline-variant/40 hover:border-tertiary/30 shadow-2xs transition-all duration-200 active:scale-90"
            title="Thông số vận hành hệ thống"
            type="button"
            onClick={() => setShowTelemetryModal(!showTelemetryModal)}
          >
            <span className="material-symbols-outlined text-[18px] text-tertiary">terminal</span>
          </button>

          <div className="h-4 w-[1px] bg-outline-variant/40"></div>

          {/* User Profile */}
          <div
            className="flex items-center gap-space-sm pl-space-xs"
            title="Hồ sơ tài khoản"
          >
            <div className="w-8 h-8 rounded-full border border-outline-variant/60 overflow-hidden bg-primary-container text-primary font-bold text-xs flex items-center justify-center shadow-xs">
              AI
            </div>
            <div className="hidden xl:flex flex-col text-left">
              <span className="font-body-sm text-body-sm leading-none font-semibold text-on-surface">Người dùng</span>
              <span className="font-label-xs text-label-xs text-on-surface-variant mt-0.5">Không gian nghiên cứu</span>
            </div>
          </div>
        </div>
      </header>

      {/* Telemetry Modal */}
      {showTelemetryModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in-up">
          <div className="w-full max-w-xl bg-surface border border-outline-variant/70 rounded-2xl shadow-2xl p-space-lg flex flex-col gap-space-md">
            <div className="flex items-center justify-between border-b border-outline-variant/40 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary text-[20px] animate-pulse">terminal</span>
                <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">Thông số vận hành hệ thống</span>
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
                <span>[HỆ THỐNG] Bộ nhớ đã cấp phát: 382.4 MB / 1024 MB</span>
              </div>
              <div>[RAG_PIPELINE] Trạng thái cơ sở dữ liệu véc-tơ: 98.4%</div>
              <div>[MÃ_HÓA_NHÚNG] Mô hình text-embedding-3-large đang hoạt động</div>
              <div>[TRUYỀN_PHÁT] Độ trễ luồng SSE: 12ms</div>
              <div>[PHIÊN_LÀM_VIỆC] 1 phiên nghiên cứu đang hoạt động</div>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowTelemetryModal(false)}
                className="px-4 py-2 rounded-xl bg-primary text-on-primary font-body-sm text-body-sm font-medium hover:opacity-90 transition-all shadow-xs active:scale-95"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
