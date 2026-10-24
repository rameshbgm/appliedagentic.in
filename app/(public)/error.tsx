'use client'
// app/(public)/error.tsx — "Service disruption" boundary for public pages.
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
    <div className="tr-wrap tr-lost">
      <span className="tr-status"><span className="dot" style={{ background: 'var(--l1)' }} /><span className="tr-eyebrow">Service disruption</span></span>
      <span className="code" aria-hidden="true">500</span>
      <h1 className="tr-display">This line is temporarily closed.</h1>
      <p>
        Something went wrong while loading this page. Try again, or we will take you back to the network map in {left}s.
        {error.digest && <> Reference code: <code>{error.digest}</code></>}
      </p>
      <div className="track" aria-hidden="true"><span style={{ width: `${((SECONDS - left) / SECONDS) * 100}%` }} /></div>
      <div className="tr-ctas">
        <button type="button" className="tr-btn tr-btn--primary" onClick={() => { setLeft(SECONDS); reset() }}>
          <RotateCcw size={16} /> Try again
        </button>
        <Link href="/" className="tr-btn">Network map</Link>
      </div>
    </div>
  )
}
