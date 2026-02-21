import type { Config } from 'tailwindcss'

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
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1440px',
      },
      colors: {
        primary: '#AAFF00',
        secondary: '#CCFF66',
        accent: '#FF6B6B',
        gold: '#FFD93D',
        surface: '#0A0A0A',
        elevated: '#111111',
        border: '#222222',
        module: {
          1: '#AAFF00',
          2: '#CCFF66',
          3: '#FF6B6B',
          4: '#FFD93D',
          5: '#4ECDC4',
          6: '#FF9F43',
          7: '#D4FF6B',
          8: '#55EFC4',
        },
      },
      fontFamily: {
        display: ['Inter', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        code: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'gradient-shift': 'gradient-shift 8s ease infinite',
        'float': 'float 6s ease-in-out infinite',
        'count-up': 'count-up 2s ease-out forwards',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'slide-in-up': 'slide-in-up 0.5s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
      },
      keyframes: {
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(170, 255, 0, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(170, 255, 0, 0.7)' },
        },
        'slide-in-up': {
          '0%': { transform: 'translateY(40px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
      typography: {
        DEFAULT: {
          css: {
            '--tw-prose-body': 'var(--text-primary)',
            '--tw-prose-headings': 'var(--text-primary)',
            '--tw-prose-links': '#AAFF00',
            '--tw-prose-code': '#CCFF66',
            '--tw-prose-pre-bg': '#111111',
            maxWidth: '100%',
          },
        },
      },
    },
  },
}

export default config
