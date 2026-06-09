import { describe, expect, it } from 'vitest';
import { assertValidMessages, checkRateLimit } from '../src/lib/chat/guardrails';
import type { ChatMessage } from '../src/lib/chat/types';

describe('assertValidMessages', () => {
  it('rejects empty messages array', () => {
    expect(() => assertValidMessages([])).toThrow(/消息不能为空/);
  });

  it('rejects overlong user input', () => {
    const messages: ChatMessage[] = [{ role: 'user', content: 'x'.repeat(501) }];
    expect(() => assertValidMessages(messages)).toThrow(/过长/);
  });

  it('accepts valid user message', () => {
    expect(() =>
      assertValidMessages([{ role: 'user', content: '你好' }]),
    ).not.toThrow();
  });
});

describe('checkRateLimit', () => {
  it('allows requests under the limit', () => {
    expect(checkRateLimit('test-ip-a', Date.now())).toBe(true);
  });
});
