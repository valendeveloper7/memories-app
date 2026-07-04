import { Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from '@/features/home/pages/HomePage';

/**
 * Definición central de rutas. A medida que crezcan las features se irán
 * añadiendo rutas y guards (rutas protegidas por autenticación).
 */
export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
