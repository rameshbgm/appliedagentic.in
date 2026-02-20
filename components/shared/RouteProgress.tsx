'use client'
// components/shared/RouteProgress.tsx
// Gradient top-loading bar that animates on every route navigation.

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

export default function RouteProgress() {
  const pathname = usePathname()
  const [progress, setProgress]   = useState(0)
  const [opacity, setOpacity]     = useState(0)
  const [running, setRunning]     = useState(false)
  const intervalRef               = useRef<ReturnType<typeof setInterval> | null>(null)
  const prevPathRef               = useRef(pathname)

  // Start the bar whenever a <a> / Next Link is clicked
  useEffect(() => {
    const onLinkClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a')
      if (!target) return
      const href = target.getAttribute('href')
      if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto')) return
      startBar()
    }
    document.addEventListener('click', onLinkClick)
    return () => document.removeEventListener('click', onLinkClick)
  }, [])

  // Complete the bar when pathname actually changes
  useEffect(() => {
    if (pathname !== prevPathRef.current) {
      prevPathRef.current = pathname
      completeBar()
    }
  }, [pathname])

  function startBar() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setProgress(0)
    setOpacity(1)
    setRunning(true)

    // Quickly move to ~70%, slow down, wait for completion
    let current = 0
    intervalRef.current = setInterval(() => {
      current += current < 30  ? 6
               : current < 55  ? 3
               : current < 70  ? 1.5
               :                 0.3
      if (current >= 90) {
        clearInterval(intervalRef.current!)
        intervalRef.current = null
      }
      setProgress(Math.min(current, 90))
    }, 60)
  }

  function completeBar() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = null
    setProgress(100)
    setRunning(false)
    // Fade out after bar reaches 100%
    setTimeout(() => setOpacity(0), 300)
    setTimeout(() => setProgress(0), 700)
  }

  return (
    <>
      {/* Top progress bar */}
      <div
        style={{
          position:   'fixed',
          top:        0,
          left:       0,
          height:     '3px',
          width:      `${progress}%`,
          opacity,
          zIndex:     99999,
          transition: running
            ? 'width 0.25s ease-out, opacity 0.35s ease'
            : 'width 0.3s ease, opacity 0.35s ease',
          background: 'linear-gradient(90deg, #7C3AED 0%, #00D4FF 50%, #7C3AED 100%)',
          backgroundSize: '200% 100%',
          animation: running ? 'progress-shimmer 1.2s linear infinite' : 'none',
          boxShadow: '0 0 10px rgba(0,212,255,0.6), 0 0 20px rgba(124,58,237,0.4)',
        }}
      />

      {/* Spinner dot at right end of bar */}
      {running && progress > 5 && (
        <div
          style={{
            position:     'fixed',
            top:          '-3px',
            left:         `calc(${progress}% - 6px)`,
            width:        '12px',
            height:       '12px',
            borderRadius: '50%',
            background:   '#00D4FF',
            boxShadow:    '0 0 12px #00D4FF, 0 0 24px rgba(0,212,255,0.5)',
            zIndex:       99999,
            opacity,
            transition:   'left 0.25s ease-out, opacity 0.35s ease',
            animation:    'progress-dot-pulse 0.8s ease-in-out infinite',
          }}
        />
      )}

      <style>{`
        @keyframes progress-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: 0%   0; }
        }
        @keyframes progress-dot-pulse {
          0%, 100% { transform: scale(1);   opacity: 1;   }
          50%       { transform: scale(1.4); opacity: 0.7; }
        }
      `}</style>
    </>
  )
}
