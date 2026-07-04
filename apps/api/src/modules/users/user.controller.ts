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

/** Actualiza las preferencias de tema/UI del usuario (merge parcial). */
export async function updatePreferences(req: Request, res: Response): Promise<void> {
  const user = await UserModel.findById(req.userId);
  if (!user) throw ApiError.notFound('Usuario no encontrado');

  user.preferences = { ...user.preferences, ...req.body };
  await user.save();
  res.json(toPublicUser(user));
}

/** Actualiza el perfil (nombre, avatar). */
export async function updateProfile(req: Request, res: Response): Promise<void> {
  const user = await UserModel.findByIdAndUpdate(req.userId, { $set: req.body }, { new: true });
  if (!user) throw ApiError.notFound('Usuario no encontrado');
  res.json(toPublicUser(user));
}
