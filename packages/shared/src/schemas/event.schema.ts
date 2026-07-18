import { z } from 'zod';

const hexColor = z.string().regex(/^#([0-9a-fA-F]{6})$/, 'Color no válido');

export const createEventSchema = z.object({
  title: z.string().trim().min(1, 'El título es obligatorio').max(120),
  type: z.enum(['birthday', 'special', 'other']),
  color: hexColor.optional(),
  date: z.string().datetime(),
  recurrence: z.enum(['none', 'weekly', 'monthly', 'yearly']).default('none'),
});

export const updateEventSchema = z
  .object({
    title: z.string().trim().min(1).max(120),
    type: z.enum(['birthday', 'special', 'other']),
    color: hexColor,
    date: z.string().datetime(),
    recurrence: z.enum(['none', 'weekly', 'monthly', 'yearly']),
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, { message: 'No hay nada que actualizar' });

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
