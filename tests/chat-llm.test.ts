import { describe, expect, it, vi } from 'vitest';
import { streamChatCompletion } from '../src/lib/chat/llm';
import type { ChatMessage } from '../src/lib/chat/types';

describe('streamChatCompletion', () => {
  it('yields content deltas from DeepSeek SSE', async () => {
    const payload = [
      'data: {"choices":[{"delta":{"content":"你"}}]}\n\n',
      'data: {"choices":[{"delta":{"content":"好"}}]}\n\n',
      'data: [DONE]\n\n',
    ].join('');

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        body: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(payload));
            controller.close();
          },
        }),
      }),
    );

    const messages: ChatMessage[] = [{ role: 'user', content: '你好' }];
    const chunks: string[] = [];
    for await (const part of streamChatCompletion({
      apiKey: 'test-key',
      baseUrl: 'https://api.deepseek.com',
      model: 'deepseek-v4-pro',
      systemPrompt: 'test',
      messages,
    })) {
      chunks.push(part);
    }

    expect(chunks.join('')).toBe('你好');
    vi.unstubAllGlobals();
  });
});
