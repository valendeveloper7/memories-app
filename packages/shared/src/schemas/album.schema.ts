import { z } from 'zod';

const backgroundStyleSchema = z.object({
  type: z.enum(['color', 'gradient', 'image']),
  value: z.string().min(1),
});

export const createAlbumSchema = z.object({
  title: z.string().trim().min(1, 'El título es obligatorio').max(120),
  description: z.string().trim().max(2000).optional(),
  color: z.string().max(30).optional(),
  icon: z.string().max(30).optional(),
  tags: z.array(z.string().trim().min(1).max(40)).max(30).optional(),
  visibility: z.enum(['private', 'shared']).optional(),
  /** Fecha personalizada del álbum. Si se omite, es la fecha actual. */
  date: z.string().datetime().optional(),
});

export const updateAlbumSchema = z
  .object({
    title: z.string().trim().min(1).max(120),
    description: z.string().trim().max(2000),
    coverUrl: z.string().url(),
    color: z.string().max(30),
    icon: z.string().max(30),
    tags: z.array(z.string().trim().min(1).max(40)).max(30),
    visibility: z.enum(['private', 'shared']),
    isFavorite: z.boolean(),
    isArchived: z.boolean(),
    backgroundStyle: backgroundStyleSchema,
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'No hay nada que actualizar',
  });

/** Un elemento del lienzo del álbum (posición y estilo de un recuerdo). */
export const albumLayoutItemSchema = z.object({
  memoryId: z.string().min(1),
  x: z.number(),
  y: z.number(),
  w: z.number().positive(),
  h: z.number().positive(),
  rotation: z.number().default(0),
  zIndex: z.number().default(0),
  borderRadius: z.number().optional(),
  shadow: z.enum(['none', 'sm', 'md', 'lg']).optional(),
  locked: z.boolean().optional(),
});

/** Guardado del layout completo del editor (con concurrencia optimista). */
export const updateAlbumLayoutSchema = z.object({
  layout: z.array(albumLayoutItemSchema).max(500),
  version: z.number().int().nonnegative().optional(),
});

/** Filtros para el listado de álbumes (query params). */
export const listAlbumsQuerySchema = z.object({
  favorite: z.enum(['true', 'false']).optional(),
  archived: z.enum(['true', 'false']).optional(),
  visibility: z.enum(['private', 'shared']).optional(),
  tag: z.string().trim().min(1).optional(),
});

export type CreateAlbumInput = z.infer<typeof createAlbumSchema>;
export type UpdateAlbumInput = z.infer<typeof updateAlbumSchema>;
export type UpdateAlbumLayoutInput = z.infer<typeof updateAlbumLayoutSchema>;
export type ListAlbumsQuery = z.infer<typeof listAlbumsQuerySchema>;
