import type { RequestHandler } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { UserModel } from '../modules/users/user.model.js';

/**
 * Resuelve el Space del usuario autenticado y lo adjunta como req.spaceId.
 * Todo recurso (álbumes, recuerdos...) se filtra por este spaceId, de modo
 * que la pertenencia se verifica en un único sitio en vez de repetirse en
 * cada controller. Debe montarse siempre después de requireAuth.
 */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      spaceId?: string;
    }
  }
}

export const requireSpace: RequestHandler = asyncHandler(async (req, _res, next) => {
  const user = await UserModel.findById(req.userId).select('spaceId');
  if (!user?.spaceId) {
    throw ApiError.forbidden('No perteneces a ningún espacio todavía');
  }
  req.spaceId = user.spaceId.toString();
  next();
});
