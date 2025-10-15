import { z } from 'zod';

/**
 * Phase 6 Lite: Post validation schemas
 */

// Slug validation - lowercase alphanumeric with hyphens
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const PostCreateSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title must be less than 200 characters'),
  slug: z.string()
    .min(3, 'Slug must be at least 3 characters')
    .max(100, 'Slug must be less than 100 characters')
    .regex(slugRegex, 'Slug must be lowercase alphanumeric with hyphens only'),
  excerpt: z.string().max(500, 'Excerpt must be less than 500 characters').optional(),
  content: z.string().min(10, 'Content must be at least 10 characters'),
});

export const PostUpdateSchema = PostCreateSchema.partial();

export const PostPublishSchema = z.object({
  id: z.string().cuid(),
});

// Type inference helpers
export type PostCreateInput = z.infer<typeof PostCreateSchema>;
export type PostUpdateInput = z.infer<typeof PostUpdateSchema>;
export type PostPublishInput = z.infer<typeof PostPublishSchema>;

