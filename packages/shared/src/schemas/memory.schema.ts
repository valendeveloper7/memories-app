import { z } from 'zod';

const locationSchema = z.object({
  name: z.string().trim().min(1).max(200),
  coordinates: z.tuple([z.number(), z.number()]),
});

export const createMemorySchema = z.object({
  type: z.enum(['photo', 'video', 'text', 'location', 'audio']),
  albumId: z.string().optional(),
  title: z.string().trim().max(200).optional(),
  description: z.string().trim().max(5000).optional(),
  mediaUrl: z.string().url().optional(),
  mediaPublicId: z.string().optional(),
  thumbnailUrl: z.string().url().optional(),
  blurhash: z.string().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  duration: z.number().positive().optional(),
  tags: z.array(z.string().trim().min(1).max(40)).max(50).optional(),
  people: z.array(z.string()).max(50).optional(),
  emotions: z.array(z.string().trim().min(1).max(40)).max(20).optional(),
  location: locationSchema.optional(),
  actualDate: z.string().datetime().optional(),
});

export const updateMemorySchema = z
  .object({
    albumId: z.string().nullable(),
    title: z.string().trim().max(200),
    description: z.string().trim().max(5000),
    tags: z.array(z.string().trim().min(1).max(40)).max(50),
    people: z.array(z.string()).max(50),
    emotions: z.array(z.string().trim().min(1).max(40)).max(20),
    location: locationSchema.nullable(),
    isFavorite: z.boolean(),
    actualDate: z.string().datetime(),
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, { message: 'No hay nada que actualizar' });

export const listMemoriesQuerySchema = z.object({
  albumId: z.string().optional(),
  type: z.enum(['photo', 'video', 'text', 'location', 'audio']).optional(),
  favorite: z.enum(['true', 'false']).optional(),
  tag: z.string().trim().min(1).optional(),
  person: z.string().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  q: z.string().trim().min(1).optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export type CreateMemoryInput = z.infer<typeof createMemorySchema>;
export type UpdateMemoryInput = z.infer<typeof updateMemorySchema>;
export type ListMemoriesQuery = z.infer<typeof listMemoriesQuerySchema>;
