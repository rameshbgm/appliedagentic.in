'use client'
// app/(public)/error.tsx
// Error boundary for all public pages.
// Rendered by Next.js when any async Server Component in this route group throws.

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function PublicError({ error, reset }: ErrorProps) {
  const router = useRouter()
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    console.warn('[PublicError boundary]', error.message, error.digest)
  }, [error])

  // Auto-redirect to home after countdown reaches 0
  useEffect(() => {
    if (countdown <= 0) {
      router.replace('/')
      return
    }
    const t = setInterval(() => setCountdown((c) => c - 1), 1000)
    return () => clearInterval(t)
  }, [countdown, router])

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

        {/* Countdown notice */}
        <p className="text-sm opacity-50">
          Redirecting to home in{' '}
          <span className="font-bold" style={{ color: 'var(--green)' }}>{countdown}</span>s…
        </p>

        {/* Progress bar */}
        <div
          className="w-full h-0.5 rounded-full overflow-hidden"
          style={{ background: 'var(--bg-border)' }}
        >
          <div
            className="h-full rounded-full transition-none"
            style={{
              width: `${((5 - countdown) / 5) * 100}%`,
              background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
              transition: 'width 0.9s linear',
            }}
          />
        </div>

        <div className="flex gap-3 justify-center flex-wrap">
          <button
            onClick={() => { setCountdown(5); reset() }}
            className="px-5 py-2 rounded-lg text-sm font-medium border border-white/20 hover:bg-white/10 transition"
          >
            Try again
          </button>
          <Link
            href="/"
            className="px-5 py-2 rounded-lg text-sm font-medium text-white hover:opacity-90 transition"
            style={{ background: '#1E293B' }}
          >
            Go home now
          </Link>
        </div>
      </div>
    </div>
  )
}
