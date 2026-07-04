import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { OnboardingPage } from '@/features/spaces/pages/OnboardingPage';
import { AlbumsListPage } from '@/features/albums/pages/AlbumsListPage';
import { AlbumDetailPage } from '@/features/albums/pages/AlbumDetailPage';
import { TimelinePage } from '@/features/timeline/pages/TimelinePage';
import { SearchPage } from '@/features/search/pages/SearchPage';
import { StatsPage } from '@/features/stats/pages/StatsPage';
import { CalendarPage } from '@/features/stats/pages/CalendarPage';
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
 *  - autenticadas con Space: la app dentro de AppLayout
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
          <Route element={<AppLayout />}>
            <Route path="/" element={<AlbumsListPage />} />
            <Route path="/albums/:id" element={<AlbumDetailPage />} />
            <Route path="/timeline" element={<TimelinePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/stats" element={<StatsPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
