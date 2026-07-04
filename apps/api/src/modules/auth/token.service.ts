import crypto from 'node:crypto';
import jwt, { type SignOptions } from 'jsonwebtoken';
import type { AccessTokenPayload } from 'shared';
import { env } from '../../config/env.js';
import { RefreshTokenModel } from './refreshToken.model.js';
import { ApiError } from '../../utils/ApiError.js';

const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 días

/** Firma un access token JWT de vida corta. */
export function signAccessToken(userId: string): string {
  const payload: AccessTokenPayload = { sub: userId };
  // El TTL viene de env como string ("15m"); jsonwebtoken lo acepta en runtime.
  const options = { expiresIn: env.JWT_ACCESS_TTL } as SignOptions;
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, options);
}

/** Verifica un access token y devuelve su payload, o lanza 401. */
export function verifyAccessToken(token: string): AccessTokenPayload {
  try {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
  } catch {
    throw ApiError.unauthorized('Token de acceso no válido o expirado');
  }
}

function hashToken(raw: string): string {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

/**
 * Crea un refresh token opaco, guarda solo su hash en BD y devuelve el valor
 * en claro (que viajará en la cookie httpOnly). Guardar el hash implica que
 * una fuga de la BD no expone tokens usables.
 */
export async function issueRefreshToken(userId: string, deviceInfo?: string): Promise<string> {
  const raw = crypto.randomBytes(48).toString('hex');
  await RefreshTokenModel.create({
    userId,
    tokenHash: hashToken(raw),
    deviceInfo,
    expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
  });
  return raw;
}

/**
 * Rota un refresh token: valida el actual, lo revoca y emite uno nuevo.
 * Devuelve el userId y el nuevo token en claro. Si el token no es válido
 * (inexistente, revocado o expirado) lanza 401.
 */
export async function rotateRefreshToken(
  rawToken: string,
  deviceInfo?: string,
): Promise<{ userId: string; newRawToken: string }> {
  const existing = await RefreshTokenModel.findOne({
    tokenHash: hashToken(rawToken),
    revokedAt: { $exists: false },
    expiresAt: { $gt: new Date() },
  });

  if (!existing) {
    throw ApiError.unauthorized('Sesión no válida, vuelve a iniciar sesión');
  }

  existing.revokedAt = new Date();
  await existing.save();

  const userId = existing.userId.toString();
  const newRawToken = await issueRefreshToken(userId, deviceInfo);
  return { userId, newRawToken };
}

/** Revoca un refresh token concreto (logout de un dispositivo). */
export async function revokeRefreshToken(rawToken: string): Promise<void> {
  await RefreshTokenModel.updateOne(
    { tokenHash: hashToken(rawToken), revokedAt: { $exists: false } },
    { $set: { revokedAt: new Date() } },
  );
}
