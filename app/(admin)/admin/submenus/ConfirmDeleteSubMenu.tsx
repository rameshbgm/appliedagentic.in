'use client'
// app/(admin)/admin/submenus/ConfirmDeleteSubMenu.tsx
import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function ConfirmDeleteSubMenu({
  id,
  name,
  onDeleted,
}: {
  id: number
  name: string
  onDeleted?: () => void
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/submenus/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success('Sub-menu deleted')
        if (onDeleted) {
          onDeleted()
        } else {
          router.refresh()
        }
      } else {
        toast.error(data.error ?? 'Delete failed')
      }
    } finally {
      setLoading(false)
      setOpen(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-2 rounded-xl hover:bg-red-500/10 transition-colors"
        title="Delete"
      >
        <Trash2 size={16} className="text-red-400" />
      </button>

      {open && (
        <div
          className="absolute bottom-full right-0 mb-2 z-50 w-60 rounded-xl shadow-2xl p-3"
          style={{ background: 'var(--bg-elevated)', border: '1px solid rgba(239,68,68,0.35)' }}
        >
          <p className="text-xs font-bold mb-0.5" style={{ color: 'var(--text-primary)' }}>
            Delete sub-menu?
          </p>
          <p className="text-[11px] mb-3 truncate" style={{ color: 'var(--text-muted)' }}>
            &ldquo;{name}&rdquo;
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              disabled={loading}
              className="flex-1 py-1.5 rounded-lg text-xs font-semibold text-white transition-colors disabled:opacity-50"
              style={{ background: '#ef4444' }}
            >
              {loading ? '…' : 'Delete'}
            </button>
            <button
              onClick={() => setOpen(false)}
              disabled={loading}
              className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={{ background: 'var(--bg-border)', color: 'var(--text-secondary)' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
