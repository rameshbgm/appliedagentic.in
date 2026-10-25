'use client'
// components/transit/Ride.tsx
// Reading progress as a journey. <RideProvider> watches the article's headings
// ("stops") and scroll position; <RideBar>, <RideSideMap> and <RideFab> render it.
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { List, X } from 'lucide-react'
import Modal from './Modal'

export interface RideStop {
  id: string
  label: string
  level: 1 | 2
  /** 0–1 position of the stop within the article */
  at: number
}

interface RideState {
  stops: RideStop[]
  progress: number
  here: number
  minutes: number
  jump: (id: string) => void
}

const RideContext = createContext<RideState>({ stops: [], progress: 0, here: -1, minutes: 0, jump: () => {} })
const useRide = () => useContext(RideContext)

interface ProviderProps {
  slug: string
  title: string
  minutes: number
  children: React.ReactNode
}

const ROOT = '[data-ride-root]'

export function RideProvider({ slug, title, minutes, children }: ProviderProps) {
  const [stops, setStops] = useState<RideStop[]>([])
  const [progress, setProgress] = useState(0)
  const [here, setHere] = useState(-1)
  const elsRef = useRef<HTMLElement[]>([])

  // Remember this article for the dock's "Resume" button
  useEffect(() => {
    try {
      localStorage.setItem('aa-last-ride', JSON.stringify({ slug, title }))
      window.dispatchEvent(new Event('aa-last-ride'))
    } catch { /* storage unavailable */ }
  }, [slug, title])

  const collect = useCallback(() => {
    const root = document.querySelector<HTMLElement>(ROOT)
    if (!root) return
    const sectionHeads = Array.from(root.querySelectorAll<HTMLElement>('[data-ride-stop]'))
    let els: HTMLElement[]
    let levels: (1 | 2)[]
    if (sectionHeads.length > 1) {
      els = Array.from(root.querySelectorAll<HTMLElement>('[data-ride-stop], .tr-prose h1[id], .tr-prose h2[id]'))
      levels = els.map((el) => (el.hasAttribute('data-ride-stop') ? 1 : 2))
    } else {
      els = Array.from(root.querySelectorAll<HTMLElement>('.tr-prose h1[id], .tr-prose h2[id]'))
      if (els.length === 0) els = Array.from(root.querySelectorAll<HTMLElement>('.tr-prose h3[id]'))
      levels = els.map(() => 1)
    }
    const top = root.getBoundingClientRect().top + window.scrollY
    const height = Math.max(1, root.offsetHeight)
    elsRef.current = els
    setStops(els.map((el, i) => ({
      id: el.id,
      label: (el.getAttribute('data-ride-stop') || el.textContent || '').trim(),
      level: levels[i],
      at: Math.min(1, Math.max(0, (el.getBoundingClientRect().top + window.scrollY - top) / height)),
    })))
  }, [])

  // Collect once headings have ids, and again whenever the article changes size
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(ROOT)
    if (!root) return
    const t = setTimeout(collect, 60)
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
      setProgress(Math.min(1, Math.max(0, (vh * 0.35 - r.top) / Math.max(1, r.height - vh * 0.4))))
      let h = -1
      elsRef.current.forEach((el, i) => { if (el.getBoundingClientRect().top < vh * 0.4) h = i })
      setHere(h)
    }
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); cancelAnimationFrame(raf) }
  }, [stops])

  const jump = useCallback((id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    el.closest('.tr-section')?.dispatchEvent(new Event('aa-reveal-section'))
    requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' })
      history.replaceState(null, '', `#${id}`)
    })
  }, [])

  return (
    <RideContext.Provider value={{ stops, progress, here, minutes, jump }}>
      {children}
    </RideContext.Provider>
  )
}

/** Sticky bar under the header: rail, fill and a dot per top-level stop. */
export function RideBar() {
  const { stops, progress, here, minutes, jump } = useRide()
  const top = stops.map((s, i) => ({ ...s, i })).filter((s) => s.level === 1)
  const showDots = top.length > 1 && top.length <= 24
  const current = here >= 0 ? stops[here] : null
  const left = Math.max(0, Math.round(minutes * (1 - progress)))

  return (
    <div className="tr-ride">
      <div className="tr-wrap tr-ride__inner">
        <div className="tr-ride__line">
          <div className="tr-ride__rail" />
          <div className="tr-ride__fill" style={{ width: `${progress * 100}%` }} />
          {showDots && top.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`tr-ride__stop${s.i < here ? ' passed' : ''}${s.i === here ? ' here' : ''}`}
              style={{ left: `${Math.min(98, Math.max(2, s.at * 100))}%` }}
              onClick={() => jump(s.id)}
              aria-label={`Jump to ${s.label}`}
              title={s.label}
            />
          ))}
        </div>
        <div className="tr-ride__label">
          <b>{progress >= 0.995 ? 'Arrived' : current ? `Now at: ${current.label}` : 'Departing'}</b>
          <span>{minutes > 0 ? (progress >= 0.995 ? 'Terminus' : `${left} min to terminus`) : `${Math.round(progress * 100)}%`}</span>
        </div>
      </div>
    </div>
  )
}

function StopLinks({ onPick }: { onPick?: () => void }) {
  const { stops, here, jump } = useRide()
  return (
    <ol>
      {stops.map((s, i) => (
        <li key={`${s.id}-${i}`} className={`lvl-${s.level === 1 ? 2 : 3}${i < here ? ' passed' : ''}${i === here ? ' here' : ''}`}>
          <a href={`#${s.id}`} onClick={(e) => { e.preventDefault(); jump(s.id); onPick?.() }}>{s.label}</a>
        </li>
      ))}
    </ol>
  )
}

/** Desktop table of contents drawn as a vertical line. */
export function RideSideMap() {
  const { stops } = useRide()
  if (stops.length === 0) return null
  return (
    <nav className="tr-side-card tr-sidemap" aria-label="Stops in this article">
      <span className="tr-eyebrow">This ride</span>
      <StopLinks />
    </nav>
  )
}

/** Mobile: floating "Stops" button with a progress ring, opens a sheet. */
export function RideFab({ tools }: { tools?: React.ReactNode }) {
  const { stops, progress } = useRide()
  const [open, setOpen] = useState(false)
  const C = 2 * Math.PI * 10

  return (
    <>
      <button type="button" className="tr-fab" onClick={() => setOpen(true)} aria-haspopup="dialog" aria-label="Stops and reading tools">
        <svg className="ring" viewBox="0 0 26 26" aria-hidden="true">
          <circle cx="13" cy="13" r="10" fill="none" stroke="currentColor" strokeOpacity=".25" strokeWidth="3.5" />
          <circle cx="13" cy="13" r="10" fill="none" stroke="var(--notice)" strokeWidth="3.5" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - progress)} transform="rotate(-90 13 13)" />
        </svg>
        {stops.length > 0 ? <><List size={16} /> Stops</> : `${Math.round(progress * 100)}%`}
      </button>
      {open && (
        <Modal label="Stops in this article" onClose={() => setOpen(false)}>
          <div className="tr-sheet">
            <div className="tr-sheet__grab" />
            <div className="tr-sheet__head">
              <h2 className="tr-display">This ride</h2>
              <button type="button" className="tr-icon-btn" onClick={() => setOpen(false)} aria-label="Close"><X size={18} /></button>
            </div>
            {tools && <div style={{ marginBottom: 16 }}>{tools}</div>}
            {stops.length > 0 && <div className="tr-sidemap"><StopLinks onPick={() => setOpen(false)} /></div>}
          </div>
        </Modal>
      )}
    </>
  )
}
