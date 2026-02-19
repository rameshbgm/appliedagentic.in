'use client'
// components/admin/editor/EmbedModal.tsx
import { useState } from 'react'
import { X, Youtube } from 'lucide-react'

interface Props {
  onInsert: (url: string) => void
  onClose: () => void
}

export default function EmbedModal({ onInsert, onClose }: Props) {
  const [url, setUrl] = useState('')

  const isValid = url.includes('youtube.com') || url.includes('youtu.be') || url.startsWith('http')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--bg-border)' }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--bg-border)' }}>
          <h3 className="font-display font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Youtube size={18} className="text-red-500" />
            Embed Video
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10">
            <X size={16} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>YouTube or Video URL</label>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full px-3 py-2 rounded-xl border text-sm outline-none"
              style={{ background: 'var(--bg-surface)', borderColor: 'var(--bg-border)', color: 'var(--text-primary)' }}
              autoFocus
            />
          </div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Supports YouTube, Vimeo, and direct video URLs.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm border transition-colors"
              style={{ borderColor: 'var(--bg-border)', color: 'var(--text-secondary)' }}
            >
              Cancel
            </button>
            <button
              onClick={() => url && onInsert(url)}
              disabled={!isValid}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #6C3DFF, #00D4FF)' }}
            >
              Embed
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
