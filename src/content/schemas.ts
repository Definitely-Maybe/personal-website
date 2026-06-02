import { z } from 'zod';

const visibilitySchema = z.enum(['public']).default('public');

export const essaySchema = z.object({
  title: z.string(),
  date: z.date(),
  summary: z.string(),
  tags: z.array(z.string()).default([]),
  mood: z.string().optional(),
  visibility: visibilitySchema,
});

export const reviewSchema = z.object({
  title: z.string(),
  category: z.enum(['music', 'book', 'film']),
  creator: z.string(),
  date: z.date(),
  year: z.number().int(),
  rating: z.number().min(0).max(10),
  summary: z.string(),
  cover: z.object({
    src: z.string(),
    alt: z.string(),
  }),
  tags: z.array(z.string()).default([]),
  moments: z.array(z.string()).default([]),
  visibility: visibilitySchema,
});

export const timelineSchema = z.object({
  title: z.string(),
  date: z.date(),
  summary: z.string(),
  tags: z.array(z.string()).default([]),
  visibility: visibilitySchema,
  privateNotes: z.string().optional(),
  privateNotesPolicy: z.enum(['owner_only']).optional(),
});
