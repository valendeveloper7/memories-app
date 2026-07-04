import type { CookieOptions, Request, Response } from 'express';
import type { AuthResponse } from 'shared';
import { isProd } from '../../config/env.js';
import { ApiError } from '../../utils/ApiError.js';
import { UserModel, toPublicUser } from '../users/user.model.js';
import { loginUser, registerUser } from './auth.service.js';
import { revokeRefreshToken, rotateRefreshToken, signAccessToken } from './token.service.js';

const REFRESH_COOKIE = 'refresh_token';

/** Configuración de la cookie del refresh token. httpOnly evita acceso por JS
 *  (mitiga XSS); SameSite=strict mitiga CSRF; Secure solo en producción. */
const refreshCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: 'strict',
  path: '/api/auth',
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

function setRefreshCookie(res: Response, token: string): void {
  res.cookie(REFRESH_COOKIE, token, refreshCookieOptions);
}

function deviceInfo(req: Request): string | undefined {
  return req.headers['user-agent'];
}

export async function register(req: Request, res: Response): Promise<void> {
  const { user, accessToken, refreshToken } = await registerUser(req.body, deviceInfo(req));
  setRefreshCookie(res, refreshToken);
  const body: AuthResponse = { accessToken, user };
  res.status(201).json(body);
}

export async function login(req: Request, res: Response): Promise<void> {
  const { user, accessToken, refreshToken } = await loginUser(req.body, deviceInfo(req));
  setRefreshCookie(res, refreshToken);
  const body: AuthResponse = { accessToken, user };
  res.json(body);
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const current = req.cookies?.[REFRESH_COOKIE] as string | undefined;
  if (!current) {
    throw ApiError.unauthorized('No hay sesión activa');
  }

  const { userId, newRawToken } = await rotateRefreshToken(current, deviceInfo(req));
  const user = await UserModel.findById(userId);
  if (!user) {
    throw ApiError.unauthorized('El usuario ya no existe');
  }

  setRefreshCookie(res, newRawToken);
  const body: AuthResponse = { accessToken: signAccessToken(userId), user: toPublicUser(user) };
  res.json(body);
}

export async function logout(req: Request, res: Response): Promise<void> {
  const current = req.cookies?.[REFRESH_COOKIE] as string | undefined;
  if (current) {
    await revokeRefreshToken(current);
  }
  res.clearCookie(REFRESH_COOKIE, { ...refreshCookieOptions, maxAge: undefined });
  res.status(204).send();
}
