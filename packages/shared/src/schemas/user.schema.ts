import { z } from 'zod';

const hexColor = z.string().regex(/^#([0-9a-fA-F]{6})$/, 'Color no válido');

export const updatePreferencesSchema = z
  .object({
    theme: z.enum(['light', 'dark', 'system']),
    accentColor: hexColor,
    secondaryColor: hexColor,
    fontFamily: z.string().min(1).max(60),
    borderRadius: z.enum(['none', 'sm', 'md', 'lg', 'full']),
    density: z.enum(['compact', 'comfortable', 'spacious']),
    backgroundImage: z.string().url().nullable(),
    animationsEnabled: z.boolean(),
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, { message: 'No hay nada que actualizar' });

export const updateProfileSchema = z
  .object({
    name: z.string().trim().min(2).max(60),
    avatarUrl: z.string().url().nullable(),
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, { message: 'No hay nada que actualizar' });

export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
