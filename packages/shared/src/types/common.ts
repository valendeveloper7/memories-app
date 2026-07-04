/** Identificador de documento de MongoDB serializado como string en la API. */
export type Id = string;

/** Fecha serializada como ISO string en las respuestas de la API. */
export type IsoDate = string;

/** Sobre estándar de error que devuelve la API. */
export interface ApiError {
  message: string;
  code?: string;
  /** Errores de validación campo -> mensajes. */
  details?: Record<string, string[]>;
}

/** Respuesta paginada por cursor (usada en timeline, listados, etc). */
export interface CursorPage<T> {
  items: T[];
  nextCursor: string | null;
}
