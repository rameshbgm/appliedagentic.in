'use client'
// components/public/ArticleReaderTools.tsx

import { useEffect, useRef, useState, useCallback } from 'react'
import {
  SunMoon, LayoutGrid, GalleryHorizontal, Bot,
  AArrowUp, AArrowDown, X, ChevronLeft, ChevronRight, Loader2, ArrowLeft,
} from 'lucide-react'
import { toast } from 'sonner'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Section {
  title: string
  html: string
  excerpt: string
}

interface Props {
  content: string
  mobile?: boolean
}

// ─── Animation pool ───────────────────────────────────────────────────────────
const ANIMS = ['anim-fade-up', 'anim-slide-left', 'anim-slide-right', 'anim-zoom-in', 'anim-flip-y']
const randomAnim = () => ANIMS[Math.floor(Math.random() * ANIMS.length)]

// ─── Parse HTML → sections split on H1 ───────────────────────────────────────
function parseSections(html: string): Section[] {
  if (typeof window === 'undefined') return []
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const children = Array.from(doc.body.childNodes)

  type RawGroup = { h1: Element | null; nodes: ChildNode[] }
  const groups: RawGroup[] = []
  let cur: RawGroup = { h1: null, nodes: [] }

  children.forEach((node) => {
    const el = node as Element
    if (el.tagName === 'H1') {
      if (cur.h1 || cur.nodes.length) groups.push(cur)
      cur = { h1: el, nodes: [] }
    } else {
      cur.nodes.push(node)
    }
  })
  if (cur.h1 || cur.nodes.length) groups.push(cur)

  return groups
    .filter((g) => g.h1)
    .map((g, i) => {
      const container = document.createElement('div')
      if (g.h1) container.appendChild(g.h1.cloneNode(true))
      g.nodes.forEach((n) => container.appendChild(n.cloneNode(true)))
      const plainText = container.innerText ?? container.textContent ?? ''
      return {
        title: g.h1?.textContent?.trim() ?? `Section ${i + 1}`,
        html: container.innerHTML,
        excerpt: plainText.replace(/\s+/g, ' ').slice(0, 100),
      }
    })
}

const DEFAULT_SIZE = 16
const MIN_SIZE = 10
const MAX_SIZE = 25

export default function ArticleReaderTools({ content, mobile = false }: Props) {
  // ── Theme ─────────────────────────────────────────────────────────────────
  const [theme, setThemeState] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    const stored = localStorage.getItem('aa-theme') as 'dark' | 'light' | null
    const initial = stored ?? (document.documentElement.getAttribute('data-theme') as 'dark' | 'light') ?? 'dark'
    setThemeState(initial)
  }, [])

  const toggleTheme = useCallback(() => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setThemeState(next)
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('aa-theme', next)
  }, [theme])

  // ── Font size ──────────────────────────────────────────────────────────────
  const [fontSize, setFontSizeState] = useState<number>(DEFAULT_SIZE)

  useEffect(() => {
    const stored = localStorage.getItem('aa-article-font-size')
    const val = stored ? parseInt(stored, 10) : DEFAULT_SIZE
    const clamped = Math.min(MAX_SIZE, Math.max(MIN_SIZE, val))
    setFontSizeState(clamped)
    document.documentElement.style.setProperty('--article-font-size', `${clamped}px`)
  }, [])

  const adjustFont = useCallback((delta: number) => {
    setFontSizeState((prev) => {
      const next = Math.min(MAX_SIZE, Math.max(MIN_SIZE, prev + delta))
      document.documentElement.style.setProperty('--article-font-size', `${next}px`)
      localStorage.setItem('aa-article-font-size', String(next))
      return next
    })
  }, [])

  // ── Sections (client-only to avoid hydration mismatch) ────────────────────
  const [sections, setSections] = useState<Section[]>([])
  useEffect(() => { setSections(parseSections(content)) }, [content])

  // ── Slides ────────────────────────────────────────────────────────────────
  const [slidesOpen, setSlidesOpen] = useState(false)
  const [activeTile, setActiveTile] = useState<number | null>(null)
  const [tileAnim, setTileAnim] = useState('')

  const openTile = (idx: number) => { setTileAnim(randomAnim()); setActiveTile(idx) }
  const closeTile = () => setActiveTile(null)
  const closeSlides = () => { setSlidesOpen(false); setActiveTile(null) }

  // ── Carousel ──────────────────────────────────────────────────────────────
  const [carouselOpen, setCarouselOpen] = useState(false)
  const [carouselIdx, setCarouselIdx] = useState(0)
  const [carouselAnim, setCarouselAnim] = useState('anim-fade-up')
  const carouselPaneRef = useRef<HTMLDivElement>(null)

  const navigate = useCallback((dir: -1 | 1) => {
    setCarouselIdx((prev) => {
      const next = Math.min(sections.length - 1, Math.max(0, prev + dir))
      if (next !== prev) {
        setCarouselAnim(randomAnim())
        if (carouselPaneRef.current) carouselPaneRef.current.scrollTop = 0
      }
      return next
    })
  }, [sections.length])

  useEffect(() => {
    if (!carouselOpen) return
    const h = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') navigate(1)
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   navigate(-1)
      if (e.key === 'Escape') setCarouselOpen(false)
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [carouselOpen, navigate])

  useEffect(() => {
    if (!slidesOpen) return
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSlides()
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [slidesOpen])

  // ── AI Summary ────────────────────────────────────────────────────────────
  const [aiOpen, setAiOpen] = useState(false)
  const [aiState, setAiState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [bullets, setBullets] = useState<string[]>([])

  const summarize = useCallback(async () => {
    setAiOpen(true)
    if (aiState === 'done') return
    setAiState('loading')
    try {
      const res = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      const data = await res.json()
      if (!res.ok || !data.data?.bullets) throw new Error(data.message ?? 'Summarization failed')
      setBullets(data.data.bullets)
      setAiState('done')
    } catch (err) {
      setAiState('error')
      toast.error(err instanceof Error ? err.message : 'AI summary failed')
    }
  }, [content, aiState])

  // ── Lock body scroll when any overlay is open ─────────────────────────────
  useEffect(() => {
    const open = slidesOpen || carouselOpen || aiOpen
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [slidesOpen, carouselOpen, aiOpen])

  const stripClass = `art-tools-strip${mobile ? ' mobile' : ''}`

  return (
    <>
      {/* ── Tool strip ─────────────────────────────────────────────────────── */}
      <div className={stripClass} role="toolbar" aria-label="Article reader tools">

        <button
          className={`tool-btn${theme === 'light' ? ' active' : ''}`}
          onClick={toggleTheme}
          data-tip={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          aria-label="Toggle theme"
        >
          <SunMoon size={16} />
        </button>

        <div className="art-tools-divider" />

        <button
          className="tool-btn"
          onClick={() => { setSlidesOpen(true); setActiveTile(null) }}
          data-tip="Slide view"
          aria-label="Open slide view"
        >
          <LayoutGrid size={16} />
        </button>

        <button
          className="tool-btn"
          onClick={() => { setCarouselOpen(true); setCarouselIdx(0); setCarouselAnim('anim-fade-up') }}
          data-tip="Carousel view"
          aria-label="Open carousel view"
        >
          <GalleryHorizontal size={16} />
        </button>

        <div className="art-tools-divider" />

        <button
          className={`tool-btn${aiState === 'done' ? ' active' : ''}`}
          onClick={summarize}
          data-tip="AI summary"
          aria-label="AI summarize article"
        >
          {aiState === 'loading' ? <Loader2 size={16} className="animate-spin" /> : <Bot size={16} />}
        </button>

        <div className="art-tools-divider" />

        <button
          className="tool-btn"
          onClick={() => adjustFont(1)}
          data-tip={`Increase font (${fontSize}px)`}
          aria-label="Increase font size"
          disabled={fontSize >= MAX_SIZE}
        >
          <AArrowUp size={16} />
        </button>

        <span className="tool-font-label">{fontSize}</span>

        <button
          className="tool-btn"
          onClick={() => adjustFont(-1)}
          data-tip={`Decrease font (${fontSize}px)`}
          aria-label="Decrease font size"
          disabled={fontSize <= MIN_SIZE}
        >
          <AArrowDown size={16} />
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          SLIDES OVERLAY
      ══════════════════════════════════════════════════════════════════════ */}
      {slidesOpen && (
        <div className="reader-overlay" role="dialog" aria-modal aria-label="Slide view">

          {/* Header — always shows Close */}
          <div className="reader-overlay-header">
            {activeTile !== null ? (
              /* Sub-header when a tile is open: Back + title + Close */
              <>
                <button className="overlay-back-btn" onClick={closeTile} aria-label="Back to grid">
                  <ArrowLeft size={16} />
                  <span>Back</span>
                </button>
                <span className="reader-overlay-title overlay-title-center">
                  {sections[activeTile]?.title}
                </span>
              </>
            ) : (
              <span className="reader-overlay-title">
                <LayoutGrid size={14} style={{ display: 'inline', marginRight: 7, verticalAlign: 'middle' }} />
                Sections — {sections.length}
              </span>
            )}
            <button className="reader-overlay-close" onClick={closeSlides} aria-label="Close">
              <X size={16} />
            </button>
          </div>

          {/* Tile grid — hidden when detail modal is open */}
          {activeTile === null && (
            <div className="slides-grid">
              {sections.map((sec, i) => (
                <button
                  key={i}
                  className="slide-tile"
                  onClick={() => openTile(i)}
                  aria-label={`Open: ${sec.title}`}
                >
                  <span className="slide-tile-num">§ {i + 1}</span>
                  <span className="slide-tile-title">{sec.title}</span>
                  <span className="slide-tile-excerpt">{sec.excerpt}</span>
                </button>
              ))}
            </div>
          )}

          {/* Section detail — shown in-place (same overlay, replaces grid) */}
          {activeTile !== null && sections[activeTile] && (
            <div className={`section-detail-pane ${tileAnim}`}>
              <div
                className="article-content"
                dangerouslySetInnerHTML={{ __html: sections[activeTile].html }}
              />
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          CAROUSEL OVERLAY
      ══════════════════════════════════════════════════════════════════════ */}
      {carouselOpen && (
        <div className="reader-overlay" role="dialog" aria-modal aria-label="Carousel view">

          {/* Header */}
          <div className="reader-overlay-header">
            <span className="reader-overlay-title">
              <GalleryHorizontal size={14} style={{ display: 'inline', marginRight: 7, verticalAlign: 'middle' }} />
              {sections[carouselIdx]?.title ?? 'Carousel'}
            </span>
            <button className="reader-overlay-close" onClick={() => setCarouselOpen(false)} aria-label="Close">
              <X size={16} />
            </button>
          </div>

          {/* Scrollable content pane */}
          <div ref={carouselPaneRef} className="carousel-pane">
            {sections[carouselIdx] && (
              <div
                key={`${carouselIdx}-${carouselAnim}`}
                className={`article-content ${carouselAnim}`}
                dangerouslySetInnerHTML={{ __html: sections[carouselIdx].html }}
              />
            )}
          </div>

          {/* Footer nav — always visible */}
          <div className="carousel-footer">
            <button
              className="carousel-nav-btn"
              onClick={() => navigate(-1)}
              disabled={carouselIdx === 0}
              aria-label="Previous section"
            >
              <ChevronLeft size={20} />
              <span className="carousel-nav-label">Prev</span>
            </button>

            <span className="carousel-counter">
              {carouselIdx + 1} <span style={{ opacity: 0.45 }}>/</span> {sections.length}
            </span>

            <button
              className="carousel-nav-btn"
              onClick={() => navigate(1)}
              disabled={carouselIdx === sections.length - 1}
              aria-label="Next section"
            >
              <span className="carousel-nav-label">Next</span>
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          AI SUMMARY MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      {aiOpen && (
        <div
          className="reader-overlay ai-overlay"
          role="dialog"
          aria-modal
          aria-label="AI Summary"
          onClick={(e) => { if (e.target === e.currentTarget) setAiOpen(false) }}
        >
          <div className="ai-summary-modal">
            <div className="reader-overlay-header">
              <span className="reader-overlay-title">
                <Bot size={14} style={{ display: 'inline', marginRight: 7, verticalAlign: 'middle', color: 'var(--green)' }} />
                AI Summary — 10 key points
              </span>
              <button className="reader-overlay-close" onClick={() => setAiOpen(false)} aria-label="Close">
                <X size={16} />
              </button>
            </div>

            <div className="ai-summary-body">
              {aiState === 'loading' && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '40px 0', color: 'var(--text-muted)' }}>
                  <Loader2 size={28} className="animate-spin" style={{ color: 'var(--green)' }} />
                  <span style={{ fontSize: 13 }}>Summarizing article…</span>
                </div>
              )}
              {aiState === 'error' && (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px 0', fontSize: 14 }}>
                  Could not generate summary. Please try again.
                </p>
              )}
              {aiState === 'done' && bullets.map((b, i) => (
                <div key={i} className="ai-bullet anim-fade-up" style={{ animationDelay: `${i * 55}ms` }}>
                  <span className="ai-bullet-num">{i + 1}</span>
                  <span className="ai-bullet-text">{b}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

