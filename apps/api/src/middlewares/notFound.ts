import type { RequestHandler } from 'express';
import { ApiError } from '../utils/ApiError.js';

/** Captura rutas no definidas y las convierte en un 404 uniforme. */
export const notFound: RequestHandler = (req, _res, next) => {
  next(ApiError.notFound(`Ruta no encontrada: ${req.method} ${req.originalUrl}`));
};
