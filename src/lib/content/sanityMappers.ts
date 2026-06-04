import { getSanityImageUrl } from '../sanity/image';
import { clampReviewRating, getDefaultReviewCover } from '../reviews/display';
import type { Essay, PortableBlock, Review, ReviewCategory, TimelineEvent } from './types';

interface SanityBaseDocument {
  title?: string;
  slug?: string;
  date?: string;
  summary?: string;
  tags?: string[];
  body?: PortableBlock[];
}

interface SanityEssayDocument extends SanityBaseDocument {
  mood?: string;
}

interface SanityReviewDocument extends SanityBaseDocument {
  category?: ReviewCategory;
  creator?: string;
  year?: number;
  rating?: number;
  cover?: unknown;
  moments?: string[];
}

function dateOrEpoch(value?: string): Date {
  return value ? new Date(value) : new Date(0);
}

function text(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function portableBody(value: unknown): PortableBlock[] {
  return Array.isArray(value) ? (value as PortableBlock[]) : [];
}

export function mapSanityEssay(doc: SanityEssayDocument): Essay {
  return {
    title: text(doc.title),
    slug: text(doc.slug),
    date: dateOrEpoch(doc.date),
    summary: text(doc.summary),
    tags: stringArray(doc.tags),
    mood: doc.mood,
    body: portableBody(doc.body),
  };
}

export function mapSanityReview(doc: SanityReviewDocument): Review {
  const title = text(doc.title);
  const category = doc.category ?? 'music';
  const imageUrl = getSanityImageUrl(doc.cover);
  const fallbackCover = getDefaultReviewCover(category);

  return {
    title,
    slug: text(doc.slug),
    category,
    creator: text(doc.creator),
    year: typeof doc.year === 'number' ? doc.year : 0,
    date: dateOrEpoch(doc.date),
    rating: clampReviewRating(typeof doc.rating === 'number' ? doc.rating : 0),
    cover: {
      src: imageUrl ?? fallbackCover.src,
      alt: imageUrl ? `${title} 封面` : fallbackCover.alt,
    },
    summary: text(doc.summary),
    tags: stringArray(doc.tags),
    moments: stringArray(doc.moments),
    body: portableBody(doc.body),
  };
}

export function mapSanityTimelineEvent(doc: SanityBaseDocument): TimelineEvent {
  return {
    title: text(doc.title),
    slug: text(doc.slug),
    date: dateOrEpoch(doc.date),
    summary: text(doc.summary),
    tags: stringArray(doc.tags),
    body: portableBody(doc.body),
  };
}
