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
      <body style={{ margin: 0, minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 16, background: '#FAF9F6', color: '#1C1B1F', fontFamily: 'Georgia, serif' }}>
        <div style={{ maxWidth: 520 }}>
          <p style={{ fontStyle: 'italic', fontSize: 28, margin: 0 }} aria-hidden="true">Applied Agentic</p>
          <p style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12, letterSpacing: '.12em', textTransform: 'uppercase', color: '#6B6E80', margin: '18px 0 6px' }}>Service disruption</p>
          <h1 style={{ fontSize: 34, lineHeight: 1.05, margin: '0 0 12px', fontWeight: 400 }}>Something went wrong.</h1>
          <p style={{ color: '#3D4050', lineHeight: 1.6, margin: '0 0 20px' }}>
            The application hit an unexpected error. Try again in a few seconds.
            {error.digest && <> Reference code: <code>{error.digest}</code></>}
          </p>
          <button type="button" onClick={reset} style={{ minHeight: 46, padding: '0 22px', borderRadius: 999, border: '1px solid #1C1B1F', background: '#1C1B1F', color: '#FAF9F6', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
