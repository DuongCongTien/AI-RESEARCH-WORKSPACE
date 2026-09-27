import { ConversationItem, MessageItemType } from '@/types';

// Shared global in-memory conversation cache across API routes during server lifecycle
const globalForConvs = globalThis as unknown as {
  sharedConversationStore: ConversationItem[] | undefined;
};

// Store bắt đầu rỗng — không dùng dữ liệu mẫu
export const INITIAL_CONVERSATIONS: ConversationItem[] = [];

export function getSharedConversations(): ConversationItem[] {
  if (!globalForConvs.sharedConversationStore) {
    globalForConvs.sharedConversationStore = [];
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
      title: 'Phiên nghiên cứu mới',
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
