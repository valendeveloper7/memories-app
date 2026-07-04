import type { UserPreferences } from 'shared';

/** Convierte un hex (#rrggbb) al formato "r g b" que usan las variables CSS. */
export function hexToRgbTriplet(hex: string): string {
  const value = hex.replace('#', '');
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `${r} ${g} ${b}`;
}

const RADIUS_PX: Record<UserPreferences['borderRadius'], string> = {
  none: '0px',
  sm: '6px',
  md: '10px',
  lg: '16px',
  full: '9999px',
};

function resolveDark(theme: UserPreferences['theme']): boolean {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  return theme === 'dark';
}

/**
 * Aplica las preferencias del usuario a las variables CSS y clases del root.
 * Al ser variables CSS, el tema cambia en runtime sin recargar ni recompilar.
 */
export function applyPreferences(prefs: UserPreferences): void {
  const root = document.documentElement;
  root.classList.toggle('dark', resolveDark(prefs.theme));
  root.style.setProperty('--color-accent', hexToRgbTriplet(prefs.accentColor));
  root.style.setProperty('--color-secondary', hexToRgbTriplet(prefs.secondaryColor));
  root.style.setProperty('--font-sans', `'${prefs.fontFamily}', system-ui, sans-serif`);
  root.style.setProperty('--radius-base', RADIUS_PX[prefs.borderRadius]);
  root.dataset.density = prefs.density;
  root.classList.toggle('no-animations', !prefs.animationsEnabled);
}
