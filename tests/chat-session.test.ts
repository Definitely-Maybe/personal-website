import { describe, expect, it } from 'vitest';
import { truncateMessages } from '../src/lib/chat/session';
import type { ChatMessage } from '../src/lib/chat/types';

function msg(role: ChatMessage['role'], content: string): ChatMessage {
  return { role, content };
}

describe('truncateMessages', () => {
  it('keeps the most recent 20 messages (10 rounds)', () => {
    const messages = Array.from({ length: 24 }, (_, i) =>
      msg(i % 2 === 0 ? 'user' : 'assistant', `m${i}`),
    );
    const result = truncateMessages(messages);
    expect(result).toHaveLength(20);
    expect(result[0]?.content).toBe('m4');
    expect(result[19]?.content).toBe('m23');
  });

  it('returns empty array unchanged', () => {
    expect(truncateMessages([])).toEqual([]);
  });
});
