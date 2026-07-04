/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'rgb(var(--background) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        'surface-alt': 'rgb(var(--surface-alt) / <alpha-value>)',
        border: 'rgb(var(--border) / <alpha-value>)',
        'text-primary': 'rgb(var(--text-primary) / <alpha-value>)',
        'text-secondary': 'rgb(var(--text-secondary) / <alpha-value>)',
        'text-muted': 'rgb(var(--text-muted) / <alpha-value>)',
        accent: {
          DEFAULT: 'rgb(var(--accent) / <alpha-value>)',
          hover: 'rgb(var(--accent-hover) / <alpha-value>)',
          light: 'rgb(var(--accent-light) / <alpha-value>)',
        },
        gold: {
          DEFAULT: 'rgb(var(--gold) / <alpha-value>)',
          light: 'rgb(var(--gold-light) / <alpha-value>)',
        },
        mastery: {
          0: 'rgb(var(--level-0) / <alpha-value>)',
          1: 'rgb(var(--level-1) / <alpha-value>)',
          2: 'rgb(var(--level-2) / <alpha-value>)',
          3: 'rgb(var(--level-3) / <alpha-value>)',
          4: 'rgb(var(--level-4) / <alpha-value>)',
          5: 'rgb(var(--level-5) / <alpha-value>)',
          forgotten: 'rgb(var(--forgotten) / <alpha-value>)',
        },
        day: {
          complete: 'rgb(var(--day-complete) / <alpha-value>)',
          partial: 'rgb(var(--day-partial) / <alpha-value>)',
          missed: 'rgb(var(--day-missed) / <alpha-value>)',
          rest: 'rgb(var(--day-rest) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
        arabic: ['var(--font-arabic)', 'serif'],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
      },
    },
  },
  plugins: [],
};
