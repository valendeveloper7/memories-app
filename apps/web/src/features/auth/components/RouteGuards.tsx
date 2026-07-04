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
