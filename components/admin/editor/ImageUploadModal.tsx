'use client'
// components/admin/editor/ImageUploadModal.tsx
import { useState, useRef } from 'react'
import { Upload, Image as ImageIcon, X, Search } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  onInsert: (url: string, alt: string) => void
  onClose: () => void
}

type Tab = 'upload' | 'url' | 'library'

export default function ImageUploadModal({ onInsert, onClose }: Props) {
  const [tab, setTab] = useState<Tab>('upload')
  const [url, setUrl] = useState('')
  const [alt, setAlt] = useState('')
  const [uploading, setUploading] = useState(false)
  const [mediaItems, setMediaItems] = useState<{ id: number; url: string; filename: string }[]>([])
  const [loadingLibrary, setLoadingLibrary] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (file: File) => {
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/media/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.success) {
        onInsert(data.data.url, alt || file.name)
        toast.success('Image uploaded!')
      } else {
        toast.error(data.error ?? 'Upload failed')
      }
    } finally {
      setUploading(false)
    }
  }

  const loadLibrary = async () => {
    setLoadingLibrary(true)
    try {
      const res = await fetch('/api/media?type=IMAGE&limit=20')
      const data = await res.json()
      if (data.success) setMediaItems(data.data.items)
    } finally {
      setLoadingLibrary(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--bg-border)' }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--bg-border)' }}>
          <h3 className="font-display font-bold" style={{ color: 'var(--text-primary)' }}>Insert Image</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100">
            <X size={16} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b" style={{ borderColor: 'var(--bg-border)' }}>
          {(['upload', 'url', 'library'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); if (t === 'library') loadLibrary() }}
              className={`flex-1 py-2.5 text-sm font-medium capitalize transition-colors ${
                tab === t ? 'border-b-2 border-violet-500 text-violet-400' : ''
              }`}
              style={{ color: tab === t ? '#A29BFE' : 'var(--text-muted)' }}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="p-5">
          {tab === 'upload' && (
            <div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => { if (e.target.files?.[0]) handleUpload(e.target.files[0]) }} />
              <div
                className="border-2 border-dashed rounded-xl p-10 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                style={{ borderColor: 'var(--bg-border)' }}
                onClick={() => fileRef.current?.click()}
                onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleUpload(f) }}
                onDragOver={(e) => e.preventDefault()}
              >
                {uploading ? (
                  <p style={{ color: 'var(--text-muted)' }}>Uploading...</p>
                ) : (
                  <>
                    <Upload size={32} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
                    <p style={{ color: 'var(--text-secondary)' }}>Drop image or click to upload</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>PNG, JPG, GIF, WebP up to 10MB</p>
                  </>
                )}
              </div>
              <div className="mt-4">
                <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>Alt text</label>
                <input
                  value={alt}
                  onChange={(e) => setAlt(e.target.value)}
                  placeholder="Describe the image..."
                  className="w-full px-3 py-2 rounded-xl border text-sm outline-none"
                  style={{ background: 'var(--bg-surface)', borderColor: 'var(--bg-border)', color: 'var(--text-primary)' }}
                />
              </div>
            </div>
          )}

          {tab === 'url' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>Image URL</label>
                <input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl border text-sm outline-none"
                  style={{ background: 'var(--bg-surface)', borderColor: 'var(--bg-border)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>Alt text</label>
                <input
                  value={alt}
                  onChange={(e) => setAlt(e.target.value)}
                  placeholder="Describe the image..."
                  className="w-full px-3 py-2 rounded-xl border text-sm outline-none"
                  style={{ background: 'var(--bg-surface)', borderColor: 'var(--bg-border)', color: 'var(--text-primary)' }}
                />
              </div>
              {url && (
                <img src={url} alt={alt} className="w-full h-40 object-cover rounded-xl border" style={{ borderColor: 'var(--bg-border)' }} />
              )}
              <button
                onClick={() => url && onInsert(url, alt)}
                disabled={!url}
                className="w-full py-2.5 rounded-xl font-medium text-white text-sm disabled:opacity-50"
                style={{ background: '#AAFF00' }}
              >
                Insert Image
              </button>
            </div>
          )}

          {tab === 'library' && (
            <div>
              {loadingLibrary ? (
                <div className="grid grid-cols-3 gap-2">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="aspect-square rounded-xl skeleton" />
                  ))}
                </div>
              ) : mediaItems.length === 0 ? (
                <div className="text-center py-10">
                  <ImageIcon size={32} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No images in library</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2 max-h-72 overflow-y-auto">
                  {mediaItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => onInsert(item.url, item.filename)}
                      className="relative aspect-square rounded-xl overflow-hidden border-2 border-transparent hover:border-violet-500 transition-all"
                    >
                      <img src={item.url} alt={item.filename} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
