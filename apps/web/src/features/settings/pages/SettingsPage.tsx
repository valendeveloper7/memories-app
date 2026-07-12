import type { ThemeMode, UserPreferences } from 'shared';
import { DEFAULT_USER_PREFERENCES } from 'shared';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useI18n } from '@/i18n/useI18n';
import { LANGUAGES } from '@/i18n/translations';
import { useUpdatePreferences } from '../hooks/usePreferences';

const FONTS = ['Inter', 'system-ui', 'Georgia', 'Poppins', 'Nunito'];

export function SettingsPage() {
  const prefs = useAuthStore((s) => s.user?.preferences) ?? DEFAULT_USER_PREFERENCES;
  const update = useUpdatePreferences();
  const { t, language, setLanguage } = useI18n();

  function set<K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) {
    update.mutate({ [key]: value });
  }

  return (
    <div className="max-w-xl">
      <h1 className="mb-6 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
        {t('settings.title')}
      </h1>

      <div className="space-y-6">
        <Section title={t('settings.language')}>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as (typeof LANGUAGES)[number]['code'])}
            className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.label}
              </option>
            ))}
          </select>
        </Section>

        <Section title={t('settings.theme')}>
          <div className="flex gap-2">
            {(['light', 'dark', 'system'] as ThemeMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => set('theme', mode)}
                className={`flex-1 rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
                  prefs.theme === mode
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-neutral-200 text-neutral-600 dark:border-neutral-700 dark:text-neutral-300'
                }`}
              >
                {mode === 'light'
                  ? t('settings.light')
                  : mode === 'dark'
                    ? t('settings.dark')
                    : t('settings.system')}
              </button>
            ))}
          </div>
        </Section>

        <Section title={t('settings.colors')}>
          <div className="flex gap-6">
            <ColorField
              label={t('settings.primary')}
              value={prefs.accentColor}
              onChange={(v) => set('accentColor', v)}
            />
            <ColorField
              label={t('settings.secondary')}
              value={prefs.secondaryColor}
              onChange={(v) => set('secondaryColor', v)}
            />
          </div>
        </Section>

        <Section title={t('settings.typography')}>
          <select
            value={prefs.fontFamily}
            onChange={(e) => set('fontFamily', e.target.value)}
            className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          >
            {FONTS.map((font) => (
              <option key={font} value={font}>
                {font}
              </option>
            ))}
          </select>
        </Section>

        <Section title={t('settings.borders')}>
          <select
            value={prefs.borderRadius}
            onChange={(e) => set('borderRadius', e.target.value as UserPreferences['borderRadius'])}
            className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          >
            <option value="none">{t('settings.radiusNone')}</option>
            <option value="sm">{t('settings.radiusSm')}</option>
            <option value="md">{t('settings.radiusMd')}</option>
            <option value="lg">{t('settings.radiusLg')}</option>
            <option value="full">{t('settings.radiusFull')}</option>
          </select>
        </Section>

        <Section title={t('settings.density')}>
          <select
            value={prefs.density}
            onChange={(e) => set('density', e.target.value as UserPreferences['density'])}
            className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          >
            <option value="compact">{t('settings.densityCompact')}</option>
            <option value="comfortable">{t('settings.densityComfortable')}</option>
            <option value="spacious">{t('settings.densitySpacious')}</option>
          </select>
        </Section>

        <Section title={t('settings.animations')}>
          <label className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-300">
            <input
              type="checkbox"
              checked={prefs.animationsEnabled}
              onChange={(e) => set('animationsEnabled', e.target.checked)}
              className="h-4 w-4 accent-accent"
            />
            {t('settings.enableAnimations')}
          </label>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-neutral-200/70 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <h2 className="mb-3 text-sm font-semibold text-neutral-700 dark:text-neutral-300">{title}</h2>
      {children}
    </section>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-9 cursor-pointer rounded-lg border border-neutral-200 dark:border-neutral-700"
      />
      {label}
    </label>
  );
}
