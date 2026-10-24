'use client'
// components/pulse/Reading.tsx
// The reading experience. <ReadingProvider> tracks scroll progress and which
// heading you are on; the pieces below render it:
//   <ReadingBar>     rainbow progress bar pinned to the top of the screen
//   <SectionCards>   swipeable cards that jump to each section
//   <ReadingSide>    desktop contents list with a progress ring
//   <ReadingPill>    listen + contents controls inside the floating pill nav
//   <FinishLine>     "lesson complete" card with a colour burst
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { PartyPopper, X } from 'lucide-react'

export interface Heading {
  id: string
  label: string
  level: 1 | 2
}

interface State {
  progress: number
  headings: Heading[]
  here: number
  jump: (id: string) => void
}

const Ctx = createContext<State>({ progress: 0, headings: [], here: -1, jump: () => {} })
const useReading = () => useContext(Ctx)
const ROOT = '[data-read-root]'

interface ProviderProps {
  slug: string
  title: string
  children: React.ReactNode
}

export function ReadingProvider({ slug, title, children }: ProviderProps) {
  const [progress, setProgress] = useState(0)
  const [headings, setHeadings] = useState<Heading[]>([])
  const [here, setHere] = useState(-1)
  const els = useRef<HTMLElement[]>([])

  // Remember for the "Reading" tab, and switch the pill nav into reading mode
  useEffect(() => {
    try { localStorage.setItem('aa-last-ride', JSON.stringify({ slug, title })) } catch { /* storage unavailable */ }
    document.body.classList.add('p-reading')
    return () => document.body.classList.remove('p-reading')
  }, [slug, title])

  const collect = useCallback(() => {
    const root = document.querySelector<HTMLElement>(ROOT)
    if (!root) return
    const sectionHeads = Array.from(root.querySelectorAll<HTMLElement>('[data-ride-stop]'))
    const nodes = sectionHeads.length > 1
      ? Array.from(root.querySelectorAll<HTMLElement>('[data-ride-stop], .p-prose h2[id]'))
      : Array.from(root.querySelectorAll<HTMLElement>('.p-prose h1[id], .p-prose h2[id]'))
    els.current = nodes
    setHeadings(nodes.map((el) => ({
      id: el.id,
      label: (el.getAttribute('data-ride-stop') || el.textContent || '').trim(),
      level: sectionHeads.length > 1 && !el.hasAttribute('data-ride-stop') ? 2 : 1,
    })))
  }, [])

  useEffect(() => {
    const root = document.querySelector<HTMLElement>(ROOT)
    if (!root) return
    const t = setTimeout(collect, 80)
    let raf = 0
    const ro = new ResizeObserver(() => { cancelAnimationFrame(raf); raf = requestAnimationFrame(collect) })
    ro.observe(root)
    return () => { clearTimeout(t); ro.disconnect(); cancelAnimationFrame(raf) }
  }, [collect])

  useEffect(() => {
    let raf = 0
    const update = () => {
      const root = document.querySelector<HTMLElement>(ROOT)
      if (!root) return
      const r = root.getBoundingClientRect()
      const vh = window.innerHeight
      setProgress(Math.min(1, Math.max(0, (vh * 0.4 - r.top) / Math.max(1, r.height - vh * 0.45))))
      let h = -1
      els.current.forEach((el, i) => { if (el.getBoundingClientRect().top < vh * 0.4) h = i })
      setHere(h)
    }
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); cancelAnimationFrame(raf) }
  }, [headings])

  const jump = useCallback((id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    el.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' })
    history.replaceState(null, '', `#${id}`)
  }, [])

  return <Ctx.Provider value={{ progress, headings, here, jump }}>{children}</Ctx.Provider>
}

export function ReadingBar() {
  const { progress } = useReading()
  return (
    <div className="p-progress" role="progressbar" aria-label="Reading progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)}>
      <span style={{ '--p': progress } as React.CSSProperties} />
    </div>
  )
}

interface SectionCardsProps {
  sections: { id: string; title: string; color: string; fg: string }[]
}

/** Swipeable section cards. Server-rendered list, highlighted as you read. */
export function SectionCards({ sections }: SectionCardsProps) {
  const { headings, here, jump } = useReading()
  const currentId = here >= 0 ? headings[here]?.id : null
  // Map the current heading back to its section (the last section head at or above it)
  let currentSection = -1
  if (currentId) {
    for (let i = here; i >= 0; i--) {
      const idx = sections.findIndex((s) => s.id === headings[i]?.id)
      if (idx >= 0) { currentSection = idx; break }
    }
  }
  const stripRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (currentSection < 0) return
    const card = stripRef.current?.children[currentSection] as HTMLElement | undefined
    if (card && stripRef.current) stripRef.current.scrollTo({ left: card.offsetLeft - 8, behavior: 'smooth' })
  }, [currentSection])

  if (sections.length < 2) return null
  return (
    <div className="p-jump" ref={stripRef} role="list" aria-label="Sections in this lesson">
      {sections.map((s, i) => (
        <button
          key={s.id}
          type="button"
          role="listitem"
          className={i === currentSection ? 'here' : i < currentSection ? 'done' : undefined}
          style={{ '--sc': s.color, '--sfg': s.fg } as React.CSSProperties}
          onClick={() => jump(s.id)}
        >
          <span className="p-label">Part {String(i + 1).padStart(2, '0')}</span>
          <b>{s.title}</b>
        </button>
      ))}
    </div>
  )
}

function Ring({ progress, size = 60, stroke = 7 }: { progress: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2
  const C = 2 * Math.PI * r
  return (
    <svg viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--bg-2)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--c)" strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={C} strokeDashoffset={C * (1 - progress)} transform={`rotate(-90 ${size / 2} ${size / 2})`} style={{ transition: 'stroke-dashoffset .2s linear' }} />
    </svg>
  )
}

function HeadingLinks({ onPick }: { onPick?: () => void }) {
  const { headings, here, jump } = useReading()
  let n = 0
  return (
    <ol>
      {headings.map((h, i) => {
        if (h.level === 1) n++
        return (
          <li key={`${h.id}-${i}`} className={`lvl-${h.level === 1 ? 2 : 3}${i < here ? ' passed' : ''}${i === here ? ' here' : ''}`}>
            <a href={`#${h.id}`} onClick={(e) => { e.preventDefault(); jump(h.id); onPick?.() }}>
              <span>{h.level === 1 ? String(n).padStart(2, '0') : '·'}</span>{h.label}
            </a>
          </li>
        )
      })}
    </ol>
  )
}

export function ReadingSide({ minutes }: { minutes: number }) {
  const { progress, headings } = useReading()
  const left = Math.max(0, Math.round(minutes * (1 - progress)))
  return (
    <>
      <div className="p-side-card p-ring-big">
        <Ring progress={progress} />
        <div>
          <b>{Math.round(progress * 100)}%</b>
          <small>{progress >= 0.98 ? 'Finished' : minutes ? `${left} min left` : 'read'}</small>
        </div>
      </div>
      {headings.length > 0 && (
        <nav className="p-side-card p-toc" aria-label="Contents">
          <span className="p-label">In this lesson</span>
          <HeadingLinks />
        </nav>
      )}
    </>
  )
}

/** Reader controls rendered into the pill nav (slot provided by PulseShell). */
export function ReadingPill({ tools, listen }: { tools?: React.ReactNode; listen?: React.ReactNode }) {
  const { progress, headings } = useReading()
  const [slot, setSlot] = useState<HTMLElement | null>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => { setSlot(document.getElementById('p-pill-slot')) }, [])
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const C = 2 * Math.PI * 10
  return (
    <>
      {slot && createPortal(
        <>
          {listen}
          <button type="button" onClick={() => setOpen(true)} aria-haspopup="dialog" aria-label={`Contents and reading tools, ${Math.round(progress * 100)}% read`}>
            <svg className="ring" viewBox="0 0 26 26" aria-hidden="true">
              <circle cx="13" cy="13" r="10" fill="none" stroke="currentColor" strokeOpacity=".25" strokeWidth="3.5" />
              <circle cx="13" cy="13" r="10" fill="none" stroke="var(--sun)" strokeWidth="3.5" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - progress)} transform="rotate(-90 13 13)" />
            </svg>
            {Math.round(progress * 100)}%
          </button>
        </>,
        slot,
      )}
      {open && (
        <div className="p-overlay" role="dialog" aria-modal="true" aria-label="Contents and reading tools" onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}>
          <div className="p-sheet">
            <div className="p-sheet__grab" />
            <div className="p-sheet__head">
              <h2 className="p-display">This lesson</h2>
              <button type="button" className="p-round p-round--sm" onClick={() => setOpen(false)} aria-label="Close"><X size={18} /></button>
            </div>
            {tools && <div style={{ marginBottom: 18 }}>{tools}</div>}
            {headings.length > 0 && <div className="p-toc"><HeadingLinks onPick={() => setOpen(false)} /></div>}
          </div>
        </div>
      )}
    </>
  )
}

const BURST_COLORS = ['var(--cobalt)', 'var(--tomato)', 'var(--sun)', 'var(--mint)', 'var(--violet)', 'var(--pink)']

/** Shows a completion card; fires a one-off colour burst the first time you reach the end. */
export function FinishLine({ children }: { children: React.ReactNode }) {
  const { progress } = useReading()
  const [burst, setBurst] = useState(false)
  const fired = useRef(false)

  useEffect(() => {
    if (fired.current || progress < 0.985) return
    fired.current = true
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    setBurst(true)
    const t = setTimeout(() => setBurst(false), 1400)
    return () => clearTimeout(t)
  }, [progress])

  return (
    <section className="p-done" aria-label="Lesson complete">
      <PartyPopper size={28} color="var(--sun)" aria-hidden="true" />
      {children}
      {burst && (
        <div className="p-burst" aria-hidden="true">
          {Array.from({ length: 36 }, (_, i) => {
            const a = (i / 36) * Math.PI * 2
            const d = 140 + (i % 5) * 40
            return (
              <i key={i} style={{
                '--c': BURST_COLORS[i % BURST_COLORS.length],
                '--dx': `${Math.cos(a) * d}px`,
                '--dy': `${Math.sin(a) * d}px`,
                '--r': `${(i % 2 ? 1 : -1) * (180 + i * 12)}deg`,
              } as React.CSSProperties} />
            )
          })}
        </div>
      )}
    </section>
  )
}

