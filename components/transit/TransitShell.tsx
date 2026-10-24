'use client'
// components/transit/TransitShell.tsx
// Site chrome: sticky top bar (desktop line links + search + theme),
// thumb-zone dock on mobile, the all-lines sheet and the quick-search dialog.
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronDown, Moon, Route, Search, Sun, X, BookOpenText, Map as MapIcon } from 'lucide-react'
import BrandMark from './BrandMark'
import LineList from './LineList'
import QuickSearch from './QuickSearch'
import { useTheme } from '@/components/shared/ThemeProvider'
import type { ShellLine } from '@/lib/transit'

interface Props {
  lines: ShellLine[]
}

interface LastRide {
  slug: string
  title: string
}

const MAX_TOP_LINES = 3

export default function TransitShell({ lines }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()
  const [panelOpen, setPanelOpen] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [lastRide, setLastRide] = useState<LastRide | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  // Close everything on navigation
  useEffect(() => {
    setPanelOpen(false)
    setSheetOpen(false)
    setSearchOpen(false)
    try {
      const raw = localStorage.getItem('aa-last-ride')
      setLastRide(raw ? JSON.parse(raw) : null)
    } catch { setLastRide(null) }
  }, [pathname])

  // Keyboard: "/" or Cmd/Ctrl+K opens search, Escape closes overlays
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test((e.target as HTMLElement)?.tagName ?? '') || (e.target as HTMLElement)?.isContentEditable
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setSearchOpen(true); return }
      if (e.key === '/' && !typing) { e.preventDefault(); setSearchOpen(true); return }
      if (e.key === 'Escape') { setPanelOpen(false); setSheetOpen(false); setSearchOpen(false) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Close desktop panel when clicking outside the header
  useEffect(() => {
    if (!panelOpen) return
    const onDown = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setPanelOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [panelOpen])

  // Lock page scroll behind the mobile sheet
  useEffect(() => {
    document.body.style.overflow = sheetOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [sheetOpen])

  const isActive = useCallback((href: string) => href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`), [pathname])
  const topLines = lines.slice(0, MAX_TOP_LINES)
  const onLinePage = lines.some((l) => isActive(`/${l.slug}`))

  return (
    <>
      <header className="tr-top" ref={panelRef}>
        <div className="tr-wrap tr-top__row">
          <Link href="/" className="tr-brand" aria-label="Applied Agentic home">
            <BrandMark />
            <div>
              <b>Applied Agentic</b>
              <span>THE AGENTIC AI NETWORK</span>
            </div>
          </Link>

          <nav className="tr-topnav" aria-label="Primary">
            {topLines.map((line) => (
              <Link
                key={line.id}
                href={`/${line.slug}`}
                className="tr-topnav__line"
                aria-current={isActive(`/${line.slug}`) ? 'page' : undefined}
                style={{ '--c': line.color } as React.CSSProperties}
                title={line.title}
              >
                <span className="dot" />
                <span style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis' }}>{line.title}</span>
              </Link>
            ))}
            {lines.length > 0 && (
              <button type="button" aria-expanded={panelOpen} onClick={() => setPanelOpen((v) => !v)}>
                {lines.length} lines <ChevronDown size={15} style={{ transform: panelOpen ? 'rotate(180deg)' : undefined, transition: 'transform .2s' }} />
              </button>
            )}
          </nav>

          <button type="button" className="tr-search-trigger" onClick={() => setSearchOpen(true)}>
            <Search size={16} /> Search stops <kbd>/</kbd>
          </button>
          <button type="button" className="tr-icon-btn tr-mobile-only" onClick={() => setSearchOpen(true)} aria-label="Search">
            <Search size={18} />
          </button>
          <button
            type="button"
            className="tr-icon-btn"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            title={theme === 'dark' ? 'Light theme' : 'Dark theme'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        {panelOpen && (
          <div className="tr-lines-panel">
            <div className="tr-wrap">
              <div className="tr-lines-panel__grid">
                {lines.map((line) => (
                  <LineList key={line.id} lines={[line]} onNavigate={() => setPanelOpen(false)} />
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Mobile dock */}
      <nav className="tr-dock" aria-label="Primary mobile">
        <Link href="/" aria-current={pathname === '/' ? 'page' : undefined}>
          <MapIcon size={22} />Map
        </Link>
        <button type="button" aria-expanded={sheetOpen || (onLinePage && !searchOpen) ? true : false} onClick={() => setSheetOpen(true)}>
          <Route size={22} />Lines
        </button>
        <button type="button" aria-expanded={searchOpen || pathname.startsWith('/search')} onClick={() => setSearchOpen(true)}>
          <Search size={22} />Search
        </button>
        {lastRide ? (
          <Link href={`/articles/${lastRide.slug}`} aria-current={pathname === `/articles/${lastRide.slug}` ? 'page' : undefined} title={lastRide.title}>
            <BookOpenText size={22} />Resume
          </Link>
        ) : (
          <Link href={lines[0] ? `/${lines[0].slug}` : '/search'} aria-current={pathname.startsWith('/articles/') ? 'page' : undefined}>
            <BookOpenText size={22} />Start
          </Link>
        )}
      </nav>

      {/* Mobile lines sheet */}
      {sheetOpen && (
        <div className="tr-overlay" role="dialog" aria-modal="true" aria-label="All lines" onClick={(e) => { if (e.target === e.currentTarget) setSheetOpen(false) }}>
          <div className="tr-sheet">
            <div className="tr-sheet__grab" />
            <div className="tr-sheet__head">
              <h2 className="tr-display">All lines</h2>
              <button type="button" className="tr-icon-btn" onClick={() => setSheetOpen(false)} aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <LineList lines={lines} onNavigate={() => setSheetOpen(false)} />
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
