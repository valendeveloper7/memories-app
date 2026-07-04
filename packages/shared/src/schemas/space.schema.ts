import { z } from 'zod';

export const createSpaceSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio').max(60),
  anniversaryDate: z.string().datetime().optional(),
});

export const joinSpaceSchema = z.object({
  inviteCode: z.string().trim().min(4, 'Código no válido').toUpperCase(),
});

export type CreateSpaceInput = z.infer<typeof createSpaceSchema>;
export type JoinSpaceInput = z.infer<typeof joinSpaceSchema>;
