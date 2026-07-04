import type { RequestHandler } from 'express';
import type { ZodTypeAny } from 'zod';

/**
 * Valida (y transforma) el body de la petición contra un esquema zod.
 * Al reemplazar req.body por el resultado parseado, los controllers reciben
 * datos ya saneados y tipados. Los errores de zod los captura el errorHandler.
 */
export const validateBody =
  (schema: ZodTypeAny): RequestHandler =>
  (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      next(result.error);
      return;
    }
    req.body = result.data;
    next();
  };
