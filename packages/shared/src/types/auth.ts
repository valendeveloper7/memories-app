import type { PublicUser } from './user.js';

/** Payload que va firmado dentro del access token (JWT). */
export interface AccessTokenPayload {
  sub: string; // id del usuario
}

/** Respuesta de login/register/refresh: el access token viaja en el body,
 *  el refresh token viaja aparte en una cookie httpOnly. */
export interface AuthResponse {
  accessToken: string;
  user: PublicUser;
}
