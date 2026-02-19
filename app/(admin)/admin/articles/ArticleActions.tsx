'use client'
// app/(admin)/articles/ArticleActions.tsx
import { useState } from 'react'
import { Copy, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import ConfirmDialog from '@/components/shared/ConfirmDialog'

export default function ArticleActions({ id, title }: { id: number; title: string }) {
  const router = useRouter()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDuplicate = async () => {
    const res = await fetch(`/api/articles/${id}/duplicate`, { method: 'POST' })
    const data = await res.json()
    if (data.success) { toast.success('Article duplicated as draft'); router.refresh() }
    else toast.error(data.error ?? 'Duplicate failed')
  }

  const handleDelete = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/articles/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) { toast.success('Article deleted'); router.refresh() }
      else toast.error(data.error ?? 'Delete failed')
    } finally { setLoading(false); setDeleteOpen(false) }
  }

  return (
    <>
      <button onClick={handleDuplicate} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" title="Duplicate">
        <Copy size={14} style={{ color: 'var(--text-muted)' }} />
      </button>
      <button onClick={() => setDeleteOpen(true)} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors" title="Delete">
        <Trash2 size={14} className="text-red-400" />
      </button>
      <ConfirmDialog
        open={deleteOpen}
        title="Delete Article"
        message={`Are you sure you want to delete "${title}"?`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
        loading={loading}
      />
    </>
  )
}
