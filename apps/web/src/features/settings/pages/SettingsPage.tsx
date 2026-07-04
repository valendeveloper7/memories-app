import type { ThemeMode, UserPreferences } from 'shared';
import { DEFAULT_USER_PREFERENCES } from 'shared';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useUpdatePreferences } from '../hooks/usePreferences';

const FONTS = ['Inter', 'system-ui', 'Georgia', 'Poppins', 'Nunito'];

export function SettingsPage() {
  const prefs = useAuthStore((s) => s.user?.preferences) ?? DEFAULT_USER_PREFERENCES;
  const update = useUpdatePreferences();

  function set<K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) {
    update.mutate({ [key]: value });
  }

  return (
    <div className="max-w-xl">
      <h1 className="mb-6 text-2xl font-bold text-neutral-900 dark:text-neutral-100">Ajustes</h1>

      <div className="space-y-6">
        <Section title="Tema">
          <div className="flex gap-2">
            {(['light', 'dark', 'system'] as ThemeMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => set('theme', mode)}
                className={`flex-1 rounded-xl border px-4 py-2 text-sm font-medium capitalize transition-colors ${
                  prefs.theme === mode
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-neutral-200 text-neutral-600 dark:border-neutral-700 dark:text-neutral-300'
                }`}
              >
                {mode === 'light' ? 'Claro' : mode === 'dark' ? 'Oscuro' : 'Sistema'}
              </button>
            ))}
          </div>
        </Section>

        <Section title="Colores">
          <div className="flex gap-6">
            <ColorField
              label="Principal"
              value={prefs.accentColor}
              onChange={(v) => set('accentColor', v)}
            />
            <ColorField
              label="Secundario"
              value={prefs.secondaryColor}
              onChange={(v) => set('secondaryColor', v)}
            />
          </div>
        </Section>

        <Section title="Tipografía">
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

        <Section title="Bordes">
          <select
            value={prefs.borderRadius}
            onChange={(e) => set('borderRadius', e.target.value as UserPreferences['borderRadius'])}
            className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          >
            <option value="none">Rectos</option>
            <option value="sm">Suaves</option>
            <option value="md">Medios</option>
            <option value="lg">Redondeados</option>
            <option value="full">Muy redondeados</option>
          </select>
        </Section>

        <Section title="Densidad">
          <select
            value={prefs.density}
            onChange={(e) => set('density', e.target.value as UserPreferences['density'])}
            className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          >
            <option value="compact">Compacta</option>
            <option value="comfortable">Cómoda</option>
            <option value="spacious">Espaciosa</option>
          </select>
        </Section>

        <Section title="Animaciones">
          <label className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-300">
            <input
              type="checkbox"
              checked={prefs.animationsEnabled}
              onChange={(e) => set('animationsEnabled', e.target.checked)}
              className="h-4 w-4 accent-accent"
            />
            Activar microanimaciones
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
