import type { APIRoute } from 'astro';
import { buildPersonaPrompt } from '../../lib/chat/persona';
import { assertValidMessages, checkRateLimit, sanitizeMessages } from '../../lib/chat/guardrails';
import { streamChatCompletion } from '../../lib/chat/llm';
import type { ChatMessage } from '../../lib/chat/types';

export const prerender = false;

function jsonError(status: number, message: string) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function getClientIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

export const POST: APIRoute = async ({ request }) => {
  const apiKey = import.meta.env.DEEPSEEK_API_KEY;
  const isProd = import.meta.env.PROD;

  if (!apiKey) {
    return jsonError(isProd ? 503 : 503, isProd ? '对话服务暂未配置' : '缺少 DEEPSEEK_API_KEY');
  }

  let body: { messages?: ChatMessage[] };
  try {
    body = await request.json();
  } catch {
    return jsonError(400, '请求格式无效');
  }

  const messages = sanitizeMessages(body.messages ?? []);

  try {
    assertValidMessages(messages);
  } catch (error) {
    return jsonError(400, error instanceof Error ? error.message : '消息无效');
  }

  const ip = getClientIp(request);
  if (!checkRateLimit(ip)) {
    return jsonError(429, '请求过于频繁，请稍后再试');
  }

  const systemPrompt = buildPersonaPrompt(import.meta.env.PERSONA_BRIEF);
  const model = import.meta.env.DEEPSEEK_MODEL;
  const baseUrl = import.meta.env.DEEPSEEK_BASE_URL;
  const abortController = new AbortController();
  const timeout = setTimeout(() => abortController.abort(), 30_000);

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        for await (const chunk of streamChatCompletion({
          apiKey,
          baseUrl,
          model,
          systemPrompt,
          messages,
          signal: abortController.signal,
        })) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`));
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      } catch {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: '生成失败，请稍后再试' })}\n\n`),
        );
      } finally {
        clearTimeout(timeout);
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
};
