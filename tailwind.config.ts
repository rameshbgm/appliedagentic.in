import type { Config } from 'tailwindcss'

// Agentic Pulse — Tailwind maps onto the CSS tokens in styles/globals.css,
// so utility classes follow light/dark automatically.
const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      screens: {
        xs: '375px',
      },
      colors: {
        cobalt: 'var(--cobalt)',
        tomato: 'var(--tomato)',
        sun: 'var(--sun)',
        mint: 'var(--mint)',
        violet: 'var(--violet)',
        pink: 'var(--pink)',
        paper: 'var(--bg)',
        'paper-2': 'var(--bg-2)',
        card: 'var(--surface)',
        ink: 'var(--ink)',
        'ink-2': 'var(--ink-2)',
        muted: 'var(--muted)',
        rule: 'var(--line)',
        notice: 'var(--sun)',
        primary: 'var(--ink)',
        secondary: 'var(--ink-2)',
        accent: 'var(--tomato)',
        gold: 'var(--sun)',
        surface: 'var(--surface)',
        elevated: 'var(--bg-2)',
        border: 'var(--line)',
        line: {
          1: 'var(--l1)',
          2: 'var(--l2)',
          3: 'var(--l3)',
          4: 'var(--l4)',
          5: 'var(--l5)',
          6: 'var(--l6)',
          7: 'var(--l7)',
          8: 'var(--l8)',
        },
        module: {
          1: 'var(--l1)',
          2: 'var(--l2)',
          3: 'var(--l3)',
          4: 'var(--l4)',
          5: 'var(--l5)',
          6: 'var(--l6)',
          7: 'var(--l7)',
          8: 'var(--l8)',
        },
      },
      fontFamily: {
        display: ['var(--display)'],
        body: ['var(--body)'],
        code: ['var(--mono)'],
        mono: ['var(--mono)'],
        sans: ['var(--body)'],
      },
    },
  },
}

export default config
