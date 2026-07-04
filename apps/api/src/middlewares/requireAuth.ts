import type { RequestHandler } from 'express';
import { ApiError } from '../utils/ApiError.js';
import { verifyAccessToken } from '../modules/auth/token.service.js';

/**
 * Extiende Request con el id del usuario autenticado. Los controllers pueden
 * leer req.userId con seguridad detrás de este middleware.
 */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

/** Exige un access token válido en la cabecera Authorization: Bearer <token>. */
export const requireAuth: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    next(ApiError.unauthorized('Falta el token de acceso'));
    return;
  }

  const token = header.slice('Bearer '.length);
  const payload = verifyAccessToken(token);
  req.userId = payload.sub;
  next();
};
