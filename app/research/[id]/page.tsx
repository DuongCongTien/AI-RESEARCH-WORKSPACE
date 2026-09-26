'use client';

import React, { useState, useEffect, use, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { ChatBox } from '@/components/chat/ChatBox';
import { MessageItemType, DocumentItem, ChatStatus, ResearchResponse } from '@/types';

interface ResearchSessionPageProps {
  params: Promise<{ id: string }>;
}

export default function ResearchSessionPage({ params }: ResearchSessionPageProps) {
  const resolvedParams = use(params);
  const conversationId = resolvedParams.id;
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q');

  const [messages, setMessages] = useState<MessageItemType[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<string[]>([]);
  const [chatStatus, setChatStatus] = useState<ChatStatus>('idle');
  const [streamingContent, setStreamingContent] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const initialSentRef = useRef(false);

  // Load conversation and documents on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [docsRes, convRes] = await Promise.all([
          fetch('/api/documents'),
          fetch(`/api/conversations/${conversationId}`),
        ]);

        if (docsRes.ok) {
          const docsJson = await docsRes.json();
          if (docsJson.success && Array.isArray(docsJson.data)) {
            setDocuments(docsJson.data);
            // Default select ready documents
            const readyIds = docsJson.data
              .filter((d: DocumentItem) => d.status === 'ready' && d.inContext !== false)
              .map((d: DocumentItem) => d.id);
            setSelectedDocumentIds(readyIds.length > 0 ? readyIds : [docsJson.data[0]?.id].filter(Boolean));
          }
        }

        if (convRes.ok) {
          const convJson = await convRes.json();
          if (convJson.success && convJson.data?.messages) {
            setMessages(convJson.data.messages);
          }
        }
      } catch (err) {
        console.warn('Load research conversation warning:', err);
      }
    }

    loadData();
  }, [conversationId]);

  // Execute initial query if query param `?q=` is present
  useEffect(() => {
    if (initialQuery && !initialSentRef.current && documents.length > 0) {
      initialSentRef.current = true;
      handleSendMessage(initialQuery);
    }
  }, [initialQuery, documents]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || chatStatus === 'loading' || chatStatus === 'streaming') return;

    setErrorMessage(null);
    setChatStatus('loading');
    setStreamingContent('');

    // Append user message immediately
    const userMsg: MessageItemType = {
      id: `user-${Date.now()}`,
      conversationId,
      role: 'user',
      content: text,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          documentIds: selectedDocumentIds,
          message: text,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      if (!res.body) {
        throw new Error('Streaming body unavailable');
      }

      setChatStatus('streaming');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';
      let structuredResult: ResearchResponse | null = null;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunkText = decoder.decode(value, { stream: true });
        const lines = chunkText.split('\n').filter(Boolean);

        for (const line of lines) {
          try {
            const parsed = JSON.parse(line);
            if (parsed.type === 'chunk' && parsed.text) {
              accumulatedText += parsed.text;
              setStreamingContent(accumulatedText);
            } else if (parsed.type === 'done' && parsed.structuredResponse) {
              structuredResult = parsed.structuredResponse;
            }
          } catch {
            // Raw text chunk fallback
            accumulatedText += line;
            setStreamingContent(accumulatedText);
          }
        }
      }

      // Finalize assistant message
      const assistantMsg: MessageItemType = {
        id: `asst-${Date.now()}`,
        conversationId,
        role: 'assistant',
        content: accumulatedText || 'Synthesis complete.',
        structuredResponse: structuredResult,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setStreamingContent('');
      setChatStatus('success');
    } catch (err) {
      console.error('Chat streaming failure:', err);
      setChatStatus('error');
      setErrorMessage(
        err instanceof Error ? err.message : 'Error generating research answer'
      );
      setStreamingContent('');
    }
  };

  const handleRegenerateLast = () => {
    // Find last user message
    const userMessages = messages.filter((m) => m.role === 'user');
    if (userMessages.length > 0) {
      const lastUserMsg = userMessages[userMessages.length - 1];
      // Remove last assistant response
      setMessages((prev) => {
        if (prev.length > 0 && prev[prev.length - 1].role === 'assistant') {
          return prev.slice(0, -1);
        }
        return prev;
      });
      handleSendMessage(lastUserMsg.content);
    }
  };

  const handleRemoveSelectedDoc = (id: string) => {
    setSelectedDocumentIds((prev) => prev.filter((dId) => dId !== id));
  };

  return (
    <AppShell>
      <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] w-full overflow-hidden bg-surface">
        <ChatBox
          messages={messages}
          status={chatStatus}
          documents={documents}
          selectedDocumentIds={selectedDocumentIds}
          onSendMessage={handleSendMessage}
          onRemoveSelectedDoc={handleRemoveSelectedDoc}
          onRegenerateLast={handleRegenerateLast}
          streamingContent={streamingContent}
          errorMessage={errorMessage}
        />
      </div>
    </AppShell>
  );
}
