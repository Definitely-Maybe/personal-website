import { describe, expect, it } from 'vitest';
import { getSimulatedReply, suggestedPrompts } from '../src/data/chatPresets';

describe('chat presets', () => {
  it('includes first-person recent-thought prompt', () => {
    expect(suggestedPrompts).toContain('你最近在想什么？');
  });

  it('routes music questions toward reviews', () => {
    expect(getSimulatedReply('给我推荐一点音乐')).toContain('/reviews');
  });

  it('admits the real AI is not connected for unknown inputs', () => {
    expect(getSimulatedReply('一个很随机的问题')).toContain('还没有接入真正的 AI');
  });
});
