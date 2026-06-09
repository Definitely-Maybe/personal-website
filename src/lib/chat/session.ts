import { MAX_CONTEXT_MESSAGES, type ChatMessage } from './types';

export { CHAT_STORAGE_KEY } from './types';

export function truncateMessages(messages: ChatMessage[]): ChatMessage[] {
  if (messages.length <= MAX_CONTEXT_MESSAGES) return messages;
  return messages.slice(-MAX_CONTEXT_MESSAGES);
}
