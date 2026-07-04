import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

/** Solo deja pasar a usuarios autenticados; si no, redirige a /login. */
export function ProtectedRoute() {
  const status = useAuthStore((s) => s.status);
  return status === 'authenticated' ? <Outlet /> : <Navigate to="/login" replace />;
}

/** Rutas solo para invitados (login/registro); si ya hay sesión, va a inicio. */
export function PublicOnlyRoute() {
  const status = useAuthStore((s) => s.status);
  return status === 'authenticated' ? <Navigate to="/" replace /> : <Outlet />;
}

/** Exige que el usuario pertenezca a un Space; si no, va al onboarding. */
export function RequireSpace() {
  const spaceId = useAuthStore((s) => s.user?.spaceId);
  return spaceId ? <Outlet /> : <Navigate to="/onboarding" replace />;
}

/** Solo para usuarios sin Space (onboarding); si ya tienen, va a inicio. */
export function NoSpaceRoute() {
  const spaceId = useAuthStore((s) => s.user?.spaceId);
  return spaceId ? <Navigate to="/" replace /> : <Outlet />;
}
