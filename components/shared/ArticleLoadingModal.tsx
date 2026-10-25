'use client'
// components/shared/ArticleLoadingModal.tsx
// Route-change indicator: a multi-line progress rail with a "Departing" chip.
interface Props {
  completing: boolean
}

export default function ArticleLoadingModal({ completing }: Props) {
  return (
    <div className={`tr-departing${completing ? ' done' : ''}`} role="status" aria-live="polite">
      <div className="tr-departing__bar" />
      {!completing && (
        <span className="tr-departing__chip"><i aria-hidden="true" />Departing</span>
      )}
    </div>
  )
}
