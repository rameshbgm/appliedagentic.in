'use client'
// components/admin/editor/LinkModal.tsx
import { useState } from 'react'
import { X, Link2, ExternalLink } from 'lucide-react'

interface Props {
  initialHref?: string
  initialText?: string
  onInsert: (href: string, text: string) => void
  onClose: () => void
}

export default function LinkModal({ initialHref = '', initialText = '', onInsert, onClose }: Props) {
  const [href, setHref] = useState(initialHref)
  const [text, setText] = useState(initialText)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--bg-border)' }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--bg-border)' }}>
          <h3 className="font-display font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Link2 size={18} style={{ color: 'var(--color-violet)' }} />
            Insert Link
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100">
            <X size={16} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>URL</label>
            <input
              value={href}
              onChange={(e) => setHref(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-xl border text-sm outline-none"
              style={{ background: 'var(--bg-surface)', borderColor: 'var(--bg-border)', color: 'var(--text-primary)' }}
              autoFocus
            />
          </div>
          <div>
            <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>Link text (optional)</label>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Display text..."
              className="w-full px-3 py-2 rounded-xl border text-sm outline-none"
              style={{ background: 'var(--bg-surface)', borderColor: 'var(--bg-border)', color: 'var(--text-primary)' }}
            />
          </div>
          {href && (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs hover:underline"
              style={{ color: 'var(--color-cyan)' }}
            >
              <ExternalLink size={12} />
              Preview link
            </a>
          )}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm border transition-colors"
              style={{ borderColor: 'var(--bg-border)', color: 'var(--text-secondary)' }}
            >
              Cancel
            </button>
            <button
              onClick={() => href && onInsert(href, text)}
              disabled={!href}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-black disabled:opacity-50"
              style={{ background: 'var(--green)' }}
            >
              Insert Link
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
