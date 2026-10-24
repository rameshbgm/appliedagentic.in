'use client'
// components/shared/ArticleLoadingModal.tsx
// Route-change indicator: four colour bars racing across the top of the screen.
interface Props {
  completing: boolean
}

export default function ArticleLoadingModal({ completing }: Props) {
  return (
    <div className={`p-loading${completing ? ' done' : ''}`} role="status" aria-label="Loading page">
      <i /><i /><i /><i />
    </div>
  )
}
