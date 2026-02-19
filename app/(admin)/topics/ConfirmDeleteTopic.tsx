'use client'
// app/(admin)/topics/ConfirmDeleteTopic.tsx
import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import ConfirmDialog from '@/components/shared/ConfirmDialog'

export default function ConfirmDeleteTopic({ id, name }: { id: number; name: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/topics/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) { toast.success('Topic deleted'); router.refresh() }
      else toast.error(data.error ?? 'Delete failed')
    } finally { setLoading(false); setOpen(false) }
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors">
        <Trash2 size={14} className="text-red-400" />
      </button>
      <ConfirmDialog
        open={open}
        title="Delete Topic"
        message={`Are you sure you want to delete "${name}"?`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setOpen(false)}
        loading={loading}
      />
    </>
  )
}
