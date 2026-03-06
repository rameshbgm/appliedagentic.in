'use client'
// components/public/ReadingProgressBar.tsx
import { useEffect, useState } from 'react'

export default function ReadingProgressBar() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const update = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      if (docHeight <= 0) return
      setProgress(Math.min(100, (scrollTop / docHeight) * 100))
    }
    window.addEventListener('scroll', update, { passive: true })
    update()
    return () => window.removeEventListener('scroll', update)
  }, [])

  if (progress <= 0) return null

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[100] h-[3px]"
      style={{ background: 'transparent' }}
    >
      <div
        className="h-full transition-[width] duration-150 ease-out"
        style={{
          width: `${progress}%`,
          background: 'var(--green)',
          boxShadow: '0 0 8px var(--green)',
        }}
      />
    </div>
  )
}
