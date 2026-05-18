import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--color-bg)',
        'bg-secondary': 'var(--color-bg-secondary)',
        text: 'var(--color-text)',
        'text-muted': 'var(--color-text-muted)',
        border: 'var(--color-border)',
        safe: 'var(--color-safe)',
        warning: 'var(--color-warning)',
        danger: 'var(--color-danger)',
        overdue: 'var(--color-overdue)',
        navy: 'var(--color-navy)',
        blue: 'var(--color-blue)',
      },
    },
  },
  plugins: [],
};

export default config;
