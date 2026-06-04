import type { PortableBlock, Review, ReviewCategory, ReviewCover } from '../content/types';

export const REVIEW_DEFAULT_COVERS: Record<ReviewCategory, ReviewCover> = {
  music: { src: '/covers/reviews/default-music.png', alt: '音乐默认封面' },
  book: { src: '/covers/reviews/default-book.png', alt: '书籍默认封面' },
  film: { src: '/covers/reviews/default-film.png', alt: '影视默认封面' },
};

export function clampReviewRating(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(5, Math.max(0, Math.round(value * 10) / 10));
}

export function formatReviewRating(value: number): string {
  return `${clampReviewRating(value).toFixed(1)}/5`;
}

export function getStarSegments(value: number): number[] {
  const rating = clampReviewRating(value);

  return Array.from({ length: 5 }, (_, index) => {
    const remaining = rating - index;
    if (remaining >= 1) return 100;
    if (remaining <= 0) return 0;
    return Math.round(remaining * 10) * 10;
  });
}

export function getDefaultReviewCover(category: ReviewCategory): ReviewCover {
  return REVIEW_DEFAULT_COVERS[category];
}

export function getReviewCover(review: Review): ReviewCover {
  return review.cover ?? getDefaultReviewCover(review.category);
}

export function hasLongReview(review: Pick<Review, 'body'>): boolean {
  return review.body.some((block: PortableBlock) => block._type === 'block');
}

export function formatReviewDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `记录于 ${year}.${month}.${day}`;
}
