import type { Request, Response } from 'express';
import type { PublicUser } from 'shared';
import { ApiError } from '../../utils/ApiError.js';
import { UserModel, toPublicUser } from './user.model.js';

/** Devuelve el perfil del usuario autenticado. */
export async function getMe(req: Request, res: Response): Promise<void> {
  const user = await UserModel.findById(req.userId);
  if (!user) {
    throw ApiError.notFound('Usuario no encontrado');
  }
  const body: PublicUser = toPublicUser(user);
  res.json(body);
}
