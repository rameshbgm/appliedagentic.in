// app/(public)/loading.tsx — shown while a public page streams in
export default function Loading() {
  return (
    <div className="p-wrap" aria-busy="true" aria-label="Loading" style={{ paddingBlock: 24, display: 'grid', gap: 16 }}>
      <div className="skeleton" style={{ height: 220, borderRadius: 36 }} />
      <div className="skeleton" style={{ height: 22, width: 'min(420px, 80%)' }} />
      <div style={{ display: 'grid', gap: 12, marginTop: 8 }}>
        {[0, 1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 22 }} />)}
      </div>
    </div>
  )
}
