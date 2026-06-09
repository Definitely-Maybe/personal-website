import { describe, expect, it } from 'vitest';
import { buildPersonaPrompt } from '../src/lib/chat/persona';

describe('buildPersonaPrompt', () => {
  it('includes first-person AI persona boundaries', () => {
    const prompt = buildPersonaPrompt('');
    expect(prompt).toContain('AI 分身');
    expect(prompt).toContain('不要假装作者本人实时在线');
    expect(prompt).toContain('温和');
  });

  it('appends PERSONA_BRIEF when provided', () => {
    const prompt = buildPersonaPrompt('我喜欢推荐安静的音乐。');
    expect(prompt).toContain('我喜欢推荐安静的音乐。');
  });

  it('uses fallback note when brief is empty', () => {
    const prompt = buildPersonaPrompt('');
    expect(prompt).toContain('作者尚未提供');
  });
});
