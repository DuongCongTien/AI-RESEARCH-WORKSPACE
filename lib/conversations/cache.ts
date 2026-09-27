import { ConversationItem, MessageItemType } from '@/types';

// Shared global in-memory conversation cache across API routes during server lifecycle
const globalForConvs = globalThis as unknown as {
  sharedConversationStore: ConversationItem[] | undefined;
};

export const INITIAL_CONVERSATIONS: ConversationItem[] = [
  {
    id: 'conv-1',
    title: 'Transformer Architecture Analysis',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
    documentIds: ['doc-annual-report'],
    messages: [
      {
        id: 'msg-seed-1',
        conversationId: 'conv-1',
        role: 'user',
        content: 'Summarize the core operational benchmarks in the annual report.',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'msg-seed-2',
        conversationId: 'conv-1',
        role: 'assistant',
        content: 'In fiscal year 2024, deep learning operations grew 34.2% YoY with 2.1x throughput expansion.',
        structuredResponse: {
          summary: 'In fiscal year 2024, our deep learning infrastructure operations expanded by 34.2% Year-Over-Year. Core research clusters achieved an inference throughput enhancement of 2.1x.',
          key_points: [
            '34.2% Year-Over-Year expansion in deep learning infrastructure',
            '2.1x inference throughput enhancement from speculative decoding',
            'GAIA-v2 accuracy increase from 61.8% to 74.3%',
          ],
          risks: [
            {
              title: 'Context window saturation',
              description: 'High concurrency queries on sparse attention kernels may increase memory overhead.',
              severity: 'medium',
            },
          ],
          actions: [
            {
              title: 'Scale speculative decoding clusters',
              description: 'Deploy speculative kernels across all primary inference nodes in Q2.',
            },
          ],
          sources: [
            {
              documentId: 'doc-annual-report',
              documentName: 'Annual_Report.pdf',
              page: 1,
              excerpt: 'In fiscal year 2024, our deep learning infrastructure operations expanded by 34.2% Year-Over-Year.',
            },
          ],
        },
        createdAt: new Date(Date.now() - 3500000).toISOString(),
      },
    ],
  },
];

export function getSharedConversations(): ConversationItem[] {
  if (!globalForConvs.sharedConversationStore) {
    globalForConvs.sharedConversationStore = [...INITIAL_CONVERSATIONS];
  }
  return globalForConvs.sharedConversationStore;
}

export function getSharedConversationById(id: string): ConversationItem | undefined {
  const convs = getSharedConversations();
  return convs.find((c) => c.id === id);
}

export function addSharedConversation(conv: ConversationItem): void {
  const convs = getSharedConversations();
  convs.unshift(conv);
}

export function updateSharedConversation(
  id: string,
  updater: (existing: ConversationItem) => ConversationItem
): ConversationItem | null {
  const convs = getSharedConversations();
  const index = convs.findIndex((c) => c.id === id);
  if (index === -1) {
    // If not found, create it
    const created: ConversationItem = updater({
      id,
      title: 'New Research Chat',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
    });
    convs.unshift(created);
    return created;
  }
  convs[index] = updater(convs[index]);
  return convs[index];
}

export function addSharedMessage(conversationId: string, message: MessageItemType): void {
  updateSharedConversation(conversationId, (conv) => ({
    ...conv,
    updatedAt: new Date().toISOString(),
    messages: [...(conv.messages || []), message],
  }));
}

export function deleteSharedConversation(id: string): void {
  if (globalForConvs.sharedConversationStore) {
    globalForConvs.sharedConversationStore = globalForConvs.sharedConversationStore.filter(
      (c) => c.id !== id
    );
  }
}
