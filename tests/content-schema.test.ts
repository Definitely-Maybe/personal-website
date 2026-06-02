import { describe, expect, it } from 'vitest';
import { essaySchema, reviewSchema, timelineSchema } from '../src/content/schemas';

describe('content schemas', () => {
  it('accepts an essay with optional mood and public visibility', () => {
    const parsed = essaySchema.parse({
      title: '夜里散步',
      date: new Date('2026-06-02'),
      summary: '一段关于夜晚和走路的短记。',
      tags: ['日常'],
      mood: '安静',
      visibility: 'public',
    });

    expect(parsed.visibility).toBe('public');
  });

  it('accepts a review with a local cover', () => {
    const parsed = reviewSchema.parse({
      title: 'After Hours',
      category: 'music',
      creator: 'The Weeknd',
      date: new Date('2026-06-02'),
      year: 2020,
      rating: 8.5,
      summary: '霓虹、疲惫和一点危险的浪漫。',
      cover: {
        src: '/covers/reviews/after-hours.svg',
        alt: 'After Hours 的风格化封面',
      },
      tags: ['流行', '夜晚'],
      moments: ['夜里走路'],
      visibility: 'public',
    });

    expect(parsed.category).toBe('music');
    expect(parsed.cover.src).toBe('/covers/reviews/after-hours.svg');
  });

  it('marks timeline private notes as owner-only material', () => {
    const parsed = timelineSchema.parse({
      title: '开始搭个人网站',
      date: new Date('2026-06-02'),
      summary: '把个人网站从想法推进到设计。',
      tags: ['创作'],
      visibility: 'public',
      privateNotes: '这件事对我意味着重新整理表达方式。',
      privateNotesPolicy: 'owner_only',
    });

    expect(parsed.privateNotesPolicy).toBe('owner_only');
  });
});
