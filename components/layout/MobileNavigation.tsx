'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function MobileNavigation({ isOpen, onClose, children }: MobileNavigationProps) {
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
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <div className="relative z-10 flex h-full w-[85%] max-w-xs flex-col bg-surface shadow-2xl transition-transform border-r border-border">
        <button
          onClick={onClose}
          className="absolute right-3 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface text-foreground hover:bg-muted transition-colors cursor-pointer"
          title="Close Navigation"
          type="button"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="h-full overflow-hidden">{children}</div>
      </div>
    </div>
  );
}

// Re-export as MobileDrawer for backwards compatibility
export { MobileNavigation as MobileDrawer };
