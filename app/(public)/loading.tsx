// app/(public)/loading.tsx — shown while a public page streams in
export default function Loading() {
  return (
    <div className="tr-wrap" aria-busy="true" aria-label="Loading" style={{ paddingBlock: 32, display: 'grid', gap: 16 }}>
      <div className="skeleton" style={{ height: 14, width: 160 }} />
      <div className="skeleton" style={{ height: 56, width: 'min(560px, 90%)' }} />
      <div className="skeleton" style={{ height: 18, width: 'min(420px, 80%)' }} />
      <div style={{ display: 'grid', gap: 12, marginTop: 16 }}>
        {[0, 1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 72 }} />)}
      </div>
    </div>
  )
}
