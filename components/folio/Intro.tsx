'use client'
// components/folio/Intro.tsx — the masthead writes itself in on the first visit of a session
import { useEffect, useState } from 'react'

export default function Intro() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    try {
      if (sessionStorage.getItem('folio-intro')) return
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      sessionStorage.setItem('folio-intro', '1')
    } catch { return }
    setShow(true)
    const t = setTimeout(() => setShow(false), 1900)
    return () => clearTimeout(t)
  }, [])
  if (!show) return null
  return (
    <div className="f-intro" aria-hidden="true" onClick={() => setShow(false)}>
      <div><b>Applied Agentic</b><i /></div>
    </div>
  )
}
