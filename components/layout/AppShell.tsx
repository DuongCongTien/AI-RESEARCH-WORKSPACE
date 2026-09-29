'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileDrawer } from './MobileDrawer';
import { DocumentItem, ConversationItem } from '@/types';
import { UploadDialog } from '@/components/documents/UploadDialog';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);

  useEffect(() => {
    async function loadNavData() {
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
        console.warn('AppShell background load notice:', err);
      }
    }

    loadNavData();
  }, []);

  const handleDocumentUploaded = (uploaded: DocumentItem | DocumentItem[]) => {
    const newDocs = Array.isArray(uploaded) ? uploaded : [uploaded];
    setDocuments((prev) => [...newDocs, ...prev]);
    setIsUploadOpen(false);
  };

  return (
    <div className="min-h-screen bg-surface font-body-md text-on-surface antialiased relative selection:bg-primary/20 selection:text-primary">
      {/* Dynamic Ambient Background Floating Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-60 dark:opacity-20 transition-opacity duration-700">
        <div className="absolute -top-[15%] right-[5%] w-[650px] h-[650px] rounded-full bg-gradient-to-br from-indigo-300/30 via-sky-300/20 to-transparent blur-3xl animate-float-slow" />
        <div className="absolute top-[35%] -left-[10%] w-[550px] h-[550px] rounded-full bg-gradient-to-tr from-purple-300/25 via-indigo-200/20 to-transparent blur-3xl animate-float-reverse" />
        <div className="absolute -bottom-[15%] right-[30%] w-[600px] h-[600px] rounded-full bg-gradient-to-tl from-sky-300/25 via-teal-200/15 to-transparent blur-3xl animate-float-slow" />
      </div>

      {/* Desktop Fixed Sidebar */}
      <div className="hidden lg:block fixed left-0 top-0 h-full w-72 z-50">
        <Sidebar
          documents={documents}
          conversations={conversations}
          onOpenUpload={() => setIsUploadOpen(true)}
        />
      </div>

      {/* Mobile Drawer */}
      <MobileDrawer isOpen={isMobileOpen} onClose={() => setIsMobileOpen(false)}>
        <Sidebar
          documents={documents}
          conversations={conversations}
          onOpenUpload={() => {
            setIsMobileOpen(false);
            setIsUploadOpen(true);
          }}
          onCloseMobileDrawer={() => setIsMobileOpen(false)}
        />
      </MobileDrawer>

      {/* Main Layout Area */}
      <div className="lg:pl-72 flex flex-col min-h-screen relative z-10">
        <Header onToggleMobileMenu={() => setIsMobileOpen(true)} />
        <main className="w-full pt-16 min-h-[calc(100vh-4rem)] flex-1 flex flex-col transition-all">
          {children}
        </main>
      </div>

      {/* Upload Dialog Modal */}
      {isUploadOpen && (
        <UploadDialog
          isOpen={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
          onUploaded={handleDocumentUploaded}
        />
      )}
    </div>
  );
}
