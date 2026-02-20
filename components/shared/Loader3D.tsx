'use client'
// components/shared/Loader3D.tsx
import { useEffect, useState } from 'react'

const DOTS = [
  '#FF6B6B',
  '#FF8E53',
  '#FFCC00',
  '#4ADE80',
  '#22D3EE',
  '#818CF8',
  '#E879F9',
  '#F43F5E',
  '#AAFF00',
  '#00C2FF',
]

export default function Loader3D() {
  const [visible, setVisible] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const seen = sessionStorage.getItem('aa_loader_seen')
    if (seen) return

    setVisible(true)

    const t1 = setTimeout(() => setFadeOut(true), 1400)
    const t2 = setTimeout(() => {
      setVisible(false)
      sessionStorage.setItem('aa_loader_seen', '1')
    }, 1950)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [])

  if (!visible) return null

  return (
    <div
      className={`fixed inset-0 z-[99999] flex items-center justify-center transition-opacity duration-500 ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{ background: 'var(--bg-base)' }}
    >
      <div className="flex items-center gap-2">
        {DOTS.map((color, i) => (
          <div
            key={i}
            className="rounded-full animate-bounce"
            style={{
              width: '11px',
              height: '11px',
              background: color,
              boxShadow: `0 0 10px ${color}, 0 0 20px ${color}55`,
              animationDelay: `${i * 0.07}s`,
              animationDuration: '0.9s',
            }}
          />
        ))}
      </div>
    </div>
  )
}

