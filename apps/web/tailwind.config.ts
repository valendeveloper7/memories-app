import type { Config } from 'tailwindcss';

/**
 * Los colores de marca se exponen como variables CSS (definidas en index.css)
 * para que la personalización por usuario —color de acento, etc.— pueda
 * cambiarlas en runtime sin recompilar Tailwind.
 */
const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        accent: 'rgb(var(--color-accent) / <alpha-value>)',
        secondary: 'rgb(var(--color-secondary) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
