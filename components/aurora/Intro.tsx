'use client'
// components/aurora/Intro.tsx — on the first visit of a session a star lights up and the name blurs in
import { useEffect, useState } from 'react'
import { StarMark } from './Sky'

export default function Intro() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    try {
      if (sessionStorage.getItem('aa-intro')) return
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      sessionStorage.setItem('aa-intro', '1')
    } catch { return }
    setShow(true)
    const t = setTimeout(() => setShow(false), 2300)
    return () => clearTimeout(t)
  }, [])
  if (!show) return null
  return (
    <div className="a-intro" aria-hidden="true" onClick={() => setShow(false)}>
      <div>
        <StarMark size={44} />
        <b>{['Applied', 'Agentic'].map((w, i) => <span key={w}><span className="w" style={{ '--i': i } as React.CSSProperties}>{w}</span>{i === 0 ? ' ' : ''}</span>)}</b>
      </div>
    </div>
  )
}
