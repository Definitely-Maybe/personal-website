export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export const CHAT_STORAGE_KEY = 'personal-site:chat:messages';
export const MAX_USER_CHARS = 500;
export const MAX_OUTPUT_TOKENS = 800;
export const MAX_CONTEXT_MESSAGES = 20;
export const RATE_LIMIT_PER_MINUTE = 10;
export const DEFAULT_DEEPSEEK_MODEL = 'deepseek-v4-pro';
export const DEFAULT_DEEPSEEK_BASE_URL = 'https://api.deepseek.com';
