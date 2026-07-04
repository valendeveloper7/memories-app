import type { AuthResponse, LoginInput, PublicUser, RegisterInput } from 'shared';
import { http } from '@/services/http';

/** Capa de acceso a la API de autenticación. Solo llamadas HTTP, sin estado. */
export const authApi = {
  register: (input: RegisterInput) =>
    http.post<AuthResponse>('/auth/register', input).then((r) => r.data),

  login: (input: LoginInput) => http.post<AuthResponse>('/auth/login', input).then((r) => r.data),

  logout: () => http.post('/auth/logout').then(() => undefined),

  me: () => http.get<PublicUser>('/users/me').then((r) => r.data),
};
