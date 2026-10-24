'use client'
// components/pulse/Effects.tsx
// One delegated pointer listener drives two hover effects on fine-pointer devices:
//   [data-spot] — a colour spotlight that follows the cursor (sets --mx/--my)
//   [data-tilt] — a gentle 3D tilt toward the cursor (sets --rx/--ry)
import { useEffect } from 'react'

export default function Effects() {
  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let last: HTMLElement | null = null
    let raf = 0

    const reset = (el: HTMLElement | null) => {
      if (!el) return
      el.style.removeProperty('--rx')
      el.style.removeProperty('--ry')
    }

    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const target = (e.target as HTMLElement | null)?.closest<HTMLElement>('[data-spot], [data-tilt]') ?? null
        if (last && last !== target) reset(last)
        last = target
        if (!target) return
        const r = target.getBoundingClientRect()
        const x = (e.clientX - r.left) / r.width
        const y = (e.clientY - r.top) / r.height
        if (target.hasAttribute('data-spot')) {
          target.style.setProperty('--mx', `${x * 100}%`)
          target.style.setProperty('--my', `${y * 100}%`)
        }
        if (target.hasAttribute('data-tilt')) {
          target.style.setProperty('--rx', `${(0.5 - y) * 7}deg`)
          target.style.setProperty('--ry', `${(x - 0.5) * 9}deg`)
        }
      })
    }
    const onLeave = () => { reset(last); last = null }

    document.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerleave', onLeave)
    return () => {
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
      cancelAnimationFrame(raf)
    }
  }, [])

  return null
}
