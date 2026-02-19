'use client'
// components/public/Navbar.tsx
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X, Search, Zap, ChevronDown, Sun, Moon } from 'lucide-react'
import { useTheme } from '@/components/shared/ThemeProvider'

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
  const [megaOpen, setMegaOpen]     = useState(false)
  const [scrolled, setScrolled]     = useState(false)
  const { theme, toggleTheme }      = useTheme()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const closeMobile = () => setMobileOpen(false)

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled ? 'py-2.5' : 'py-4'}`}
      style={scrolled
        ? { background: '#0B0B1E', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid var(--bg-border)' }
        : { background: 'transparent' }
      }
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105"
            style={{ background: 'linear-gradient(135deg,#7C3AED,#06B6D4)' }}>
            <Zap size={15} className="text-white" />
          </div>
          <span className="hidden sm:block text-sm font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
            Applied<br /><span style={{ color: 'var(--violet-light)' }}>Agentic</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-5">
          <div className="relative" onMouseEnter={() => setMegaOpen(true)} onMouseLeave={() => setMegaOpen(false)}>
            <button className="flex items-center gap-1 text-[13px] font-medium transition-colors hover:text-white" style={{ color: 'var(--text-secondary)' }}>
              Modules
              <ChevronDown size={13} className={`transition-transform duration-200 ${megaOpen ? 'rotate-180' : ''}`} />
            </button>
            {megaOpen && modules.length > 0 && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2.5 w-[580px] rounded-2xl p-4 grid grid-cols-2 gap-2 shadow-2xl"
                style={{ background: '#0F0F24', border: '1px solid var(--bg-border)' }}>
                {modules.map((m) => (
                  <Link key={m.id} href={`/modules/${m.slug}`}
                    className="flex items-start gap-3 p-2.5 rounded-xl transition-colors hover:bg-white/5 group/item">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 mt-0.5"
                      style={{ background: (m.color ?? '#7C3AED') + '25' }}>
                      {m.icon ?? '📚'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold group-hover/item:text-violet-400 transition-colors leading-snug" style={{ color: 'var(--text-primary)' }}>
                        {m.name}
                      </p>
                      {m.description && (
                        <p className="text-[11px] mt-0.5 line-clamp-1" style={{ color: 'var(--text-muted)' }}>{m.description}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
          <Link href="/articles" className="text-[13px] font-medium transition-colors hover:text-white" style={{ color: 'var(--text-secondary)' }}>Articles</Link>
          <Link href="/search"   className="text-[13px] font-medium transition-colors hover:text-white" style={{ color: 'var(--text-secondary)' }}>Search</Link>
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-1.5">
          <Link href="/search" aria-label="Search" className="p-2 rounded-lg transition-colors hover:bg-white/5" style={{ color: 'var(--text-secondary)' }}>
            <Search size={16} />
          </Link>
          <button onClick={toggleTheme} aria-label="Toggle theme" className="p-2 rounded-lg transition-colors hover:bg-white/5" style={{ color: 'var(--text-secondary)' }}>
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button onClick={() => setMobileOpen((v) => !v)} aria-label="Toggle menu"
            className="lg:hidden p-2 rounded-lg transition-colors hover:bg-white/5" style={{ color: 'var(--text-secondary)' }}>
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t mt-1" style={{ background: '#0B0B1E', borderColor: 'var(--bg-border)' }}>
          <nav className="max-w-7xl mx-auto px-4 py-4 space-y-1">
            {modules.map((m) => (
              <Link key={m.id} href={`/modules/${m.slug}`} onClick={closeMobile}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors hover:bg-white/5">
                <span className="text-base">{m.icon ?? '📚'}</span>
                <span className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>{m.name}</span>
              </Link>
            ))}
            <div className="border-t pt-2 mt-2 space-y-0.5" style={{ borderColor: 'var(--bg-border)' }}>
              <Link href="/articles" onClick={closeMobile} className="block px-3 py-2.5 text-[13px] rounded-xl transition-colors hover:bg-white/5" style={{ color: 'var(--text-secondary)' }}>Articles</Link>
              <Link href="/search"   onClick={closeMobile} className="block px-3 py-2.5 text-[13px] rounded-xl transition-colors hover:bg-white/5" style={{ color: 'var(--text-secondary)' }}>Search</Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
