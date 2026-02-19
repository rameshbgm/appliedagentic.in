'use client'
// components/admin/MediaGrid.tsx
import { useState } from 'react'
import { Trash2, Download, Copy, Check } from 'lucide-react'
import { toast } from 'sonner'
import ConfirmDialog from '@/components/shared/ConfirmDialog'

interface MediaItem {
  id: number
  filename: string
  url: string
  mimeType: string
  fileSize: number
  width?: number | null
  height?: number | null
  createdAt: string
}

interface Props {
  items: MediaItem[]
  onDeleted: (id: number) => void
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function MediaGrid({ items, onDeleted }: Props) {
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [copiedId, setCopiedId] = useState<number | null>(null)

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/media/${deleteId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        onDeleted(deleteId)
        toast.success('File deleted')
      } else {
        toast.error(data.error ?? 'Delete failed')
      }
    } finally {
      setDeleting(false)
      setDeleteId(null)
    }
  }

  const copyUrl = async (id: number, url: string) => {
    await navigator.clipboard.writeText(url)
    setCopiedId(id)
    toast.success('URL copied!')
    setTimeout(() => setCopiedId(null), 2000)
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20" style={{ color: 'var(--text-muted)' }}>
        <p className="text-lg font-display font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>No media files yet</p>
        <p className="text-sm">Upload images, audio, or video files using the uploader above.</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {items.map((item) => {
          const isImage = item.mimeType.startsWith('image/')
          const isAudio = item.mimeType.startsWith('audio/')

          return (
            <div
              key={item.id}
              className="group relative rounded-2xl overflow-hidden border"
              style={{ background: 'var(--bg-elevated)', borderColor: 'var(--bg-border)' }}
            >
              {/* Preview */}
              <div className="aspect-square w-full" style={{ background: 'var(--bg-surface)' }}>
                {isImage ? (
                  <img src={item.url} alt={item.filename} className="w-full h-full object-cover" />
                ) : isAudio ? (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                    <span className="text-3xl">🎵</span>
                    <audio src={item.url} controls className="w-full px-2" />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-3xl">📄</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-2">
                <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{item.filename}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {formatBytes(item.fileSize)}
                  {item.width && item.height && ` · ${item.width}×${item.height}`}
                </p>
              </div>

              {/* Actions overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => copyUrl(item.id, item.url)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                  title="Copy URL"
                >
                  {copiedId === item.id ? <Check size={14} className="text-green-400" /> : <Copy size={14} className="text-white" />}
                </button>
                <a
                  href={item.url}
                  download={item.filename}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                  title="Download"
                >
                  <Download size={14} className="text-white" />
                </a>
                <button
                  onClick={() => setDeleteId(item.id)}
                  className="p-2 rounded-xl bg-red-500/30 hover:bg-red-500/50 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={14} className="text-red-300" />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete File"
        message="This will permanently delete the file. Articles using this file may break."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
      />
    </>
  )
}
