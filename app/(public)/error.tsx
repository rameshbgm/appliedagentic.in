'use client'
// app/(public)/error.tsx
// Error boundary for all public pages.
// Rendered by Next.js when any async Server Component in this route group throws.

import { useEffect } from 'react'
import Link from 'next/link'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function PublicError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Use console.warn — the error is already caught and rendered by this
    // boundary. console.error would re-trigger Next.js error overlay on top
    // of the error UI, causing duplicate/confusing error reports.
    // In production, Next.js already logs the error server-side with the digest.
    console.warn('[PublicError boundary]', error.message, error.digest)
  }, [error])

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--bg-primary, #FFFFFF)', color: 'var(--text-primary, #111827)' }}
    >
      <div className="max-w-lg w-full text-center space-y-6">
        <div className="text-6xl font-bold opacity-20">500</div>
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
        <p className="opacity-60 text-sm leading-relaxed">
          A server error occurred while loading this page.
          {error.digest && (
            <>
              {' '}
              If you need to report this, share error code:{' '}
              <code className="font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded">
                {error.digest}
              </code>
            </>
          )}
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <button
            onClick={reset}
            className="px-5 py-2 rounded-lg text-sm font-medium border border-white/20 hover:bg-white/10 transition"
          >
            Try again
          </button>
          <Link
            href="/"
            className="px-5 py-2 rounded-lg text-sm font-medium text-white hover:opacity-90 transition"
            style={{ background: '#1E293B' }}
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  )
}
