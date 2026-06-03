import { sanityClient } from '../sanity/client';
import { essayBySlugQuery, essaysQuery, reviewsQuery, timelineQuery } from '../sanity/queries';
import { fixtureEssays, fixtureReviews, fixtureTimelineEvents } from './fixtures';
import { mapSanityEssay, mapSanityReview, mapSanityTimelineEvent } from './sanityMappers';
import type { Essay, Review, TimelineEvent } from './types';

function shouldUseFixtures() {
  return !sanityClient || import.meta.env.PUBLIC_CONTENT_SOURCE === 'fixture';
}

export async function getEssays(): Promise<Essay[]> {
  if (shouldUseFixtures()) {
    return fixtureEssays;
  }

  const docs = await sanityClient!.fetch(essaysQuery);
  return docs.map(mapSanityEssay);
}

export async function getEssayBySlug(slug: string): Promise<Essay | undefined> {
  if (shouldUseFixtures()) {
    return fixtureEssays.find((essay) => essay.slug === slug);
  }

  const doc = await sanityClient!.fetch(essayBySlugQuery, { slug });
  return doc ? mapSanityEssay(doc) : undefined;
}

export async function getReviews(): Promise<Review[]> {
  if (shouldUseFixtures()) {
    return fixtureReviews;
  }

  const docs = await sanityClient!.fetch(reviewsQuery);
  return docs.map(mapSanityReview);
}

export async function getTimelineEvents(): Promise<TimelineEvent[]> {
  if (shouldUseFixtures()) {
    return fixtureTimelineEvents;
  }

  const docs = await sanityClient!.fetch(timelineQuery);
  return docs.map(mapSanityTimelineEvent);
}
