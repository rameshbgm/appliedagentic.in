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
      <body style={{ margin: 0, minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 16, background: '#F4F5F9', color: '#0D0D14', fontFamily: '"Hanken Grotesk", system-ui, sans-serif' }}>
        <div style={{ maxWidth: 520 }}>
          <div style={{ display: 'flex', gap: 6 }} aria-hidden="true">
            {['#2D44FF', '#D63A17', '#FFC61F', '#1FC48C'].map((c) => <span key={c} style={{ width: 18, height: 18, borderRadius: 6, background: c }} />)}
          </div>
          <p style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12, letterSpacing: '.12em', textTransform: 'uppercase', color: '#6B6E80', margin: '18px 0 6px' }}>Service disruption</p>
          <h1 style={{ fontSize: 34, lineHeight: 1.05, margin: '0 0 12px', textTransform: 'uppercase', fontWeight: 900 }}>Something went wrong.</h1>
          <p style={{ color: '#3D4050', lineHeight: 1.6, margin: '0 0 20px' }}>
            The application hit an unexpected error. Try again in a few seconds.
            {error.digest && <> Reference code: <code>{error.digest}</code></>}
          </p>
          <button type="button" onClick={reset} style={{ minHeight: 46, padding: '0 22px', borderRadius: 999, border: '2px solid #0D0D14', background: '#0D0D14', color: '#F4F5F9', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
