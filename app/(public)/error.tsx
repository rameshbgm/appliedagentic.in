'use client'
// app/(public)/error.tsx — "Service disruption" boundary for public pages.
import { useEffect } from 'react'
import Link from 'next/link'
import { RotateCcw } from 'lucide-react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function PublicError({ error, reset }: ErrorProps) {
  useEffect(() => { console.warn('[PublicError boundary]', error.message, error.digest) }, [error])

  return (
    <div className="tr-wrap tr-lost">
      <span className="tr-status"><span className="dot" style={{ background: 'var(--l1)' }} /><span className="tr-eyebrow">Service disruption</span></span>
      <span className="code" aria-hidden="true">500</span>
      <h1 className="tr-display">This line is temporarily closed.</h1>
      <p>
        This page could not load. Check your connection and try again, or return to the network map.
        {error.digest && <> Reference code: <code>{error.digest}</code></>}
      </p>
      <div className="tr-ctas">
        <button type="button" className="tr-btn tr-btn--primary" onClick={reset}>
          <RotateCcw size={16} /> Try again
        </button>
        <Link href="/" className="tr-btn">Network map</Link>
      </div>
    </div>
  )
}
