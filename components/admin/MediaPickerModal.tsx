'use client'
// components/admin/MediaPickerModal.tsx
import { useEffect, useState } from 'react'
import { X, Search, Check, Upload, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface MediaItem {
  id: number
  filename: string
  url: string
  mimeType: string
  fileSize: number
  width?: number | null
  height?: number | null
  altText?: string | null
  createdAt: string
}

interface Props {
  onSelect: (url: string, id?: number) => void
  onClose: () => void
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function MediaPickerModal({ onSelect, onClose }: Props) {
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<number | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/media?limit=100&mimeType=image')
        const data = await res.json()
        if (data.success) setItems(data.data.items ?? data.data ?? [])
      } catch {
        toast.error('Failed to load media')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = items.filter(
    (i) =>
      i.mimeType.startsWith('image/') &&
      (search === '' || i.filename.toLowerCase().includes(search.toLowerCase()))
  )

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/media', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.success) {
        setItems((prev) => [data.data, ...prev])
        setSelected(data.data.id)
        toast.success('Uploaded!')
      } else {
        toast.error(data.error ?? 'Upload failed')
      }
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const confirmSelect = () => {
    const item = items.find((i) => i.id === selected)
    if (item) {
      onSelect(item.url, item.id)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        className="w-full max-w-4xl max-h-[85vh] flex flex-col rounded-2xl overflow-hidden border shadow-2xl"
        style={{ background: 'var(--bg-elevated)', borderColor: 'var(--bg-border)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: 'var(--bg-border)' }}
        >
          <div>
            <h2 className="font-display font-bold text-base" style={{ color: 'var(--text-primary)' }}>
              Media Library
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Select an image or upload a new one
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Toolbar */}
        <div
          className="flex items-center gap-3 px-5 py-3 border-b"
          style={{ borderColor: 'var(--bg-border)', background: 'var(--bg-surface)' }}
        >
          <div className="flex items-center gap-2 flex-1 px-3 py-2 rounded-xl border"
            style={{ borderColor: 'var(--bg-border)', background: 'var(--bg-elevated)' }}>
            <Search size={14} style={{ color: 'var(--text-muted)' }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search images..."
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: 'var(--text-primary)' }}
            />
          </div>
          <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-colors hover:opacity-90"
            style={{ background: 'var(--color-violet)', color: '#fff' }}>
            {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
            Upload
            <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
          </label>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={28} className="animate-spin" style={{ color: 'var(--text-muted)' }} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {search ? 'No images match your search.' : 'No images in media library yet.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {filtered.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelected(item.id === selected ? null : item.id)}
                  className="group relative aspect-square rounded-xl overflow-hidden border-2 transition-all"
                  style={{
                    borderColor: selected === item.id ? 'var(--color-violet)' : 'var(--bg-border)',
                    outline: selected === item.id ? '2px solid var(--color-violet)' : 'none',
                    outlineOffset: '2px',
                  }}
                >
                  <img
                    src={item.url}
                    alt={item.altText ?? item.filename}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  {/* Selection overlay */}
                  {selected === item.id && (
                    <div className="absolute inset-0 flex items-center justify-center"
                      style={{ background: 'rgba(108,61,255,0.35)' }}>
                      <div className="w-7 h-7 rounded-full flex items-center justify-center"
                        style={{ background: 'var(--color-violet)' }}>
                        <Check size={14} className="text-white" />
                      </div>
                    </div>
                  )}
                  {/* Hover info */}
                  <div className="absolute bottom-0 left-0 right-0 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
                    <p className="text-white text-xs truncate font-medium">{item.filename}</p>
                    <p className="text-white/60 text-xs">{formatBytes(item.fileSize)}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-5 py-4 border-t"
          style={{ borderColor: 'var(--bg-border)', background: 'var(--bg-surface)' }}
        >
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {filtered.length} image{filtered.length !== 1 ? 's' : ''}
            {selected != null && ' · 1 selected'}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm border transition-colors hover:bg-gray-50"
              style={{ borderColor: 'var(--bg-border)', color: 'var(--text-secondary)' }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmSelect}
              disabled={selected == null}
              className="px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-40 transition-colors"
              style={{ background: 'var(--color-violet)', color: '#fff' }}
            >
              Use Image
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
