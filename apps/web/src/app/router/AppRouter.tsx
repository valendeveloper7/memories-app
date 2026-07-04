import { Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from '@/features/home/pages/HomePage';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { OnboardingPage } from '@/features/spaces/pages/OnboardingPage';
import {
  NoSpaceRoute,
  ProtectedRoute,
  PublicOnlyRoute,
  RequireSpace,
} from '@/features/auth/components/RouteGuards';

/**
 * Rutas de la app en tres niveles de acceso:
 *  - públicas (solo invitados): login/registro
 *  - autenticadas sin Space: onboarding
 *  - autenticadas con Space: la app en sí
 */
export function AppRouter() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<NoSpaceRoute />}>
          <Route path="/onboarding" element={<OnboardingPage />} />
        </Route>

        <Route element={<RequireSpace />}>
          <Route path="/" element={<HomePage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
