import { describe, expect, it } from 'vitest';
import { getEssayBySlug, getEssays, getReviews, getTimelineEvents } from '../src/lib/content';
import { fixtureEssays, fixtureReviews, fixtureTimelineEvents } from '../src/lib/content/fixtures';
import { mapSanityEssay, mapSanityReview, mapSanityTimelineEvent } from '../src/lib/content/sanityMappers';

describe('content fixtures', () => {
  it('provide stable sample data for local and e2e fallback', () => {
    expect(fixtureEssays.map((essay) => essay.slug)).toContain('night-walk');
    expect(fixtureReviews.some((review) => review.category === 'book')).toBe(true);
    expect(fixtureTimelineEvents[0].date).toBeInstanceOf(Date);
  });
});

describe('Sanity mappers', () => {
  it('maps essay documents into normalized essays', () => {
    const essay = mapSanityEssay({
      title: '夜里散步',
      slug: 'night-walk',
      date: '2026-06-02',
      summary: '一段关于夜晚和走路的短记。',
      tags: ['日常'],
      mood: '安静',
      body: [{ _type: 'block' }],
    });

    expect(essay.date).toBeInstanceOf(Date);
    expect(essay.slug).toBe('night-walk');
    expect(essay.tags).toEqual(['日常']);
  });

  it('maps review documents with a cover fallback', () => {
    const review = mapSanityReview({
      title: 'After Hours',
      slug: 'album-after-hours',
      category: 'music',
      creator: 'The Weeknd',
      year: 2020,
      date: '2026-06-02',
      rating: 4.3,
      summary: '霓虹、疲惫和一点危险的浪漫。',
      tags: ['夜晚'],
      moments: ['夜里走路'],
      body: [],
    });

    expect(review.cover?.src).toBe('/covers/reviews/default-music.png');
    expect(review.rating).toBe(4.3);
  });

  it('normalizes legacy 10-point Sanity review ratings into 5-point ratings', () => {
    const review = mapSanityReview({
      title: 'Melodrama',
      slug: 'album-melodrama',
      category: 'music',
      creator: 'Lorde',
      year: 2017,
      date: '2026-06-03',
      rating: 8.7,
      summary: '把派对后的空旷写得很亮。',
      tags: ['流行'],
      moments: [],
      body: [],
    });

    expect(review.rating).toBe(4.4);
  });

  it('maps timeline documents without private notes', () => {
    const event = mapSanityTimelineEvent({
      title: '开始搭个人网站',
      slug: 'website-begins',
      date: '2026-06-02',
      summary: '把个人网站从想法推进到设计。',
      tags: ['创作'],
      body: [],
    });

    expect(event.summary).toContain('个人网站');
    expect(Object.keys(event)).not.toContain('privateNotes');
  });
});

describe('content access API', () => {
  it('uses fixture content when Sanity is not configured', async () => {
    await expect(getEssayBySlug('night-walk')).resolves.toMatchObject({ title: '夜里散步' });
    await expect(getEssays()).resolves.toHaveLength(3);
    await expect(getReviews()).resolves.toHaveLength(fixtureReviews.length);
    await expect(getReviews()).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ category: 'music' }),
        expect.objectContaining({ category: 'book' }),
        expect.objectContaining({ category: 'film' }),
      ]),
    );
    await expect(getTimelineEvents()).resolves.toHaveLength(3);
  });
});
