'use client'
// app/(admin)/admin/error.tsx
// Error boundary for all admin panel pages.

import { useEffect } from 'react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function AdminError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('[AdminError boundary]', error.message, error.digest)
  }, [error])

  return (
    <div
      className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-white"
    >
      <div className="text-5xl font-bold opacity-20">Error</div>
      <h2 className="text-xl font-semibold">Admin panel error</h2>
      <p className="text-sm opacity-60 max-w-md text-center">
        A server-side error occurred.
        {error.digest && (
          <span>
            {' '}Reference:{' '}
            <code className="font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded">
              {error.digest}
            </code>
          </span>
        )}
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-4 py-2 rounded border border-white/20 text-sm hover:bg-white/10 transition"
        >
          Retry
        </button>
      </div>
    </div>
  )
}
