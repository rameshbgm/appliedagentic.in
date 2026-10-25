'use client'
// components/aurora/AuroraShell.tsx
// Site chrome: a floating glass capsule header, a thumb-reach dock with a
// glowing search orb on phones, the full-screen Paths overlay (every module and
// chapter), quick search and the theme switch. Chrome tucks away while reading.
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { BookMarked, Compass, Home, Moon, Search, Sun, X } from 'lucide-react'
import QuickSearch from './QuickSearch'
import Sky, { StarMark } from './Sky'
import { useTheme } from '@/components/shared/ThemeProvider'
import { getBookmarks, LIBRARY_EVENT } from '@/lib/library'
import type { ShellLine } from '@/lib/catalog'

interface Props {
  lines: ShellLine[]
}

export default function AuroraShell({ lines }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [paths, setPaths] = useState(false)
  const [search, setSearch] = useState(false)
  const [saved, setSaved] = useState(0)
  const [hidden, setHidden] = useState(false)
  const [mounted, setMounted] = useState(false)
  const lastY = useRef(0)

  useEffect(() => { setMounted(true) }, [])

  // Close overlays on navigation
  useEffect(() => { setPaths(false); setSearch(false); setHidden(false) }, [pathname])

  // Library count badge
  useEffect(() => {
    const sync = () => setSaved(getBookmarks().length)
    sync()
    window.addEventListener(LIBRARY_EVENT, sync)
    window.addEventListener('storage', sync)
    return () => { window.removeEventListener(LIBRARY_EVENT, sync); window.removeEventListener('storage', sync) }
  }, [])

  // Hide the chrome while scrolling down, bring it back on any upward scroll
  useEffect(() => {
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const y = window.scrollY
        if (Math.abs(y - lastY.current) > 6) {
          setHidden(y > lastY.current && y > 240)
          lastY.current = y
        }
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf) }
  }, [])

  // Keyboard: "/" or Cmd/Ctrl+K opens search, Escape closes overlays
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(el?.tagName ?? '') || el?.isContentEditable
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setSearch(true); return }
      if (e.key === '/' && !typing) { e.preventDefault(); setSearch(true); return }
      if (e.key === 'Escape') { setPaths(false); setSearch(false) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    document.body.style.overflow = paths ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [paths])

  // Let the reader's navigator follow the chrome
  useEffect(() => {
    document.documentElement.toggleAttribute('data-chrome-hidden', hidden)
  }, [hidden])

  const isLight = theme === 'light'
  const toggleTheme = () => setTheme(isLight ? 'dark' : 'light')
  const onArticle = pathname.startsWith('/articles/')
  const here = (href: string) => (pathname === href ? 'page' : undefined)

  return (
    <>
      <Sky />
      <header className={`a-top${hidden && onArticle ? ' is-hidden' : ''}`}>
        <div className="a-wrap">
          <div className="a-top__row a-glass">
            <Link href="/" className="a-logo" aria-label="Applied Agentic, home">
              <span className="a-logo__star"><StarMark /></span>
              <b>Applied Agentic</b>
            </Link>
            <nav className="a-nav" aria-label="Primary">
              <Link href="/" aria-current={here('/')}>Home</Link>
              <button type="button" onClick={() => setPaths(true)} aria-expanded={paths}>Paths</button>
              <Link href="/library" aria-current={here('/library')}>
                Library{saved > 0 && <span className="a-tag" style={{ padding: '0 7px' }}>{saved}</span>}
              </Link>
            </nav>
            <button type="button" className="a-kbd" onClick={() => setSearch(true)} aria-label="Search">
              <Search size={16} /> Search <kbd>/</kbd>
            </button>
            {/* On phones the dock carries search and theme, except on articles */}
            {onArticle && <button type="button" className="a-icon a-mobile-only" onClick={() => setSearch(true)} aria-label="Search"><Search size={19} /></button>}
            <button type="button" className={`a-icon${onArticle ? '' : ' a-desktop-only'}`} onClick={toggleTheme} aria-label={isLight ? 'Switch to night' : 'Switch to daylight'}>
              {isLight ? <Moon size={19} /> : <Sun size={19} />}
            </button>
          </div>
        </div>
      </header>

      {/* Phone dock — hides on scroll down; articles use the reading navigator instead */}
      {!onArticle && (
        <nav className={`a-dock a-glass${hidden ? ' is-hidden' : ''}`} aria-label="Primary mobile">
          <Link href="/" aria-current={here('/')}><Home size={21} />Home</Link>
          <button type="button" onClick={() => setPaths(true)} aria-expanded={paths}><Compass size={21} />Paths</button>
          <button type="button" className="a-orb" onClick={() => setSearch(true)} aria-label="Search"><Search size={24} /></button>
          <Link href="/library" aria-current={here('/library')}>
            <BookMarked size={21} />Library{saved > 0 && <span className="count">{saved}</span>}
          </Link>
          <button type="button" onClick={toggleTheme} aria-label={isLight ? 'Switch to night' : 'Switch to daylight'}>
            {isLight ? <Moon size={21} /> : <Sun size={21} />}{isLight ? 'Night' : 'Day'}
          </button>
        </nav>
      )}

      {mounted && paths && createPortal(
        <>
          <div className="a-scrim" onClick={() => setPaths(false)} />
          <div className="a-paths" role="dialog" aria-modal="true" aria-label="Learning paths" onClick={(e) => { if (e.target === e.currentTarget) setPaths(false) }}>
            <div className="a-paths__inner">
              <div className="a-paths__head">
                <h2 className="a-display">Choose a <em>path</em></h2>
                <button type="button" className="a-icon a-glass" onClick={() => setPaths(false)} aria-label="Close paths"><X size={20} /></button>
              </div>
              {lines.length > 0 ? (
                <div className="a-paths__grid">
                  {lines.map((l, i) => (
                    <div key={l.id} className="a-paths__card a-glass" style={{ '--c': l.color, '--i': i } as React.CSSProperties}>
                      <span className="n">Path {String(l.number).padStart(2, '0')}</span>
                      <Link href={`/${l.slug}`} className="t">{l.title}</Link>
                      {l.zones.length > 0 && (
                        <div className="subs">
                          {l.zones.map((z) => <Link key={z.id} href={`/${l.slug}/${z.slug}`}>{z.title}</Link>)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="a-dek">The first paths are being written.</p>
              )}
            </div>
          </div>
        </>,
        document.body,
      )}

      {mounted && search && (
        <QuickSearch lines={lines} onClose={() => setSearch(false)} onSubmit={(q) => { setSearch(false); router.push(`/search?q=${encodeURIComponent(q)}`) }} />
      )}
    </>
  )
}
