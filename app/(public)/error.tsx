'use client'
// app/(public)/error.tsx — error boundary for public pages
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { RotateCcw } from 'lucide-react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

const SECONDS = 8

export default function PublicError({ error, reset }: ErrorProps) {
  const router = useRouter()
  const [left, setLeft] = useState(SECONDS)
  useEffect(() => { console.warn('[PublicError boundary]', error.message, error.digest) }, [error])
  useEffect(() => {
    if (left <= 0) { router.replace('/'); return }
    const t = setTimeout(() => setLeft((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [left, router])

  return (
    <div className="f-wrap f-lost">
      <span className="f-lost__num" aria-hidden="true" style={{ fontSize: "clamp(3.6rem, 18vw, 8rem)" }}>Erratum</span>
      <h1 className="f-display">This page could not be printed.</h1>
      <p>
        Something went wrong while loading it. Try again, or we will take you to the front page in {left}s.
        {error.digest && <> Reference: <code>{error.digest}</code></>}
      </p>
      <div className="f-lost__bar" aria-hidden="true"><span style={{ width: `${((SECONDS - left) / SECONDS) * 100}%` }} /></div>
      <div className="f-ctas" style={{ justifyContent: 'center' }}>
        <button type="button" className="f-btn f-btn--ink" onClick={() => { setLeft(SECONDS); reset() }}><RotateCcw size={16} /> Try again</button>
        <Link href="/" className="f-btn">Front page</Link>
      </div>
    </div>
  )
}
