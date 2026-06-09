import {
  DEFAULT_DEEPSEEK_BASE_URL,
  DEFAULT_DEEPSEEK_MODEL,
  MAX_OUTPUT_TOKENS,
  type ChatMessage,
} from './types';

export interface StreamChatOptions {
  apiKey: string;
  baseUrl?: string;
  model?: string;
  systemPrompt: string;
  messages: ChatMessage[];
  signal?: AbortSignal;
}

export async function* streamChatCompletion(
  options: StreamChatOptions,
): AsyncGenerator<string> {
  const baseUrl = (options.baseUrl ?? DEFAULT_DEEPSEEK_BASE_URL).replace(/\/$/, '');
  const model = options.model ?? DEFAULT_DEEPSEEK_MODEL;

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${options.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      stream: true,
      max_tokens: MAX_OUTPUT_TOKENS,
      messages: [{ role: 'system', content: options.systemPrompt }, ...options.messages],
    }),
    signal: options.signal,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`DeepSeek request failed: ${response.status} ${text}`);
  }

  if (!response.body) {
    throw new Error('DeepSeek response body missing');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const parts = buffer.split('\n\n');
    buffer = parts.pop() ?? '';

    for (const part of parts) {
      const line = part
        .split('\n')
        .find((l) => l.startsWith('data: '));
      if (!line) continue;
      const data = line.slice(6).trim();
      if (data === '[DONE]') return;
      try {
        const json = JSON.parse(data) as {
          choices?: Array<{ delta?: { content?: string } }>;
        };
        const content = json.choices?.[0]?.delta?.content;
        if (content) yield content;
      } catch {
        // ignore malformed chunks
      }
    }
  }
}
