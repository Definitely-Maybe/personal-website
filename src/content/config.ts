import { defineCollection } from 'astro:content';
import { essaySchema, reviewSchema, timelineSchema } from './schemas';

const essays = defineCollection({
  type: 'content',
  schema: essaySchema,
});

const reviews = defineCollection({
  type: 'content',
  schema: reviewSchema,
});

const timeline = defineCollection({
  type: 'content',
  schema: timelineSchema,
});

export const collections = {
  essays,
  reviews,
  timeline,
};
