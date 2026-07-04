import type { RequestHandler } from 'express';

/**
 * Envuelve un handler async para que las promesas rechazadas se propaguen
 * al middleware de errores sin tener que escribir try/catch en cada controller.
 */
export const asyncHandler =
  (fn: RequestHandler): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
