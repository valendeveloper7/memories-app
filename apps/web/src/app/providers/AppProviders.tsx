import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/features/auth/components/AuthProvider';
import { useApplyTheme } from '@/features/settings/hooks/useApplyTheme';

/** Aplica las preferencias de tema al DOM. Sin render propio. */
function ThemeApplier() {
  useApplyTheme();
  return null;
}

/**
 * Agrupa todos los providers globales (React Query, Router, y más adelante
 * Theme y Auth). Mantenerlos aquí evita anidar providers en main.tsx.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeApplier />
        <AuthProvider>{children}</AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
