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
    <div className="p-wrap p-lost">
      <span className="p-lost__code" aria-hidden="true"><span>5</span><span>0</span><span>0</span></span>
      <h1 className="p-display">Something broke.</h1>
      <p>
        This page could not load. Try again, or we will take you home in {left}s.
        {error.digest && <> Reference code: <code>{error.digest}</code></>}
      </p>
      <div className="p-lost__bar" aria-hidden="true"><span style={{ width: `${((SECONDS - left) / SECONDS) * 100}%` }} /></div>
      <div className="p-ctas">
        <button type="button" className="p-btn p-btn--fill" onClick={() => { setLeft(SECONDS); reset() }}>
          <RotateCcw size={17} /> Try again
        </button>
        <Link href="/" className="p-btn">Go home</Link>
      </div>
    </div>
  )
}
