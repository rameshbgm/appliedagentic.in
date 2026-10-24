'use client'
// components/pulse/PulseShell.tsx
// Site chrome: floating glass header (logo pill, desktop nav with a sliding
// highlight, search pill, theme + menu buttons), the floating pill tab bar on
// phones, the full-screen module menu and the quick-search dialog.
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { BookOpen, Home, LayoutGrid, Moon, Search, Sun, X } from 'lucide-react'
import QuickSearch from './QuickSearch'
import { useTheme } from '@/components/shared/ThemeProvider'
import type { ShellLine } from '@/lib/catalog'

interface Props {
  lines: ShellLine[]
}

interface LastRead {
  slug: string
  title: string
}

/** Positions an absolutely placed "blob" under the active item of a nav. */
function useBlob(navRef: React.RefObject<HTMLElement | null>, deps: unknown[]) {
  const [style, setStyle] = useState<React.CSSProperties>({ opacity: 0 })
  const measure = useCallback(() => {
    const nav = navRef.current
    const active = nav?.querySelector<HTMLElement>('[data-on="true"], [aria-current="page"]')
    if (!nav || !active) { setStyle({ opacity: 0 }); return }
    setStyle({ left: active.offsetLeft, width: active.offsetWidth, opacity: 1 })
  }, [navRef])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(measure, deps)
  useEffect(() => {
    window.addEventListener('resize', measure)
    document.fonts?.ready.then(measure).catch(() => {})
    return () => window.removeEventListener('resize', measure)
  }, [measure])
  return style
}

export default function PulseShell({ lines }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [lastRead, setLastRead] = useState<LastRead | null>(null)
  const deskRef = useRef<HTMLElement>(null)
  const pillRef = useRef<HTMLElement>(null)

  useEffect(() => {
    setMenuOpen(false)
    setSearchOpen(false)
    try {
      const raw = localStorage.getItem('aa-last-ride')
      setLastRead(raw ? JSON.parse(raw) : null)
    } catch { setLastRead(null) }
  }, [pathname])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(el?.tagName ?? '') || el?.isContentEditable
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setSearchOpen(true); return }
      if (e.key === '/' && !typing) { e.preventDefault(); setSearchOpen(true); return }
      if (e.key === 'Escape') { setMenuOpen(false); setSearchOpen(false) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const onModules = lines.some((l) => pathname === `/${l.slug}` || pathname.startsWith(`/${l.slug}/`))
  const onArticle = pathname.startsWith('/articles/')
  const section: 'home' | 'modules' | 'search' | 'read' | null =
    pathname === '/' ? 'home' : onModules ? 'modules' : pathname.startsWith('/search') ? 'search' : onArticle ? 'read' : null

  const deskBlob = useBlob(deskRef, [section, lines.length])
  const pillBlob = useBlob(pillRef, [section, menuOpen, searchOpen, lastRead?.slug])
  const firstModule = lines[0]
  const readHref = lastRead ? `/articles/${lastRead.slug}` : firstModule ? `/${firstModule.slug}` : '/search'

  return (
    <>
      <header className="p-top">
        <div className="p-wrap p-top__row">
          <Link href="/" className="p-mark" aria-label="Applied Agentic home">
            <span className="p-mark__dot" aria-hidden="true" />
            <b>Applied Agentic</b>
          </Link>

          <nav className="p-desknav" ref={deskRef} aria-label="Primary">
            <span className="p-blob" style={deskBlob} aria-hidden="true" />
            <Link href="/" aria-current={section === 'home' ? 'page' : undefined}>Home</Link>
            {firstModule && <Link href={`/${firstModule.slug}`} aria-current={section === 'modules' ? 'page' : undefined}>Modules</Link>}
            <Link href="/search" aria-current={section === 'search' ? 'page' : undefined}>Library</Link>
            {lastRead && <Link href={readHref} aria-current={section === 'read' ? 'page' : undefined}>Keep reading</Link>}
          </nav>

          <button type="button" className="p-searchpill" onClick={() => setSearchOpen(true)}>
            <Search size={17} /> Search lessons <kbd>/</kbd>
          </button>
          <button type="button" className="p-round p-mobile-only" onClick={() => setSearchOpen(true)} aria-label="Search">
            <Search size={18} />
          </button>
          <button
            type="button"
            className="p-round"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            title={theme === 'dark' ? 'Light theme' : 'Dark theme'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button type="button" className="p-round p-round--ink" onClick={() => setMenuOpen(true)} aria-label="Open all modules" aria-expanded={menuOpen}>
            <LayoutGrid size={18} />
          </button>
        </div>
      </header>

      {/* Floating pill tab bar (phones; on desktop it only appears in reading mode) */}
      <nav className="p-pillnav" ref={pillRef} aria-label="Primary mobile">
        <span className="p-blob" style={pillBlob} aria-hidden="true" />
        <Link href="/" className="mob" data-on={section === 'home' && !menuOpen && !searchOpen} aria-current={section === 'home' ? 'page' : undefined}>
          <Home size={20} /><span className="t">Home</span>
        </Link>
        <button type="button" className="mob rd-hide" data-on={menuOpen || (section === 'modules' && !searchOpen)} onClick={() => setMenuOpen(true)}>
          <LayoutGrid size={20} /><span className="t">Modules</span>
        </button>
        <button type="button" className="mob rd-hide" data-on={searchOpen || (section === 'search' && !menuOpen)} onClick={() => setSearchOpen(true)}>
          <Search size={20} /><span className="t">Search</span>
        </button>
        <Link href={readHref} className="mob rd-hide" data-on={section === 'read' && !menuOpen && !searchOpen} title={lastRead?.title}>
          <BookOpen size={20} /><span className="t">{lastRead ? 'Reading' : 'Start'}</span>
        </Link>
        {/* Reader controls are portalled in here by the article page */}
        <span id="p-pill-slot" style={{ display: 'contents' }} />
      </nav>

      {menuOpen && (
        <div className="p-menu" role="dialog" aria-modal="true" aria-label="All modules">
          <div className="p-menu__row">
            <span className="p-label">All modules · {lines.length}</span>
            <button type="button" className="p-round" onClick={() => setMenuOpen(false)} aria-label="Close modules">
              <X size={20} />
            </button>
          </div>
          {lines.length > 0 ? (
            <ol>
              {lines.map((l, i) => (
                <li key={l.id} style={{ '--i': i, '--c': l.color, '--fg': l.fg } as React.CSSProperties}>
                  <Link href={`/${l.slug}`}>
                    <small>{String(l.number).padStart(2, '0')}</small>{l.title}
                  </Link>
                  {l.zones.length > 0 && (
                    <div className="p-menu__subs">
                      {l.zones.map((z) => <Link key={z.id} href={`/${l.slug}/${z.slug}`}>{z.title}</Link>)}
                    </div>
                  )}
                </li>
              ))}
            </ol>
          ) : (
            <p style={{ marginTop: 24, opacity: .7 }}>Modules are on their way. Check back soon.</p>
          )}
          <div className="p-menu__foot">
            <Link href="/search" className="p-btn p-btn--sm">Search the library</Link>
            <button type="button" className="p-btn p-btn--sm" onClick={toggleTheme}>{theme === 'dark' ? 'Light theme' : 'Dark theme'}</button>
          </div>
        </div>
      )}

      {searchOpen && (
        <QuickSearch
          lines={lines}
          onClose={() => setSearchOpen(false)}
          onSubmit={(q) => { setSearchOpen(false); router.push(`/search?q=${encodeURIComponent(q)}`) }}
        />
      )}
    </>
  )
}
