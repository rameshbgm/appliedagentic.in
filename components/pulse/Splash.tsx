'use client'
// components/pulse/Splash.tsx
// First-visit intro: the wordmark stretches, then four colour bars wipe away
// (about 1.5 s, once per session, skipped for reduced motion; tap to skip).
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
    const t = setTimeout(() => setShow(false), 1650)
    return () => clearTimeout(t)
  }, [])

  if (!show) return null
  return (
    <div className="p-splash" aria-hidden="true" onClick={() => setShow(false)}>
      {[0, 1, 2, 3].map((i) => <i key={i} style={{ '--i': i } as React.CSSProperties} />)}
      <b>Applied Agentic</b>
    </div>
  )
}
