'use client'
// components/shared/ThemeProvider.tsx
// Light / dark theme. With no saved choice the site follows the OS setting
// (CSS handles that via prefers-color-scheme); a saved choice sets data-theme.
import { createContext, useCallback, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light'

const ThemeContext = createContext<{
  theme: Theme
  setTheme: (t: Theme) => void
  toggleTheme: () => void
}>({
  theme: 'light',
  setTheme: () => {},
  toggleTheme: () => {},
})

function readTheme(): Theme {
  const attr = document.documentElement.getAttribute('data-theme')
  if (attr === 'dark' || attr === 'light') return attr
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light')

  useEffect(() => {
    setThemeState(readTheme())
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => setThemeState(readTheme())
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t)
    document.documentElement.setAttribute('data-theme', t)
    try { localStorage.setItem('aa-theme', t) } catch { /* storage unavailable */ }
  }, [])

  const toggleTheme = useCallback(() => setTheme(readTheme() === 'dark' ? 'light' : 'dark'), [setTheme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
