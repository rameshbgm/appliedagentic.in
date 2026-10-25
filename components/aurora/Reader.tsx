'use client'
// components/aurora/Reader.tsx
// Everything that makes the essay page a reading room:
//   ReaderProvider  progress, headings, saved position, focus, ruler, highlights
//   ProgressLine    aurora progress rule at the very top
//   ResumeBanner    "continue where you left off"
//   LearnCard       "What you'll learn", built from the essay's sections
//   MarginToc       left-margin contents (desktop)
//   MarginNotes     right-margin highlights (desktop)
//   Highlighter     select text → highlight / copy popover
//   Ruler           a reading band that follows your eyes, the rest dimmed
//   Orbit           radial navigator: progress orb + quick actions + sheet
//   FinishCard      the closing card; the sky brightens when you finish
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Bookmark, BookmarkCheck, Check, ChevronDown, Copy, Crosshair, Highlighter as HighlighterIcon, Rows3, Share2, Type, X } from 'lucide-react'
import { toast } from 'sonner'
import { useTheme } from '@/components/shared/ThemeProvider'
import {
  addHighlight, getHighlights, getProgress, isBookmarked, LIBRARY_EVENT, removeHighlight, saveProgress, toggleBookmark,
  type Highlight,
} from '@/lib/library'

/* ─── Context ──────────────────────────────────────────────────────────── */

interface Heading { id: string; label: string; sub: boolean }

interface ReaderState {
  slug: string
  title: string
  minutes: number
  color?: string
  module?: string
  progress: number
  headings: Heading[]
  here: number
  focus: boolean
  setFocus: (v: boolean) => void
  ruler: boolean
  setRuler: (v: boolean) => void
  jump: (id: string) => void
  highlights: Highlight[]
}

const Ctx = createContext<ReaderState | null>(null)
const useReader = () => {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('Reader components must be inside <ReaderProvider>')
  return ctx
}
const ROOT = '[data-read-root]'
const rootEl = () => document.querySelector<HTMLElement>(ROOT)

interface ProviderProps {
  slug: string
  title: string
  minutes: number
  color?: string
  module?: string
  children: React.ReactNode
}

export function ReaderProvider({ slug, title, minutes, color, module, children }: ProviderProps) {
  const [progress, setProgress] = useState(0)
  const [headings, setHeadings] = useState<Heading[]>([])
  const [here, setHere] = useState(-1)
  const [focus, setFocus] = useState(false)
  const [ruler, setRuler] = useState(false)
  const [highlights, setHighlights] = useState<Highlight[]>([])
  const els = useRef<HTMLElement[]>([])
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  usePrefs() // apply the reader's saved size / spacing / width / typeface

  // The sky dims while an essay is open and flares when it is finished
  useEffect(() => {
    document.body.classList.add('a-reading')
    return () => document.body.classList.remove('a-reading', 'a-complete')
  }, [])
  useEffect(() => { document.body.classList.toggle('a-complete', progress >= 0.97) }, [progress])

  // Headings → contents
  const collect = useCallback(() => {
    const root = rootEl()
    if (!root) return
    const sectionHeads = Array.from(root.querySelectorAll<HTMLElement>('[data-ride-stop]'))
    const nodes = sectionHeads.length > 1
      ? Array.from(root.querySelectorAll<HTMLElement>('[data-ride-stop], .a-prose h2[id]'))
      : Array.from(root.querySelectorAll<HTMLElement>('.a-prose h1[id], .a-prose h2[id]'))
    els.current = nodes
    setHeadings(nodes.map((el) => ({
      id: el.id,
      label: (el.getAttribute('data-ride-stop') || el.textContent || '').trim(),
      sub: sectionHeads.length > 1 && !el.hasAttribute('data-ride-stop'),
    })))
  }, [])

  useEffect(() => {
    const root = rootEl()
    if (!root) return
    const t = setTimeout(collect, 80)
    let raf = 0
    const ro = new ResizeObserver(() => { cancelAnimationFrame(raf); raf = requestAnimationFrame(collect) })
    ro.observe(root)
    return () => { clearTimeout(t); ro.disconnect(); cancelAnimationFrame(raf) }
  }, [collect])

  // Scroll → progress, current heading, focus paragraph, saved position
  useEffect(() => {
    let raf = 0
    const update = () => {
      const root = rootEl()
      if (!root) return
      const r = root.getBoundingClientRect()
      const vh = window.innerHeight
      const pct = Math.min(1, Math.max(0, (vh * 0.4 - r.top) / Math.max(1, r.height - vh * 0.45)))
      setProgress(pct)
      let h = -1
      els.current.forEach((el, i) => { if (el.getBoundingClientRect().top < vh * 0.4) h = i })
      setHere(h)
      if (saveTimer.current) clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(() => {
        if (pct > 0.02) saveProgress({ slug, title, pct, y: Math.round(window.scrollY), color, module })
      }, 600)
    }
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); cancelAnimationFrame(raf) }
  }, [headings, slug, title, color, module])

  // Focus mode marks the block nearest the reading line
  useEffect(() => {
    const root = rootEl()
    if (!root) return
    root.classList.toggle('a-focus', focus)
    if (!focus) { root.querySelectorAll('.is-focus').forEach((n) => n.classList.remove('is-focus')); return }
    let raf = 0
    const mark = () => {
      const line = window.innerHeight * 0.42
      let best: Element | null = null
      let dist = Infinity
      root.querySelectorAll('.a-prose > *').forEach((n) => {
        const b = n.getBoundingClientRect()
        const d = b.top <= line && b.bottom >= line ? 0 : Math.min(Math.abs(b.top - line), Math.abs(b.bottom - line))
        if (d < dist) { dist = d; best = n }
      })
      root.querySelectorAll('.is-focus').forEach((n) => { if (n !== best) n.classList.remove('is-focus') })
      ;(best as Element | null)?.classList.add('is-focus')
    }
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(mark) }
    mark()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf) }
  }, [focus])

  // Highlights: load, keep in sync, paint into the text
  useEffect(() => {
    const sync = () => setHighlights(getHighlights(slug))
    sync()
    window.addEventListener(LIBRARY_EVENT, sync)
    return () => window.removeEventListener(LIBRARY_EVENT, sync)
  }, [slug])

  useEffect(() => {
    const root = rootEl()
    if (!root) return
    const t = setTimeout(() => paintHighlights(root, highlights), 120)
    return () => clearTimeout(t)
  }, [highlights])

  const jump = useCallback((id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    el.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' })
    history.replaceState(null, '', `#${id}`)
  }, [])

  const value = useMemo(() => ({ slug, title, minutes, color, module, progress, headings, here, focus, setFocus, ruler, setRuler, jump, highlights }),
    [slug, title, minutes, color, module, progress, headings, here, focus, ruler, jump, highlights])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

/** Wrap each saved highlight's text in <mark class="a-mark">, once, inside its block. */
function paintHighlights(root: HTMLElement, list: Highlight[]) {
  root.querySelectorAll('mark.a-mark').forEach((m) => {
    if (!list.some((h) => h.id === m.getAttribute('data-id'))) {
      const parent = m.parentNode
      while (m.firstChild) parent?.insertBefore(m.firstChild, m)
      parent?.removeChild(m)
      parent?.normalize()
    }
  })
  const blocks = Array.from(root.querySelectorAll<HTMLElement>('.a-prose p, .a-prose li, .a-prose blockquote, .a-prose td'))
  for (const h of list) {
    if (root.querySelector(`mark.a-mark[data-id="${h.id}"]`)) continue
    const block = blocks.find((b) => (b.textContent ?? '').includes(h.text))
    if (!block) continue
    const start = (block.textContent ?? '').indexOf(h.text)
    const end = start + h.text.length
    const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT)
    const segments: { node: Text; from: number; to: number }[] = []
    let pos = 0
    let node: Node | null
    while ((node = walker.nextNode())) {
      const len = node.textContent?.length ?? 0
      const from = Math.max(start, pos)
      const to = Math.min(end, pos + len)
      if (from < to) segments.push({ node: node as Text, from: from - pos, to: to - pos })
      pos += len
      if (pos >= end) break
    }
    for (const seg of segments) {
      const range = document.createRange()
      range.setStart(seg.node, seg.from)
      range.setEnd(seg.node, seg.to)
      const mark = document.createElement('mark')
      mark.className = 'a-mark'
      mark.setAttribute('data-id', h.id)
      try { range.surroundContents(mark) } catch { /* range crossed an element boundary */ }
    }
  }
}

/* ─── Small pieces ─────────────────────────────────────────────────────── */

export function ProgressLine() {
  const { progress } = useReader()
  return (
    <div className="a-progress" role="progressbar" aria-label="Reading progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)}>
      <span style={{ '--p': progress } as React.CSSProperties} />
    </div>
  )
}

export function ResumeBanner() {
  const { slug } = useReader()
  const [saved, setSaved] = useState<{ y: number; pct: number } | null>(null)
  useEffect(() => {
    const p = getProgress(slug)
    if (p && p.pct > 0.06 && p.pct < 0.97 && p.y > 500 && window.scrollY < 200) setSaved({ y: p.y, pct: p.pct })
  }, [slug])
  if (!saved) return null
  return (
    <div className="a-resume" role="status">
      <p>You were {Math.round(saved.pct * 100)}% of the way through.</p>
      <div style={{ display: 'flex', gap: 6 }}>
        <button type="button" className="a-btn a-btn--accent a-btn--sm" onClick={() => { window.scrollTo({ top: saved.y, behavior: 'smooth' }); setSaved(null) }}>
          Continue where I left off
        </button>
        <button type="button" className="a-icon" onClick={() => setSaved(null)} aria-label="Dismiss"><X size={16} /></button>
      </div>
    </div>
  )
}

export function LearnCard({ items }: { items: { id: string; label: string }[] }) {
  const { jump } = useReader()
  if (items.length < 2) return null
  return (
    <details className="a-learn" open>
      <summary>What you’ll learn <ChevronDown size={18} aria-hidden="true" /></summary>
      <ol>
        {items.map((it) => (
          <li key={it.id}><a href={`#${it.id}`} onClick={(e) => { e.preventDefault(); jump(it.id) }}>{it.label}</a></li>
        ))}
      </ol>
    </details>
  )
}

function HeadingList({ onPick }: { onPick?: () => void }) {
  const { headings, here, jump } = useReader()
  return (
    <ol>
      {headings.map((h, i) => (
        <li key={`${h.id}-${i}`} className={`${h.sub ? 'sub' : ''}${i < here ? ' passed' : ''}${i === here ? ' here' : ''}`}>
          <a href={`#${h.id}`} onClick={(e) => { e.preventDefault(); jump(h.id); onPick?.() }}>{h.label}</a>
        </li>
      ))}
    </ol>
  )
}

export function MarginToc() {
  const { headings, minutes, progress } = useReader()
  if (headings.length === 0) return null
  const left = Math.max(0, Math.round(minutes * (1 - progress)))
  return (
    <nav className="a-margin-toc" aria-label="In this essay">
      <span className="a-side-label">In this essay</span>
      <HeadingList />
      {minutes > 0 && <p className="a-colophon" style={{ marginTop: 16, fontSize: '.86rem' }}>{progress >= 0.97 ? 'Finished.' : `About ${left} min left.`}</p>}
    </nav>
  )
}

export function MarginNotes() {
  const { highlights } = useReader()
  const scrollTo = (id: string) => {
    document.querySelector(`mark.a-mark[data-id="${id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
  return (
    <aside className="a-notes" aria-label="Your highlights">
      <span className="a-side-label">Your highlights</span>
      {highlights.length === 0 ? (
        <p className="a-colophon" style={{ margin: 0, fontSize: '.88rem' }}>Select any sentence to highlight it. Highlights stay on this device.</p>
      ) : highlights.map((h) => (
        <div key={h.id} className="a-note">
          <p onClick={() => scrollTo(h.id)}>{h.text}</p>
          <button type="button" onClick={() => removeHighlight(h.id)} aria-label="Remove highlight"><X size={14} /></button>
        </div>
      ))}
    </aside>
  )
}

/* ─── Selection popover ────────────────────────────────────────────────── */

export function Highlighter() {
  const { slug, title } = useReader()
  const [pos, setPos] = useState<{ x: number; y: number; text: string } | null>(null)

  useEffect(() => {
    const check = () => {
      const sel = window.getSelection()
      const root = rootEl()
      if (!sel || sel.isCollapsed || !root || sel.rangeCount === 0) { setPos(null); return }
      const range = sel.getRangeAt(0)
      if (!root.contains(range.commonAncestorContainer)) { setPos(null); return }
      const text = sel.toString().replace(/\s+/g, ' ').trim()
      if (text.length < 3 || text.length > 600) { setPos(null); return }
      const r = range.getBoundingClientRect()
      setPos({ x: Math.min(window.innerWidth - 110, Math.max(110, r.left + r.width / 2)), y: Math.max(70, r.top), text })
    }
    // selectionchange covers touch selection handles on phones; debounce while dragging
    let t: ReturnType<typeof setTimeout> | null = null
    const later = () => { if (t) clearTimeout(t); t = setTimeout(check, 180) }
    document.addEventListener('selectionchange', later)
    document.addEventListener('mouseup', later)
    document.addEventListener('keyup', later)
    // Keep the popover attached to the selection while the page scrolls
    window.addEventListener('scroll', later, { passive: true })
    return () => {
      if (t) clearTimeout(t)
      document.removeEventListener('selectionchange', later)
      document.removeEventListener('mouseup', later)
      document.removeEventListener('keyup', later)
      window.removeEventListener('scroll', later)
    }
  }, [])

  if (!pos) return null
  return createPortal(
    <div className="a-pop" style={{ left: pos.x, top: pos.y }} role="toolbar" aria-label="Selected text" onMouseDown={(e) => e.preventDefault()}>
      <button type="button" onClick={() => {
        addHighlight({ slug, title, text: pos.text })
        window.getSelection()?.removeAllRanges()
        setPos(null)
        toast.success('Highlighted. Find it in your library.')
      }}>
        <HighlighterIcon size={15} /> Highlight
      </button>
      <button type="button" onClick={async () => {
        try { await navigator.clipboard.writeText(`“${pos.text}” — ${title}`); toast.success('Quote copied') } catch { toast.error('Copy failed. Use your device’s copy instead.') }
        setPos(null)
      }}>
        <Copy size={15} /> Copy quote
      </button>
    </div>,
    document.body,
  )
}

/* ─── Reading settings (Aa) ────────────────────────────────────────────── */

interface Prefs { size: number; lh: number; measure: number; font: 'serif' | 'sans' }
const PREF_KEY = 'aa-reader'
const DEFAULT_PREFS: Prefs = { size: 19, lh: 1.72, measure: 68, font: 'sans' }

function applyPrefs(p: Prefs) {
  const s = document.documentElement.style
  s.setProperty('--read-size', `${p.size}px`)
  s.setProperty('--read-lh', String(p.lh))
  s.setProperty('--read-measure', `${p.measure}ch`)
  s.setProperty('--read-font', p.font === 'serif' ? 'var(--serif)' : 'var(--ui)')
}

export function usePrefs() {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS)
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(PREF_KEY) ?? 'null')
      if (saved) { const p = { ...DEFAULT_PREFS, ...saved }; setPrefs(p); applyPrefs(p) }
    } catch { /* storage unavailable */ }
  }, [])
  const update = (patch: Partial<Prefs>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...patch }
      applyPrefs(next)
      try { localStorage.setItem(PREF_KEY, JSON.stringify(next)) } catch { /* storage unavailable */ }
      return next
    })
  }
  return { prefs, update }
}

const THEMES = [
  { id: 'dark', label: 'Night', bg: 'linear-gradient(135deg, #080C18, #1A2140)', fg: '#ECEFF7' },
  { id: 'sepia', label: 'Dusk', bg: 'linear-gradient(135deg, #17141C, #3A2A2E)', fg: '#EFE6DA' },
  { id: 'light', label: 'Day', bg: 'linear-gradient(135deg, #F3F6FB, #DDE7F5)', fg: '#0E1528' },
] as const

function AaPanel() {
  const { prefs, update } = usePrefs()
  const { theme, setTheme } = useTheme()
  return (
    <div className="a-aa">
      <div className="a-aa__row">
        <span>Sky</span>
        <div className="a-swatches">
          {THEMES.map((t) => (
            <button key={t.id} type="button" className="a-swatch" aria-pressed={theme === t.id} onClick={() => setTheme(t.id)} style={{ background: t.bg, color: t.fg }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div className="a-aa__row">
        <span>Typeface</span>
        <div className="a-seg" role="group" aria-label="Typeface">
          <button type="button" aria-pressed={prefs.font === 'sans'} onClick={() => update({ font: 'sans' })}>Hyperlegible</button>
          <button type="button" aria-pressed={prefs.font === 'serif'} onClick={() => update({ font: 'serif' })} style={{ fontFamily: 'var(--serif)' }}>Serif</button>
        </div>
      </div>
      <label className="a-aa__row" htmlFor="aa-size">
        <span>Text size</span>
        <span className="a-aa__range">
          <input id="aa-size" type="range" min={16} max={24} step={1} value={prefs.size} onChange={(e) => update({ size: Number(e.target.value) })} />
          <b>{prefs.size}px</b>
        </span>
      </label>
      <label className="a-aa__row" htmlFor="aa-lh">
        <span>Line spacing</span>
        <span className="a-aa__range">
          <input id="aa-lh" type="range" min={1.5} max={2.1} step={0.05} value={prefs.lh} onChange={(e) => update({ lh: Number(e.target.value) })} />
          <b>{prefs.lh.toFixed(2)}</b>
        </span>
      </label>
      <label className="a-aa__row" htmlFor="aa-width">
        <span>Column width</span>
        <span className="a-aa__range">
          <input id="aa-width" type="range" min={54} max={78} step={2} value={prefs.measure} onChange={(e) => update({ measure: Number(e.target.value) })} />
          <b>{prefs.measure}ch</b>
        </span>
      </label>
    </div>
  )
}

/* ─── Reading ruler ────────────────────────────────────────────────────── */

export function Ruler() {
  const { ruler, setRuler } = useReader()
  const [y, setY] = useState<number | null>(null)
  useEffect(() => {
    if (!ruler) return
    // Follows the mouse on desktop; on touch screens it holds steady at eye level
    if (!window.matchMedia('(pointer: fine)').matches) { setY(null); return }
    let raf = 0
    const onMove = (e: PointerEvent) => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => setY(e.clientY)) }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setRuler(false) }
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('keydown', onKey)
    return () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('keydown', onKey); cancelAnimationFrame(raf) }
  }, [ruler, setRuler])
  if (!ruler) return null
  return <div className="a-ruler" aria-hidden="true" style={y != null ? ({ '--ry': `${y}px` } as React.CSSProperties) : undefined} />
}

/* ─── Radial navigator ─────────────────────────────────────────────────── */

type Panel = 'nav' | 'aa' | null

function Ring({ progress, size = 62 }: { progress: number; size?: number }) {
  const r = size / 2 - 4
  const C = 2 * Math.PI * r
  return (
    <svg viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      <defs>
        <linearGradient id={`a-ring-${size}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--a1)" /><stop offset="1" stopColor="var(--a2)" />
        </linearGradient>
      </defs>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--stroke)" strokeWidth="3" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`url(#a-ring-${size})`} strokeWidth="3" strokeLinecap="round"
        strokeDasharray={C} strokeDashoffset={C * (1 - progress)} transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset .3s linear', filter: 'drop-shadow(0 0 4px var(--a2))' }} />
    </svg>
  )
}

export function Orbit({ listen }: { listen?: React.ReactNode }) {
  const { slug, title, module, color, minutes, progress, focus, setFocus, ruler, setRuler, headings } = useReader()
  const [panel, setPanel] = useState<Panel>(null)
  const [saved, setSaved] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [mounted, setMounted] = useState(false)
  const lastY = useRef(0)

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => {
    const sync = () => setSaved(isBookmarked(slug))
    sync()
    window.addEventListener(LIBRARY_EVENT, sync)
    return () => window.removeEventListener(LIBRARY_EVENT, sync)
  }, [slug])
  useEffect(() => {
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const y = window.scrollY
        const atEnd = window.innerHeight + y > document.documentElement.scrollHeight - 300
        if (Math.abs(y - lastY.current) > 8) { setHidden(y > lastY.current && y > 300 && !atEnd); lastY.current = y }
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf) }
  }, [])
  useEffect(() => {
    if (!panel) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setPanel(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [panel])

  const onBookmark = () => {
    const now = toggleBookmark({ slug, title, module, color })
    toast.success(now ? 'Saved to your library' : 'Removed from your library')
  }
  const onShare = async () => {
    const url = window.location.href.split('#')[0]
    if (typeof navigator.share === 'function') {
      try { await navigator.share({ title, url }); return } catch { return }
    }
    try { await navigator.clipboard.writeText(url); toast.success('Link copied') } catch { toast.error('Copy the address from your browser bar.') }
  }

  const pct = Math.round(progress * 100)
  const left = Math.max(0, Math.round(minutes * (1 - progress)))
  return (
    <>
      <div className={`a-orbit${hidden && !panel ? ' is-hidden' : ''}`} role="toolbar" aria-label="Reading tools">
        <div className="a-orbit__quick a-glass">
          {listen}
          <button type="button" className="a-icon" aria-pressed={saved} onClick={onBookmark} aria-label={saved ? 'Remove bookmark' : 'Save to library'} title={saved ? 'Saved' : 'Save to library'}>
            {saved ? <BookmarkCheck size={19} /> : <Bookmark size={19} />}
          </button>
          <button type="button" className="a-icon" onClick={() => setPanel('aa')} aria-label="Reading settings" title="Reading settings"><Type size={19} /></button>
        </div>
        <button type="button" className="a-orbit__btn" onClick={() => setPanel('nav')} aria-haspopup="dialog" aria-label={`Navigator, ${pct}% read`}>
          <Ring progress={progress} />
          {pct}%
        </button>
      </div>

      {mounted && panel && createPortal(
        <>
          <div className="a-scrim" onClick={() => setPanel(null)} />
          <div className="a-sheet-wrap" role="dialog" aria-modal="true" aria-label={panel === 'aa' ? 'Reading settings' : 'Navigator'}>
            <div className="a-sheet">
              <div className="a-sheet__grab" />
              <div className="a-sheet__head">
                <h2 className="a-display">{panel === 'aa' ? 'Reading settings' : 'Navigator'}</h2>
                <button type="button" className="a-icon" onClick={() => setPanel(null)} aria-label="Close"><X size={18} /></button>
              </div>
              {panel === 'aa' ? <AaPanel /> : (
                <div className="a-nav-sheet">
                  <div className="a-nav-sheet__status">
                    <Ring progress={progress} size={64} />
                    <div>
                      <b>{pct}%</b>
                      <small>{progress >= 0.97 ? 'Finished. Well read.' : minutes > 0 ? `About ${left} min left` : 'Keep going'}</small>
                    </div>
                  </div>
                  <div className="a-nav-sheet__actions">
                    <button type="button" className="a-action" aria-pressed={ruler} onClick={() => { setRuler(!ruler); setPanel(null) }}><Rows3 size={20} />Ruler</button>
                    <button type="button" className="a-action" aria-pressed={focus} onClick={() => { setFocus(!focus); setPanel(null) }}><Crosshair size={20} />Focus</button>
                    <button type="button" className="a-action" onClick={() => setPanel('aa')}><Type size={20} />Text</button>
                    <button type="button" className="a-action" onClick={onShare}><Share2 size={20} />Share</button>
                  </div>
                  {headings.length > 0 && (
                    <div className="a-margin-toc">
                      <span className="a-side-label">In this essay</span>
                      <HeadingList onPick={() => setPanel(null)} />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </>,
        document.body,
      )}
    </>
  )
}

/* ─── The end ──────────────────────────────────────────────────────────── */

export function FinishCard({ children }: { children: React.ReactNode }) {
  const { slug, title, color, module, progress } = useReader()
  const [done, setDone] = useState(false)
  useEffect(() => {
    if (done || progress < 0.97) return
    setDone(true)
    saveProgress({ slug, title, pct: 1, y: Math.round(window.scrollY), color, module })
  }, [progress, done, slug, title, color, module])
  return (
    <section className="a-fin" aria-label="End of essay">
      <span className="a-fin__mark" aria-hidden="true">{done ? <Check size={30} /> : '✦'}</span>
      {children}
    </section>
  )
}
