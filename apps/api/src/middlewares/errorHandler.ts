import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { ApiError } from '../utils/ApiError.js';
import { isProd } from '../config/env.js';

/**
 * Manejador central de errores. Cualquier error lanzado en un controller
 * (envuelto por asyncHandler) acaba aquí y se traduce a una respuesta JSON
 * uniforme con el sobre { message, code, details }.
 */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(400).json({
      message: 'Datos de entrada no válidos',
      code: 'VALIDATION_ERROR',
      details: err.flatten().fieldErrors,
    });
    return;
  }

  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      message: err.message,
      code: err.code,
      details: err.details,
    });
    return;
  }

  console.error('💥 Error no controlado:', err);
  res.status(500).json({
    message: isProd ? 'Error interno del servidor' : String((err as Error)?.message ?? err),
    code: 'INTERNAL_ERROR',
  });
};
