import { MAX_USER_CHARS, RATE_LIMIT_PER_MINUTE, type ChatMessage } from './types';
import { truncateMessages } from './session';

const hits = new Map<string, number[]>();

export function sanitizeMessages(messages: ChatMessage[]): ChatMessage[] {
  return truncateMessages(
    messages.filter(
      (m) =>
        (m.role === 'user' || m.role === 'assistant') &&
        typeof m.content === 'string' &&
        m.content.trim().length > 0,
    ),
  );
}

export function assertValidMessages(messages: ChatMessage[]): void {
  if (messages.length === 0) {
    throw new Error('消息不能为空');
  }

  const lastUser = [...messages].reverse().find((m) => m.role === 'user');
  if (!lastUser) {
    throw new Error('缺少用户消息');
  }

  if (lastUser.content.length > MAX_USER_CHARS) {
    throw new Error('消息过长');
  }
}

export function checkRateLimit(ip: string, now = Date.now()): boolean {
  const windowStart = now - 60_000;
  const timestamps = (hits.get(ip) ?? []).filter((t) => t > windowStart);
  if (timestamps.length >= RATE_LIMIT_PER_MINUTE) {
    hits.set(ip, timestamps);
    return false;
  }
  timestamps.push(now);
  hits.set(ip, timestamps);
  return true;
}
