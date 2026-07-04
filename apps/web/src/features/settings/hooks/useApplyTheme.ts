import { useEffect } from 'react';
import { DEFAULT_USER_PREFERENCES } from 'shared';
import { useAuthStore } from '@/features/auth/store/authStore';
import { applyPreferences } from '@/utils/theme';

/**
 * Sincroniza las preferencias del usuario con el DOM. Se re-aplica cuando
 * cambian y, si el tema es "system", reacciona a los cambios del SO.
 */
export function useApplyTheme() {
  const preferences = useAuthStore((s) => s.user?.preferences) ?? DEFAULT_USER_PREFERENCES;

  useEffect(() => {
    applyPreferences(preferences);
  }, [preferences]);

  useEffect(() => {
    if (preferences.theme !== 'system') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyPreferences(preferences);
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, [preferences]);
}
