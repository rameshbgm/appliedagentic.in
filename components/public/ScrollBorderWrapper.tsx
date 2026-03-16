'use client'
// Shows a gradient border only when the content actually overflows (scrollbar visible)
import { useRef, useState, useEffect } from 'react'

interface Props {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

export default function ScrollBorderWrapper({ children, className, style }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [hasScroll, setHasScroll] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const check = () => setHasScroll(el.scrollHeight > el.clientHeight)

    check()
    // Re-check on resize (e.g. orientation change on mobile)
    const ro = new ResizeObserver(check)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        border: '1px solid transparent',
        background: hasScroll
          ? 'linear-gradient(var(--bg-surface), var(--bg-surface)) padding-box, linear-gradient(135deg, #34d399 0%, #38bdf8 40%, #818cf8 70%, #ec4899 100%) border-box'
          : undefined,
      }}
    >
      {children}
    </div>
  )
}
