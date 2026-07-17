import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['selector', '[data-theme="dark"]'],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        indigo: '#3B4CCA',
        cyan: '#22C0DE',
        ink: 'var(--ink)',
        slate: 'var(--slate)',
        mist: 'var(--mist)',
        surface: 'var(--surface)',
        line: 'var(--line)',
        danger: '#DC2626',
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      borderRadius: {
        card: '18px',
        control: '10px',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(15,23,41,0.04), 0 12px 32px rgba(15,23,41,0.06)',
      },
    },
  },
  plugins: [],
};

export default config;
