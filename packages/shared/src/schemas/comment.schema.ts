import { z } from 'zod';
import { REACTION_EMOJIS } from '../types/reaction.js';

export const createCommentSchema = z.object({
  targetType: z.enum(['memory', 'album']),
  targetId: z.string().min(1),
  text: z.string().trim().min(1, 'El comentario no puede estar vacío').max(2000),
  parentCommentId: z.string().optional(),
});

export const updateCommentSchema = z.object({
  text: z.string().trim().min(1).max(2000),
});

export const listCommentsQuerySchema = z.object({
  targetType: z.enum(['memory', 'album']),
  targetId: z.string().min(1),
});

export const toggleReactionSchema = z.object({
  targetType: z.enum(['memory', 'album', 'comment']),
  targetId: z.string().min(1),
  emoji: z.enum(REACTION_EMOJIS),
});

export const listReactionsQuerySchema = z.object({
  targetType: z.enum(['memory', 'album', 'comment']),
  targetId: z.string().min(1),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
export type ToggleReactionInput = z.infer<typeof toggleReactionSchema>;
