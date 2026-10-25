'use client'
// components/transit/Splash.tsx
// First-visit intro: three lines draw into the network mark (about 1.5 s, once per session).
import { useEffect, useState } from 'react'

export default function Splash() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    try {
      if (sessionStorage.getItem('aa-splash')) return
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      sessionStorage.setItem('aa-splash', '1')
    } catch { return }
    setShow(true)
    const t = setTimeout(() => setShow(false), 1800)
    return () => clearTimeout(t)
  }, [])

  if (!show) return null
  return (
    <div className="tr-splash" aria-hidden="true" onClick={() => setShow(false)}>
      <div>
        <svg viewBox="0 0 160 110">
          <path d="M10 90 L60 50 L100 50 L150 12" fill="none" stroke="var(--l2)" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14 18 L60 50" fill="none" stroke="var(--l1)" strokeWidth="12" strokeLinecap="round" />
          <path d="M60 50 L88 100" fill="none" stroke="var(--l3)" strokeWidth="12" strokeLinecap="round" />
          <circle cx="60" cy="50" r="14" fill="var(--card)" stroke="var(--ink)" strokeWidth="7" />
        </svg>
        <p>Applied Agentic</p>
      </div>
    </div>
  )
}
