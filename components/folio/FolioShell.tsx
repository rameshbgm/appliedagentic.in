'use client'
// components/folio/FolioShell.tsx
// Site chrome: a quiet masthead that tucks away while you read, the Contents
// drawer (the whole course as a book's contents page), search, the reader's
// library count, and a thumb-reach toolbar on phones.
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { BookMarked, BookOpen, Home, Moon, Search, Sun, X, AlignLeft } from 'lucide-react'
import QuickSearch from './QuickSearch'
import { useTheme } from '@/components/shared/ThemeProvider'
import { getBookmarks, LIBRARY_EVENT } from '@/lib/library'
import { toRoman, type ShellLine } from '@/lib/catalog'

interface Props {
  lines: ShellLine[]
}

export default function FolioShell({ lines }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [drawer, setDrawer] = useState(false)
  const [search, setSearch] = useState(false)
  const [saved, setSaved] = useState(0)
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)
  const lastY = useRef(0)

  useEffect(() => { setMounted(true) }, [])

  // Close overlays on navigation
  useEffect(() => { setDrawer(false); setSearch(false); setHidden(false) }, [pathname])

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
        setScrolled(y > 8)
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
      if (e.key === 'Escape') { setDrawer(false); setSearch(false) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    document.body.style.overflow = drawer ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [drawer])

  // Let other components (the reader toolbar) ask the shell to show/hide
  useEffect(() => {
    document.documentElement.toggleAttribute('data-chrome-hidden', hidden)
  }, [hidden])

  const isDark = theme === 'dark'
  const toggleTheme = () => setTheme(isDark ? 'light' : 'dark')
  const onArticle = pathname.startsWith('/articles/')

  return (
    <>
      <header className={`f-top${scrolled ? ' is-scrolled' : ''}${hidden && onArticle ? ' is-hidden' : ''}`}>
        <div className="f-wrap f-top__row">
          <div className="f-top__left">
            <button type="button" className="f-contents-btn" onClick={() => setDrawer(true)} aria-expanded={drawer} aria-label="Open contents">
              <AlignLeft size={20} /><span className="lbl">Contents</span>
            </button>
            <nav className="f-top__nav" aria-label="Primary">
              <Link href="/library" aria-current={pathname === '/library' ? 'page' : undefined}>Library</Link>
            </nav>
          </div>
          <Link href="/" className="f-masthead" aria-label="Applied Agentic, front page">
            <b>Applied Agentic</b>
            <span>A reading room for agentic AI</span>
          </Link>
          <div className="f-top__right">
            <button type="button" className="f-icon" onClick={() => setSearch(true)} aria-label="Search"><Search size={19} /></button>
            <Link href="/library" className="f-icon f-desktop-only" aria-label={`Your library, ${saved} saved`}>
              <BookMarked size={19} />{saved > 0 && <span className="count">{saved}</span>}
            </Link>
            <button type="button" className="f-icon" onClick={toggleTheme} aria-label={isDark ? 'Switch to paper theme' : 'Switch to night theme'}>
              {isDark ? <Sun size={19} /> : <Moon size={19} />}
            </button>
          </div>
        </div>
      </header>

      {/* Phone toolbar — hides on scroll down; articles use the reading toolbar instead */}
      {!onArticle && <nav className={`f-bar${hidden ? ' is-hidden' : ''}`} aria-label="Primary mobile">
        <Link href="/" aria-current={pathname === '/' ? 'page' : undefined}><Home size={21} />Front</Link>
        <button type="button" onClick={() => setDrawer(true)} aria-expanded={drawer}><BookOpen size={21} />Contents</button>
        <button type="button" onClick={() => setSearch(true)} aria-expanded={search}><Search size={21} />Search</button>
        <Link href="/library" aria-current={pathname === '/library' ? 'page' : undefined}>
          <BookMarked size={21} />Library{saved > 0 && <span className="count">{saved}</span>}
        </Link>
      </nav>}

      {mounted && drawer && createPortal(
        <>
          <div className="f-scrim" onClick={() => setDrawer(false)} />
          <aside className="f-drawer" role="dialog" aria-modal="true" aria-label="Contents">
            <div className="f-drawer__head">
              <h2 className="f-display">Contents</h2>
              <button type="button" className="f-icon" onClick={() => setDrawer(false)} aria-label="Close contents"><X size={20} /></button>
            </div>
            {lines.length > 0 ? (
              <ol>
                {lines.map((l, i) => (
                  <li key={l.id} className="mod" style={{ '--c': l.color, '--i': i } as React.CSSProperties}>
                    <Link href={`/${l.slug}`}>
                      <span className="num">{toRoman(l.number)}.</span>
                      <span className="ttl">{l.title}</span>
                    </Link>
                    {l.zones.length > 0 && (
                      <ul className="subs">
                        {l.zones.map((z) => <li key={z.id}><Link href={`/${l.slug}/${z.slug}`}>{z.title}</Link></li>)}
                      </ul>
                    )}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="f-dek" style={{ marginTop: 16 }}>The first chapters are being written.</p>
            )}
            <div className="f-ctas" style={{ marginTop: 'auto', paddingTop: 24 }}>
              <Link href="/library" className="f-btn f-btn--quiet f-btn--sm"><BookMarked size={16} /> Your library</Link>
              <button type="button" className="f-btn f-btn--quiet f-btn--sm" onClick={toggleTheme}>{isDark ? 'Paper theme' : 'Night theme'}</button>
            </div>
          </aside>
        </>,
        document.body,
      )}

      {mounted && search && (
        <QuickSearch lines={lines} onClose={() => setSearch(false)} onSubmit={(q) => { setSearch(false); router.push(`/search?q=${encodeURIComponent(q)}`) }} />
      )}
    </>
  )
}
