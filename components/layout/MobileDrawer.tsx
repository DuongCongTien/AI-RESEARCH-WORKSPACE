'use client';

import React, { useEffect } from 'react';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function MobileDrawer({ isOpen, onClose, children }: MobileDrawerProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex lg:hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer content */}
      <div className="relative z-10 flex h-full w-[85%] max-w-xs flex-col bg-surface-container-low shadow-2xl transition-transform border-r border-outline-variant/30">
        <button
          onClick={onClose}
          className="absolute right-3 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-lg border border-outline-variant/30 bg-surface-container-high text-on-surface hover:bg-surface-bright transition-colors"
          title="Close Navigation"
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
        <div className="h-full overflow-hidden">{children}</div>
      </div>
    </div>
  );
}
