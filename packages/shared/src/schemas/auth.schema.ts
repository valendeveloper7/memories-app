import { z } from 'zod';

/**
 * Esquemas de autenticación compartidos entre frontend (validación de
 * formularios) y backend (validación del body de la petición). Una única
 * fuente de verdad evita que las reglas se desincronicen.
 */

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres').max(60),
  email: z.string().trim().toLowerCase().email('Email no válido'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(72, 'La contraseña es demasiado larga'),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Email no válido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
