import { describe, expect, it } from 'vitest';
import { fixtureReviews } from '../src/lib/content/fixtures';
import {
  clampReviewRating,
  formatReviewDate,
  formatReviewRating,
  getDefaultReviewCover,
  getReviewCover,
  getStarSegments,
  hasLongReview,
} from '../src/lib/reviews/display';

describe('review display helpers', () => {
  it('formats 5-point ratings with one decimal place', () => {
    expect(clampReviewRating(4.34)).toBe(4.3);
    expect(clampReviewRating(6)).toBe(5);
    expect(clampReviewRating(-1)).toBe(0);
    expect(formatReviewRating(4.3)).toBe('4.3/5');
  });

  it('returns 0.1-precision star fill percentages', () => {
    expect(getStarSegments(4.3)).toEqual([100, 100, 100, 100, 30]);
    expect(getStarSegments(3.7)).toEqual([100, 100, 100, 70, 0]);
    expect(getStarSegments(5)).toEqual([100, 100, 100, 100, 100]);
  });

  it('selects category-specific default covers', () => {
    expect(getDefaultReviewCover('music').src).toBe('/covers/reviews/default-music.png');
    expect(getDefaultReviewCover('book').src).toBe('/covers/reviews/default-book.png');
    expect(getDefaultReviewCover('film').src).toBe('/covers/reviews/default-film.png');
  });

  it('uses uploaded cover before category fallback', () => {
    const review = fixtureReviews[0];
    expect(getReviewCover(review).src).toBe(review.cover?.src);
    expect(getReviewCover({ ...review, cover: undefined }).src).toBe('/covers/reviews/default-music.png');
  });

  it('detects long reviews and formats record dates', () => {
    expect(hasLongReview({ ...fixtureReviews[0], body: [{ _type: 'block' }] })).toBe(true);
    expect(hasLongReview({ ...fixtureReviews[0], body: [] })).toBe(false);
    expect(formatReviewDate(new Date('2026-06-04'))).toBe('记录于 2026.06.04');
  });
});
