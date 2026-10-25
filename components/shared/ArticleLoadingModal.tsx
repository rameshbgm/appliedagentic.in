'use client'
// components/shared/ArticleLoadingModal.tsx — a hairline progress rule while a page loads
export default function ArticleLoadingModal({ completing }: { completing: boolean }) {
  return (
    <div className={`a-loading${completing ? ' done' : ''}`} role="status" aria-label="Loading page">
      <span />
    </div>
  )
}
