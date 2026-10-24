import type { Config } from 'tailwindcss'

// Agentic Transit — Tailwind maps onto the CSS tokens in styles/globals.css,
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
        paper: 'var(--paper)',
        'paper-2': 'var(--paper-2)',
        card: 'var(--card)',
        ink: 'var(--ink)',
        'ink-2': 'var(--ink-2)',
        muted: 'var(--muted)',
        rule: 'var(--rule)',
        notice: 'var(--notice)',
        primary: 'var(--ink)',
        secondary: 'var(--ink-2)',
        accent: 'var(--l1)',
        gold: 'var(--notice)',
        surface: 'var(--card)',
        elevated: 'var(--paper-2)',
        border: 'var(--rule)',
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
