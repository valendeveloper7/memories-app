import { create } from 'zustand';
import type { PublicUser } from 'shared';

/**
 * Estado de sesión. El access token vive SOLO en memoria (nunca en
 * localStorage) para mitigar XSS; se restaura al recargar mediante el refresh
 * token en cookie httpOnly. `status` distingue el arranque (idle) de los
 * estados resueltos.
 */
interface AuthState {
  user: PublicUser | null;
  accessToken: string | null;
  status: 'idle' | 'authenticated' | 'unauthenticated';
  setSession: (user: PublicUser, accessToken: string) => void;
  setAccessToken: (token: string) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  status: 'idle',
  setSession: (user, accessToken) => set({ user, accessToken, status: 'authenticated' }),
  setAccessToken: (accessToken) => set({ accessToken }),
  clear: () => set({ user: null, accessToken: null, status: 'unauthenticated' }),
}));
