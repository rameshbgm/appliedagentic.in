'use client'
// components/aurora/Sky.tsx
// The aurora behind every page: three slow colour fields, a few stars and film
// grain. On devices with a fine pointer the sky leans gently away from it.
import { useEffect, useRef } from 'react'

export default function Sky() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!window.matchMedia('(pointer: fine)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let raf = 0
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        el.style.setProperty('--px', ((e.clientX / window.innerWidth) * 2 - 1).toFixed(3))
        el.style.setProperty('--py', ((e.clientY / window.innerHeight) * 2 - 1).toFixed(3))
      })
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => { window.removeEventListener('pointermove', onMove); cancelAnimationFrame(raf) }
  }, [])

  return (
    <div className="a-sky" ref={ref} aria-hidden="true">
      <div className="a-sky__layer">
        <span className="a-sky__blob" />
        <span className="a-sky__blob" />
        <span className="a-sky__blob" />
      </div>
      <div className="a-sky__stars" />
      <div className="a-sky__grain" />
    </div>
  )
}

/** Four-point star used as the logo mark. */
export function StarMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 1.5c.5 4.9 2.2 7.6 3.9 8.7 1.4.9 3.6 1.5 6.6 1.8-3 .3-5.2.9-6.6 1.8-1.7 1.1-3.4 3.8-3.9 8.7-.5-4.9-2.2-7.6-3.9-8.7C6.7 12.9 4.5 12.3 1.5 12c3-.3 5.2-.9 6.6-1.8C9.8 9.1 11.5 6.4 12 1.5Z" />
    </svg>
  )
}
