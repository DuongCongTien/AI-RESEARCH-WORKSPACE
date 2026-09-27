'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { DocumentItem, ConversationItem } from '@/types';

interface SidebarProps {
  documents?: DocumentItem[];
  conversations?: ConversationItem[];
  onNewConversation?: () => void;
  onOpenUpload?: () => void;
  onCloseMobileDrawer?: () => void;
}

export function Sidebar({
  documents = [],
  conversations = [],
  onNewConversation,
  onOpenUpload,
  onCloseMobileDrawer,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Danh mục điều hướng chính
  const navLinks = [
    { label: 'Bảng điều khiển', href: '/dashboard', icon: 'dashboard' },
    { label: 'Tài liệu không gian', href: '/documents', icon: 'folder_open' },
    { label: 'Hội thoại nghiên cứu', href: '/research', icon: 'psychology' },
    { label: 'Lịch sử tổng hợp', href: '/history', icon: 'history' },
  ];

  const handleNewChat = () => {
    if (onNewConversation) {
      onNewConversation();
    } else {
      router.push('/research?new=true');
    }
    if (onCloseMobileDrawer) onCloseMobileDrawer();
  };

  function formatRelativeTime(dateInput: string | Date | undefined): string {
    if (!dateInput) return '';
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return String(dateInput);

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffMin < 1) return 'Vừa xong';
    if (diffMin < 60) return `${diffMin} phút trước`;
    if (diffHour < 24) return `${diffHour} giờ trước`;
    if (diffDay === 1) return 'Hôm qua';
    if (diffDay < 7) return `${diffDay} ngày trước`;
    return date.toLocaleDateString('vi-VN', { month: 'numeric', day: 'numeric' });
  }

  return (
    <aside className="h-full w-72 bg-surface border-r border-outline-variant/60 flex flex-col justify-between select-none shadow-[1px_0_3px_0_rgba(0,0,0,0.02)] transition-colors">
      <div className="flex flex-col h-full overflow-hidden">
        {/* Header Thương hiệu */}
        <div className="h-16 px-space-md border-b border-outline-variant/50 flex items-center justify-between shrink-0">
          <Link
            href="/dashboard"
            onClick={onCloseMobileDrawer}
            className="flex items-center gap-space-sm hover:opacity-90 transition-opacity group"
          >
            <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-105 group-hover:rotate-6 transition-all duration-200 shadow-xs">
              <span className="material-symbols-outlined text-[20px] text-primary">auto_awesome</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm text-on-surface leading-none tracking-tight font-bold">
                Nghiên cứu AI
              </span>
              <span className="font-label-xs text-label-xs text-primary uppercase tracking-widest mt-0.5 font-semibold">
                Không gian nghiên cứu
              </span>
            </div>
          </Link>
          <button
            className="text-on-surface-variant hover:text-on-surface hover:bg-surface-container p-1 rounded-lg transition-colors cursor-pointer"
            type="button"
            title="Thu gọn thanh bên"
            aria-label="Thu gọn thanh bên"
          >
            <span className="material-symbols-outlined text-[18px]">dock_to_right</span>
          </button>
        </div>

        {/* Nút hành động: Cuộc trò chuyện mới */}
        <div className="p-space-md shrink-0">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-between px-space-md py-2.5 bg-primary text-on-primary hover:bg-primary/95 rounded-xl transition-all shadow-xs hover:shadow-md hover:shadow-primary/20 active:scale-[0.98] group cursor-pointer"
            type="button"
            title="Bắt đầu cuộc trò chuyện nghiên cứu mới"
          >
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-on-primary text-[19px] group-hover:rotate-90 transition-transform duration-300">
                add
              </span>
              <span className="font-body-sm text-body-sm font-semibold">Cuộc trò chuyện mới</span>
            </div>
            <kbd className="font-label-xs text-label-xs text-on-primary/80 bg-white/20 px-1.5 py-0.5 rounded border border-white/20 font-mono">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Khu vực cuộn các liên kết */}
        <div className="flex-1 overflow-y-auto px-space-md space-y-space-lg">
          {/* Liên kết điều hướng chính */}
          <div className="space-y-1">
            <span className="font-label-xs text-label-xs uppercase tracking-wider text-outline px-space-xs block mb-1.5 font-bold">
              Không gian làm việc
            </span>
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onCloseMobileDrawer}
                  className={`flex items-center gap-space-sm px-space-sm py-2 rounded-xl text-body-sm transition-all duration-200 group ${
                    isActive
                      ? 'bg-primary/10 text-primary font-semibold border border-primary/20 shadow-xs'
                      : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface hover:translate-x-1'
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-[19px] transition-transform duration-200 group-hover:scale-110 ${
                      isActive ? 'text-primary' : 'text-outline'
                    }`}
                  >
                    {link.icon}
                  </span>
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Phần tài liệu */}
          <div className="space-y-space-xs">
            <div className="flex items-center justify-between px-space-xs text-on-surface-variant">
              <span className="font-label-xs text-label-xs uppercase tracking-wider text-outline font-bold">
                Tài liệu
              </span>
              <button
                onClick={() => {
                  if (onOpenUpload) onOpenUpload();
                  else router.push('/documents?upload=open');
                }}
                className="hover:text-primary transition-colors p-0.5 active:scale-90 cursor-pointer"
                type="button"
                title="Thêm tài liệu"
                aria-label="Thêm tài liệu"
              >
                <span className="material-symbols-outlined text-[16px] text-tertiary">add_circle</span>
              </button>
            </div>
            <nav className="space-y-1">
              {documents.length === 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenUpload) onOpenUpload();
                    else router.push('/documents?upload=open');
                  }}
                  className="w-full flex items-center gap-space-sm px-space-sm py-1.5 rounded-lg text-outline hover:text-primary hover:bg-surface-container-high transition-all duration-150 font-label-xs text-label-xs"
                >
                  <span className="material-symbols-outlined text-[16px]">upload_file</span>
                  <span>Tải tài liệu lên...</span>
                </button>
              ) : (
                documents.slice(0, 5).map((doc) => {
                  const isReady = doc.status === 'ready';
                  const isProcessing = doc.status === 'processing';
                  return (
                    <Link
                      key={doc.id}
                      href={`/documents?selected=${doc.id}`}
                      onClick={onCloseMobileDrawer}
                      className="flex items-center justify-between px-space-sm py-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface hover:translate-x-0.5 transition-all duration-150 group"
                    >
                      <div className="flex items-center gap-space-sm truncate pr-2">
                        <span
                          className={`material-symbols-outlined text-[16px] ${
                            doc.fileType === 'pdf'
                              ? 'text-tertiary'
                              : doc.fileType === 'docx'
                              ? 'text-primary'
                              : 'text-secondary'
                          }`}
                        >
                          {doc.fileType === 'pdf' ? 'article' : doc.fileType === 'json' ? 'dataset' : 'account_tree'}
                        </span>
                        <span className="font-body-sm text-body-sm truncate">{doc.name}</span>
                      </div>
                      <span
                        className={`font-label-xs text-label-xs px-1.5 py-0.5 rounded-md uppercase font-medium ${
                          isReady
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-tertiary-container/30 dark:text-tertiary'
                            : isProcessing
                            ? 'bg-amber-50 text-amber-600 border border-amber-200 animate-pulse'
                            : 'bg-rose-50 text-rose-600 border border-rose-200'
                        }`}
                      >
                        {isReady ? 'ĐÃ NẠP' : isProcessing ? 'ĐANG XỬ LÝ' : 'LỖI'}
                      </span>
                    </Link>
                  );
                })
              )}
            </nav>
          </div>

          {/* Phần hội thoại gần đây */}
          <div className="space-y-space-xs">
            <span className="font-label-xs text-label-xs uppercase tracking-wider text-outline px-space-xs block font-bold">
              Hội thoại gần đây
            </span>
            <nav className="space-y-1">
              {conversations.length === 0 ? (
                <p className="px-space-sm py-1.5 font-label-xs text-label-xs text-outline italic">
                  Chưa có phiên nào...
                </p>
              ) : (
                conversations.slice(0, 8).map((conv) => {
                  const isActive = pathname === `/research/${conv.id}`;
                  return (
                    <Link
                      key={conv.id}
                      href={`/research/${conv.id}`}
                      onClick={onCloseMobileDrawer}
                      className={`flex items-center justify-between px-space-sm py-1.5 rounded-lg text-body-sm transition-all duration-150 group ${
                        isActive
                          ? 'bg-primary/10 text-primary font-semibold border border-primary/20 shadow-xs'
                          : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface hover:translate-x-0.5'
                      }`}
                    >
                      <div className="flex items-center gap-space-sm truncate pr-2">
                        <span
                          className={`material-symbols-outlined text-[16px] transition-colors ${
                            isActive ? 'text-primary' : 'text-outline group-hover:text-primary'
                          }`}
                        >
                          chat_bubble
                        </span>
                        <span className="truncate">{conv.title}</span>
                      </div>
                      <span className="font-label-xs text-label-xs text-outline shrink-0 font-mono">
                        {formatRelativeTime(conv.updatedAt)}
                      </span>
                    </Link>
                  );
                })
              )}
            </nav>
          </div>
        </div>

        {/* Chân thanh bên: Cài đặt và Phiên bản */}
        <div className="p-space-md border-t border-outline-variant/50 flex items-center justify-between shrink-0">
          <Link
            href="/settings"
            onClick={onCloseMobileDrawer}
            className={`flex items-center gap-space-sm transition-colors ${
              pathname === '/settings' ? 'text-primary font-semibold' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">settings</span>
            <span className="font-body-sm text-body-sm">Cài đặt</span>
          </Link>
          <span className="font-label-xs text-label-xs text-outline bg-surface-container-high px-2 py-0.5 rounded-full border border-outline-variant/60 font-mono font-medium">
            v2.4-prod
          </span>
        </div>
      </div>
    </aside>
  );
}
