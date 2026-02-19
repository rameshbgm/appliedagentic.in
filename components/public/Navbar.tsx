'use client'
// components/public/Navbar.tsx
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X, Search, Zap, ChevronDown } from 'lucide-react'
import { useTheme } from '@/components/shared/ThemeProvider'
import { Sun, Moon } from 'lucide-react'

interface Module {
  id: number
  name: string
  slug: string
  icon?: string | null
  color?: string | null
  description?: string | null
}

interface Props {
  modules?: Module[]
}

export default function Navbar({ modules = [] }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [megaOpen, setMegaOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled ? 'py-3 shadow-2xl' : 'py-5'
      }`}
      style={{
        background: scrolled ? 'rgba(var(--bg-primary-rgb, 10,10,20), 0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--bg-border)' : 'none',
      }}
    >
      <div className="container mx-auto px-4 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: 'linear-gradient(135deg, #6C3DFF, #00D4FF)' }}
          >
            <Zap size={18} className="text-white" />
          </div>
          <span className="font-display font-bold text-sm leading-tight hidden sm:block" style={{ color: 'var(--text-primary)' }}>
            Applied<br />Agentic<span className="text-violet-400">.</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-6">
          <div
            className="relative"
            onMouseEnter={() => setMegaOpen(true)}
            onMouseLeave={() => setMegaOpen(false)}
          >
            <button className="flex items-center gap-1.5 text-sm font-medium transition-colors" style={{ color: 'var(--text-secondary)' }}>
              Modules <ChevronDown size={14} className={`transition-transform ${megaOpen ? 'rotate-180' : ''}`} />
            </button>
            {/* Mega menu */}
            {megaOpen && modules.length > 0 && (
              <div
                className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[640px] rounded-2xl shadow-2xl p-5 grid grid-cols-2 gap-3"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--bg-border)' }}
              >
                {modules.map((m) => (
                  <Link
                    key={m.id}
                    href={`/modules/${m.slug}`}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group"
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 mt-0.5"
                      style={{ background: (m.color ?? '#6C3DFF') + '20' }}
                    >
                      {m.icon ?? '📚'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold group-hover:text-violet-400 transition-colors" style={{ color: 'var(--text-primary)' }}>
                        {m.name}
                      </p>
                      {m.description && (
                        <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                          {m.description}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
          <Link href="/articles" className="text-sm font-medium hover:text-violet-400 transition-colors" style={{ color: 'var(--text-secondary)' }}>
            Articles
          </Link>
          <Link href="/search" className="text-sm font-medium hover:text-violet-400 transition-colors" style={{ color: 'var(--text-secondary)' }}>
            Search
          </Link>
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <Link
            href="/search"
            className="p-2 rounded-xl border transition-colors hover:bg-white/5"
            style={{ borderColor: 'var(--bg-border)', color: 'var(--text-secondary)' }}
          >
            <Search size={16} />
          </Link>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border transition-colors hover:bg-white/5"
            style={{ borderColor: 'var(--bg-border)', color: 'var(--text-secondary)' }}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="lg:hidden p-2 rounded-xl border"
            style={{ borderColor: 'var(--bg-border)', color: 'var(--text-secondary)' }}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="lg:hidden absolute top-full left-0 right-0 shadow-2xl"
          style={{ background: 'var(--bg-elevated)', borderTop: '1px solid var(--bg-border)' }}
        >
          <nav className="p-4 space-y-2">
            {modules.map((m) => (
              <Link
                key={m.id}
                href={`/modules/${m.slug}`}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors"
              >
                <span>{m.icon}</span>
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{m.name}</span>
              </Link>
            ))}
            <div className="border-t pt-2 mt-2" style={{ borderColor: 'var(--bg-border)' }}>
              <Link href="/articles" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 text-sm rounded-xl hover:bg-white/5" style={{ color: 'var(--text-secondary)' }}>Articles</Link>
              <Link href="/search" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 text-sm rounded-xl hover:bg-white/5" style={{ color: 'var(--text-secondary)' }}>Search</Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
