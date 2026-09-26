'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';

export default function ResearchIndexPage() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(true);

  useEffect(() => {
    async function initSession() {
      try {
        const res = await fetch('/api/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'New Research Chat' }),
        });

        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data?.id) {
            router.replace(`/research/${json.data.id}`);
            return;
          }
        }
      } catch (err) {
        console.warn('Init session fallback:', err);
      }

      // Fallback ID if DB or API fails
      router.replace(`/research/session-${Date.now()}`);
    }

    initSession();
  }, [router]);

  return (
    <AppShell>
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-surface">
        <span className="material-symbols-outlined text-[40px] text-tertiary animate-spin mb-3">
          progress_activity
        </span>
        <h3 className="font-headline-sm text-headline-sm text-on-surface">
          Initializing Multi-Agent Research Session...
        </h3>
        <p className="font-body-sm text-body-sm text-outline mt-1">
          Loading vector embeddings and grounding context.
        </p>
      </div>
    </AppShell>
  );
}
