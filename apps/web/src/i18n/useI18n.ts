import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LOCALES, translations, type Language } from './translations';

interface I18nState {
  language: Language;
  setLanguage: (language: Language) => void;
}

function detectLanguage(): Language {
  const nav = typeof navigator !== 'undefined' ? navigator.language.slice(0, 2) : 'es';
  if (nav === 'en' || nav === 'ja') return nav;
  return 'es';
}

/** Idioma actual persistido en localStorage (preferencia solo de UI). */
export const useI18nStore = create<I18nState>()(
  persist(
    (set) => ({
      language: detectLanguage(),
      setLanguage: (language) => set({ language }),
    }),
    { name: 'nosotros-language' },
  ),
);

type TParams = Record<string, string | number>;

/** Sustituye {placeholders} por sus valores en la cadena traducida. */
function interpolate(template: string, params?: TParams): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, key) => String(params[key] ?? `{${key}}`));
}

/**
 * Hook de traducción. Devuelve `t` (traduce por clave con interpolación),
 * el idioma actual, el setter y el `locale` para formatear fechas.
 */
export function useI18n() {
  const language = useI18nStore((s) => s.language);
  const setLanguage = useI18nStore((s) => s.setLanguage);

  const t = (key: string, params?: TParams): string => {
    const dict = translations[language];
    const value = dict[key] ?? translations.es[key] ?? key;
    return interpolate(value, params);
  };

  return { t, language, setLanguage, locale: LOCALES[language] };
}
