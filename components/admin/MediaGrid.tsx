'use client'
// components/admin/MediaGrid.tsx
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Trash2, Download, Copy, Check, Bot, ImageIcon, CheckCircle2, X, FileText, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import LazyImage from '@/components/shared/LazyImage'

interface MediaItem {
  id: number
  filename: string
  url: string
  mimeType: string
  sizeBytes: number | null
  width?: number | null
  height?: number | null
  aiPrompt?: string | null
  createdAt: string
  _count?: { articles: number }
  audioUsageCount?: number
}

interface ArticleUsage {
  id: number
  title: string
  slug: string
  status: string
  updatedAt: string
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
  const [usageMediaId, setUsageMediaId] = useState<number | null>(null)
  const [usageArticles, setUsageArticles] = useState<ArticleUsage[]>([])
  const [usageLoading, setUsageLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

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

  const openUsageModal = async (mediaId: number) => {
    setUsageMediaId(mediaId)
    setUsageArticles([])
    setUsageLoading(true)
    try {
      const res = await fetch(`/api/media/${mediaId}/articles`)
      const data = await res.json()
      if (data.success) setUsageArticles(data.data)
      else toast.error('Failed to load article usage')
    } finally {
      setUsageLoading(false)
    }
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
          const totalUsage = (item._count?.articles ?? 0) + (item.audioUsageCount ?? 0)

          return (
            <div
              key={item.id}
              className="rounded-2xl overflow-hidden border flex flex-col"
              style={{ background: 'var(--bg-elevated)', borderColor: 'var(--bg-border)' }}
            >
              {/* ── Preview ─────────────────────────────────── */}
              <div className="aspect-square w-full relative" style={{ background: 'var(--bg-surface)' }}>
                {isImage ? (
                  <LazyImage
                    src={item.url}
                    alt={item.filename}
                    aspectClass="aspect-square"
                    className="object-cover"
                  />
                ) : isAudio ? (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 px-3">
                    <span className="text-3xl">🎵</span>
                    <audio src={item.url} controls className="w-full" style={{ maxWidth: '100%' }} />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-3xl">📄</span>
                  </div>
                )}
              </div>

              {/* ── Tags row ─────────────────────────────────── */}
              <div className="flex flex-wrap items-center gap-1 px-2 pt-2">
                {item.aiPrompt ? (
                  <span
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold"
                    style={{ background: 'rgba(108,61,255,0.15)', color: '#7c3aed' }}
                    title={`AI Prompt: ${item.aiPrompt}`}
                  >
                    <Bot size={9} />AI
                  </span>
                ) : (
                  <span
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold"
                    style={{ background: 'var(--bg-surface)', color: 'var(--text-muted)' }}
                  >
                    <ImageIcon size={9} />Manual
                  </span>
                )}
                {totalUsage > 0 && (
                  <button
                    type="button"
                    onClick={() => openUsageModal(item.id)}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold hover:opacity-80 transition-opacity"
                    style={{ background: 'rgba(46,213,115,0.15)', color: '#16a34a' }}
                    title={`Used in ${totalUsage} article(s) — click to view`}
                  >
                    <CheckCircle2 size={9} />In Use ({totalUsage})
                  </button>
                )}
              </div>

              {/* ── File info ────────────────────────────────── */}
              <div className="px-2 pt-1 pb-1">
                <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{item.filename}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {item.sizeBytes != null ? formatBytes(item.sizeBytes) : '—'}
                  {item.width && item.height && ` · ${item.width}×${item.height}`}
                </p>
              </div>

              {/* ── Action buttons ───────────────────────────── */}
              <div className="flex items-center gap-1 px-2 pb-2 pt-0.5 border-t mt-auto" style={{ borderColor: 'var(--bg-border)' }}>
                <button
                  onClick={() => copyUrl(item.id, item.url)}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs transition-colors hover:opacity-80"
                  style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)' }}
                  title="Copy URL"
                >
                  {copiedId === item.id
                    ? <><Check size={12} className="text-green-500" /><span>Copied</span></>
                    : <><Copy size={12} /><span>Copy</span></>
                  }
                </button>
                <a
                  href={item.url}
                  download={item.filename}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs transition-colors hover:opacity-80"
                  style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)' }}
                  title="Download"
                >
                  <Download size={12} /><span>Save</span>
                </a>
                <button
                  onClick={() => setDeleteId(item.id)}
                  className="flex items-center justify-center p-1.5 rounded-lg text-xs transition-colors hover:bg-red-50"
                  style={{ color: '#ef4444' }}
                  title="Delete"
                >
                  <Trash2 size={14} />
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

      {/* Article Usage Modal — rendered via portal to escape stacking contexts */}
      {mounted && usageMediaId !== null && createPortal(
        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ zIndex: 99999, background: 'rgba(0,0,0,0.6)' }}
          onClick={() => setUsageMediaId(null)}
        >
          <div
            className="w-full max-w-lg max-h-[85vh] flex flex-col rounded-2xl overflow-hidden"
            style={{ background: '#fff', boxShadow: '0 24px 64px rgba(0,0,0,0.22)', border: '1px solid #e5e7eb' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image thumbnail strip */}
            {(() => {
              const media = items.find(i => i.id === usageMediaId)
              return media?.mimeType.startsWith('image/') ? (
                <div className="relative h-32 w-full shrink-0 overflow-hidden" style={{ background: '#f1f5f9' }}>
                  <LazyImage fill src={media.url} alt={media.filename} className="object-cover" />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.55))' }} />
                  <div className="absolute bottom-3 left-4 right-12">
                    <p className="text-white text-sm font-semibold truncate">{media.filename}</p>
                    <p className="text-white/70 text-xs">{media.width && media.height ? `${media.width}×${media.height}` : ''}{media.sizeBytes ? ` · ${formatBytes(media.sizeBytes)}` : ''}</p>
                  </div>
                  <button
                    onClick={() => setUsageMediaId(null)}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-black/30 hover:bg-black/50 transition-colors text-white"
                    title="Close" aria-label="Close"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : null
            })()}

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b" style={{ borderColor: '#e5e7eb' }}>
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg" style={{ background: 'rgba(108,61,255,0.1)' }}>
                  <FileText size={15} style={{ color: '#6C3DFF' }} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-900">Articles Using This File</h3>
                  {!usageLoading && (
                    <p className="text-xs text-gray-400 mt-0">
                      {usageArticles.length === 0 ? 'No articles' : `${usageArticles.length} article${usageArticles.length !== 1 ? 's' : ''}`}
                    </p>
                  )}
                </div>
              </div>
              {!items.find(i => i.id === usageMediaId)?.mimeType.startsWith('image/') && (
                <button
                  onClick={() => setUsageMediaId(null)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400"
                  title="Close" aria-label="Close"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1">
              {usageLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-gray-400">Loading articles…</p>
                </div>
              ) : usageArticles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2">
                  <FileText size={32} className="text-gray-200" />
                  <p className="text-sm text-gray-400">This image is not used in any articles</p>
                </div>
              ) : (
                <div className="divide-y" style={{ borderColor: '#f3f4f6' }}>
                  {usageArticles.map((a) => (
                    <a
                      key={a.id}
                      href={`/admin/articles/${a.id}/edit`}
                      className="flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors group/item"
                    >
                      <div className="mt-0.5 p-1.5 rounded-md shrink-0" style={{ background: '#f8fafc', border: '1px solid #e5e7eb' }}>
                        <FileText size={13} className="text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate group-hover/item:text-violet-600 transition-colors">
                          {a.title}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5 truncate">/{a.slug}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span
                          className="text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wide"
                          style={a.status === 'PUBLISHED'
                            ? { background: '#dcfce7', color: '#16a34a' }
                            : a.status === 'DRAFT'
                            ? { background: '#fef9c3', color: '#ca8a04' }
                            : { background: '#f3f4f6', color: '#6b7280' }
                          }
                        >
                          {a.status}
                        </span>
                        <ExternalLink size={11} className="text-gray-300 group-hover/item:text-violet-400 transition-colors" />
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      , document.body)}
    </>
  )
}
