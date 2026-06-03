import { describe, expect, it } from 'vitest';
import { fixtureEssays, fixtureReviews, fixtureTimelineEvents } from '../src/lib/content/fixtures';

describe('content fixtures', () => {
  it('provide stable sample data for local and e2e fallback', () => {
    expect(fixtureEssays.map((essay) => essay.slug)).toContain('night-walk');
    expect(fixtureReviews.some((review) => review.category === 'book')).toBe(true);
    expect(fixtureTimelineEvents[0].date).toBeInstanceOf(Date);
  });
});
