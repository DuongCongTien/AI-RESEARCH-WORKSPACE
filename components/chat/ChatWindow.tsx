'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage as ChatMessageType } from '@/types';
import { ChatMessage } from './ChatMessage';
import { EmptyChat } from './EmptyChat';
import { ChatInput } from './ChatInput';
import { Loader2, AlertCircle } from 'lucide-react';

interface ChatWindowProps {
  messages: ChatMessageType[];
  isLoading: boolean;
  errorMessage?: string | null;
  selectedCount?: number;
  onSendMessage: (text: string) => Promise<void>;
  onClearError?: () => void;
  className?: string;
}

export function ChatWindow({
  messages,
  isLoading,
  errorMessage,
  selectedCount = 0,
  onSendMessage,
  onClearError,
  className = '',
}: ChatWindowProps) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || isLoading) return;

    setInputValue('');
    if (onClearError) onClearError();
    await onSendMessage(trimmed);
  };

  const handleSelectPrompt = (prompt: string) => {
    setInputValue(prompt);
  };

  return (
    <div className={`flex flex-col h-full w-full bg-surface-container-lowest relative ${className}`}>
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.length === 0 ? (
          <EmptyChat
            onSelectPrompt={handleSelectPrompt}
            hasSelectedDocs={selectedCount > 0}
          />
        ) : (
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center gap-3 my-2 text-muted-foreground animate-pulse p-3 rounded-xl bg-surface border border-border/50 max-w-sm">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            <span className="text-xs font-medium">Synthesizing document context...</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-2.5 text-rose-600 dark:text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block">Inference or Context Error</span>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Dock */}
      <div className="p-4 sm:p-5 border-t border-border bg-surface/90 backdrop-blur-md">
        <div className="max-w-4xl mx-auto">
          <ChatInput
            value={inputValue}
            onChange={setInputValue}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            selectedCount={selectedCount}
          />
        </div>
      </div>
    </div>
  );
}

// Re-export as ChatBox for backwards compatibility
export { ChatWindow as ChatBox };
