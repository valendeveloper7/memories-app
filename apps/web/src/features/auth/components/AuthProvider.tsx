import { useEffect, type ReactNode } from 'react';
import { useAuthStore } from '../store/authStore';
import { refreshSession } from '@/services/http';

/**
 * Al montar la app intenta restaurar la sesión usando el refresh token de la
 * cookie. Mientras el estado es "idle" muestra un loader para evitar parpadeos
 * entre pantallas públicas y privadas.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const status = useAuthStore((s) => s.status);

  useEffect(() => {
    refreshSession().catch(() => useAuthStore.getState().clear());
  }, []);

  if (status === 'idle') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
