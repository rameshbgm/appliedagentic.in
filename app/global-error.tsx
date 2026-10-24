'use client'
// app/global-error.tsx
// Last-resort handler for errors that escape the root layout. Styles are inline
// because the global stylesheet may not have loaded.

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: ErrorProps) {
  return (
    <html lang="en">
      <body style={{ margin: 0, minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 16, background: '#F1F4F2', color: '#12161C', fontFamily: '"Public Sans", system-ui, sans-serif' }}>
        <div style={{ maxWidth: 520 }}>
          <svg width="56" height="56" viewBox="0 0 34 34" aria-hidden="true">
            <path d="M4 26 L14 16 L22 16 L30 8" fill="none" stroke="#0A6BD0" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4 10 L14 16" fill="none" stroke="#DA2C25" strokeWidth="5" strokeLinecap="round" />
            <circle cx="14" cy="16" r="5" fill="#fff" stroke="#12161C" strokeWidth="3" />
          </svg>
          <p style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12, letterSpacing: '.12em', textTransform: 'uppercase', color: '#66707C', margin: '18px 0 6px' }}>Service disruption</p>
          <h1 style={{ fontSize: 34, lineHeight: 1.05, margin: '0 0 12px', textTransform: 'uppercase', fontWeight: 900 }}>The whole network is down for a moment.</h1>
          <p style={{ color: '#444C57', lineHeight: 1.6, margin: '0 0 20px' }}>
            The application hit an unexpected error. Try again in a few seconds.
            {error.digest && <> Reference code: <code>{error.digest}</code></>}
          </p>
          <button type="button" onClick={reset} style={{ minHeight: 46, padding: '0 22px', borderRadius: 999, border: '2px solid #12161C', background: '#12161C', color: '#F1F4F2', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
