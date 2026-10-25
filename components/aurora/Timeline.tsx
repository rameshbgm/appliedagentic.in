'use client'
// components/aurora/Timeline.tsx — a path's milestones on a line that fills as you scroll
import { useEffect, useRef } from 'react'

export default function Timeline({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let raf = 0
    const update = () => {
      const r = el.getBoundingClientRect()
      // The line is "lit" up to the middle of the viewport
      const p = (window.innerHeight * 0.55 - r.top) / Math.max(1, r.height)
      el.style.setProperty('--tp', Math.min(1, Math.max(0, p)).toFixed(4))
    }
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); cancelAnimationFrame(raf) }
  }, [])

  return (
    <div className="a-timeline" ref={ref}>
      <span className="a-timeline__fill" aria-hidden="true" />
      {children}
    </div>
  )
}
