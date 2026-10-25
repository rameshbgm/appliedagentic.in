// app/(public)/loading.tsx — shown while a public page streams in
export default function Loading() {
  return (
    <div className="a-wrap a-narrow" aria-busy="true" aria-label="Loading" style={{ paddingBlock: 48, display: 'grid', gap: 18, justifyItems: 'center' }}>
      <div className="skeleton" style={{ height: 14, width: 140 }} />
      <div className="skeleton" style={{ height: 52, width: 'min(560px, 90%)' }} />
      <div className="skeleton" style={{ height: 20, width: 'min(420px, 80%)' }} />
      <div style={{ display: 'grid', gap: 12, width: '100%', marginTop: 20 }}>
        {[0, 1, 2, 3, 4].map((i) => <div key={i} className="skeleton" style={{ height: 18, width: `${92 - i * 7}%` }} />)}
      </div>
    </div>
  )
}
