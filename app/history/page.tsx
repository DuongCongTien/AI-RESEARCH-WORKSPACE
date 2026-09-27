'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { ConversationItem } from '@/types';

// Default mock history if DB is empty
const INITIAL_DEMO_HISTORY: ConversationItem[] = [
  {
    id: 'conv-1',
    title: 'Giảm thiểu sai số lượng tử',
    createdAt: new Date().toISOString(),
    updatedAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    messages: [
      {
        id: 'm1',
        conversationId: 'conv-1',
        role: 'user',
        content: 'Đánh giá các thuật toán giảm thiểu sai số lượng tử trên các thiết bị trung gian.',
        createdAt: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'conv-2',
    title: 'Kiểm tra đồng thuận đa tác nhân',
    createdAt: new Date().toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    messages: [],
  },
  {
    id: 'conv-3',
    title: 'Tối ưu hóa không gian tiềm ẩn',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    messages: [],
  },
  {
    id: 'conv-4',
    title: 'Phân tích rủi ro báo cáo thường niên',
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    messages: [],
  },
];

export default function HistoryPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<ConversationItem[]>(INITIAL_DEMO_HISTORY);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadConversations() {
      try {
        const res = await fetch('/api/conversations');
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            setConversations(json.data);
          }
        }
      } catch (err) {
        console.warn('History load fallback notice:', err);
      }
    }

    loadConversations();
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await fetch(`/api/conversations/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Delete error:', err);
    }
    setConversations((prev) => prev.filter((c) => c.id !== id));
  };

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter((c) => c.title.toLowerCase().includes(q));
  }, [conversations, searchQuery]);

  // Group by Today, Yesterday, Older
  const grouped = useMemo(() => {
    const today: ConversationItem[] = [];
    const yesterday: ConversationItem[] = [];
    const older: ConversationItem[] = [];

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterdayStart = todayStart - 24 * 60 * 60 * 1000;

    for (const conv of filtered) {
      const time = new Date(conv.updatedAt || conv.createdAt).getTime();
      if (time >= todayStart) {
        today.push(conv);
      } else if (time >= yesterdayStart) {
        yesterday.push(conv);
      } else {
        older.push(conv);
      }
    }

    return { today, yesterday, older };
  }, [filtered]);

  return (
    <AppShell>
      <div className="flex-1 w-full bg-surface text-on-surface p-4 lg:p-space-xl max-w-5xl mx-auto space-y-space-lg">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm border-b border-outline-variant/20 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[24px]">history</span>
              <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
                Lịch sử nghiên cứu
              </h1>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              Xem lại các cuộc hội thoại nghiên cứu trước đây, kiểm tra trích dẫn và tiếp tục phiên làm việc.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push('/research')}
            className="inline-flex items-center gap-2 px-space-md py-2 rounded-lg bg-primary hover:bg-primary-fixed text-on-primary font-body-sm text-body-sm font-medium transition-all shadow-md shrink-0 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            Phiên mới
          </button>
        </div>

        {/* Search Omnibar */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3.5 top-3 text-[20px] text-primary/70">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm phiên nghiên cứu theo chủ đề hoặc câu hỏi..."
            className="w-full bg-surface pl-10 pr-4 py-2.5 rounded-xl text-on-surface font-body-sm text-body-sm placeholder:text-outline border border-outline-variant/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-xs"
          />
        </div>

        {/* History Groups */}
        {filtered.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-8 bg-surface rounded-2xl border border-outline-variant/40 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-surface-container-high flex items-center justify-center mb-3 text-outline">
              <span className="material-symbols-outlined text-[32px]">chat_bubble_outline</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Không tìm thấy cuộc trò chuyện nào</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm mt-1">
              {searchQuery ? 'Không có cuộc trò chuyện nào khớp với tìm kiếm.' : 'Bạn chưa thực hiện phiên nghiên cứu nào.'}
            </p>
          </div>
        ) : (
          <div className="space-y-space-lg">
            {/* Today */}
            {grouped.today.length > 0 && (
              <div className="space-y-space-xs">
                <span className="font-label-xs text-label-xs uppercase tracking-wider text-outline px-1 font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                  Hôm nay
                </span>
                <div className="space-y-2.5">
                  {grouped.today.map((conv) => (
                    <ConversationRow key={conv.id} conv={conv} onDelete={handleDelete} />
                  ))}
                </div>
              </div>
            )}

            {/* Yesterday */}
            {grouped.yesterday.length > 0 && (
              <div className="space-y-space-xs">
                <span className="font-label-xs text-label-xs uppercase tracking-wider text-outline px-1 font-semibold block">
                  Hôm qua
                </span>
                <div className="space-y-2.5">
                  {grouped.yesterday.map((conv) => (
                    <ConversationRow key={conv.id} conv={conv} onDelete={handleDelete} />
                  ))}
                </div>
              </div>
            )}

            {/* Older */}
            {grouped.older.length > 0 && (
              <div className="space-y-space-xs">
                <span className="font-label-xs text-label-xs uppercase tracking-wider text-outline px-1 font-semibold block">
                  Cũ hơn
                </span>
                <div className="space-y-2.5">
                  {grouped.older.map((conv) => (
                    <ConversationRow key={conv.id} conv={conv} onDelete={handleDelete} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}

function ConversationRow({
  conv,
  onDelete,
}: {
  conv: ConversationItem;
  onDelete: (e: React.MouseEvent, id: string) => void;
}) {
  const timeFormatted = new Date(conv.updatedAt || conv.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Link
      href={`/research/${conv.id}`}
      className="flex items-center justify-between p-4 rounded-xl bg-surface border border-outline-variant/50 transition-all card-interactive shadow-xs group"
    >
      <div className="flex items-center gap-3.5 min-w-0 pr-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 group-hover:bg-primary group-hover:text-on-primary transition-all shrink-0 shadow-2xs">
          <span className="material-symbols-outlined text-[20px]">chat_bubble</span>
        </div>
        <div className="min-w-0">
          <h3 className="font-headline-sm text-headline-sm text-on-surface truncate group-hover:text-primary transition-colors font-semibold">
            {conv.title}
          </h3>
          <p className="font-label-xs text-label-xs text-outline mt-0.5 flex items-center gap-2">
            <span>{conv.messages?.length || 0} tin nhắn</span>
            <span>•</span>
            <span>Cập nhật lúc {timeFormatted}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-space-sm shrink-0">
        <button
          type="button"
          onClick={(e) => onDelete(e, conv.id)}
          className="p-2 rounded-lg text-outline hover:text-error hover:bg-error-container/20 transition-all active:scale-90 cursor-pointer"
          title="Xóa cuộc trò chuyện"
        >
          <span className="material-symbols-outlined text-[18px]">delete</span>
        </button>
        <span className="material-symbols-outlined text-[20px] text-outline group-hover:text-primary group-hover:translate-x-1 transition-all">
          chevron_right
        </span>
      </div>
    </Link>
  );
}
