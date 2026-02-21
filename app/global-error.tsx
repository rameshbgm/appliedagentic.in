'use client'
// app/global-error.tsx
// Catches errors that escape ALL route segments, including the root layout.
// This is the last-resort error handler.

import { useEffect } from 'react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('[GlobalError boundary]', error.message, error.digest)
  }, [error])

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          background: '#0A0A0F',
          color: '#fff',
          fontFamily: 'system-ui, sans-serif',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '1rem',
        }}
      >
        <div style={{ maxWidth: 480, textAlign: 'center' }}>
          <div style={{ fontSize: 64, fontWeight: 700, opacity: 0.15 }}>500</div>
          <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 12 }}>
            Unexpected error
          </h1>
          <p style={{ opacity: 0.6, fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
            The application encountered an unexpected error.
            {error.digest && (
              <>
                {' '}Error reference:{' '}
                <code
                  style={{
                    fontFamily: 'monospace',
                    fontSize: 12,
                    background: 'rgba(255,255,255,0.1)',
                    padding: '2px 6px',
                    borderRadius: 4,
                  }}
                >
                  {error.digest}
                </code>
              </>
            )}
          </p>
          <button
            onClick={reset}
            style={{
              padding: '8px 24px',
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'transparent',
              color: '#fff',
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  )
}
