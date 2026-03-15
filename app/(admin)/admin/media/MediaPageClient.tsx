'use client'
// app/(admin)/media/MediaPageClient.tsx
import { useState, useRef, useCallback, useEffect } from 'react'
import { Upload, Search, Filter, Trash2, AlertTriangle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { createPortal } from 'react-dom'
import MediaGrid from '@/components/admin/MediaGrid'

interface UnusedAsset {
  id: number
  filename: string
  url: string
  type: string
  mimeType: string | null
  sizeBytes: number | null
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function MediaPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const [mounted, setMounted] = useState(false)

  // Cleanup modal state
  const [cleanupOpen, setCleanupOpen] = useState(false)
  const [cleanupScanning, setCleanupScanning] = useState(false)
  const [cleanupDeleting, setCleanupDeleting] = useState(false)
  const [unusedAssets, setUnusedAssets] = useState<UnusedAsset[]>([])
  const [unusedTotalBytes, setUnusedTotalBytes] = useState(0)

  useEffect(() => setMounted(true), [])

  const loadMedia = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (typeFilter) params.set('type', typeFilter)
      if (search) params.set('search', search)
      params.set('limit', '50')
      const res = await fetch(`/api/media?${params}`)
      const data = await res.json()
      if (data.success) setItems(data.data.items)
    } finally {
      setLoading(false)
      setLoaded(true)
    }
  }, [typeFilter, search])

  // Load on first mount (useEffect ensures this only runs client-side,
  // preventing SSR from calling fetch() with a relative URL).
  useEffect(() => { loadMedia() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const openCleanup = async () => {
    setCleanupOpen(true)
    setCleanupScanning(true)
    setUnusedAssets([])
    try {
      const res = await fetch('/api/media/cleanup')
      const data = await res.json()
      if (data.success) {
        setUnusedAssets(data.data.items)
        setUnusedTotalBytes(data.data.totalBytes)
      } else {
        toast.error('Failed to scan for unused files')
        setCleanupOpen(false)
      }
    } finally {
      setCleanupScanning(false)
    }
  }

  const confirmCleanup = async () => {
    setCleanupDeleting(true)
    try {
      const res = await fetch('/api/media/cleanup', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        const { deleted, freedBytes } = data.data
        toast.success(`Deleted ${deleted} unused file${deleted !== 1 ? 's' : ''}, freed ${formatBytes(freedBytes)}`)
        // Remove deleted IDs from the grid
        setItems((prev) => prev.filter((i) => !data.data.ids.includes(i.id)))
        setCleanupOpen(false)
      } else {
        toast.error(data.error ?? 'Cleanup failed')
      }
    } finally {
      setCleanupDeleting(false)
    }
  }

  const handleUpload = async (files: FileList | null) => {
    if (!files) return
    for (const file of Array.from(files)) {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/media/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.success) {
        setItems((prev) => [data.data, ...prev])
        toast.success(`${file.name} uploaded!`)
      } else {
        toast.error(data.error ?? `Failed to upload ${file.name}`)
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>Media Library</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{items.length} files</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={openCleanup}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors hover:border-red-400 hover:text-red-400"
            style={{ borderColor: 'var(--bg-border)', color: 'var(--text-secondary)' }}
            title="Find and delete all unused media files"
          >
            <Trash2 size={15} />Clean Up
          </button>
          <input ref={fileRef} type="file" multiple accept="image/*,audio/*,video/*" className="hidden"
            onChange={(e) => handleUpload(e.target.files)} />
          <button
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white"
            style={{ background: '#1E293B' }}
          >
            <Upload size={16} />Upload
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-48 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadMedia()}
            placeholder="Search files..."
            className="w-full pl-8 pr-3 py-2 rounded-xl border text-sm outline-none"
            style={{ background: 'var(--bg-elevated)', borderColor: 'var(--bg-border)', color: 'var(--text-primary)' }}
            suppressHydrationWarning
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); }}
          className="px-3 py-2 rounded-xl border text-sm outline-none"
          style={{ background: 'var(--bg-elevated)', borderColor: 'var(--bg-border)', color: 'var(--text-primary)' }}
          suppressHydrationWarning
        >
          <option value="">All Types</option>
          <option value="IMAGE">Images</option>
          <option value="AUDIO">Audio</option>
          <option value="VIDEO">Video</option>
          <option value="OTHER">Other</option>
        </select>
        <button
          onClick={loadMedia}
          className="px-4 py-2 rounded-xl text-sm border"
          style={{ borderColor: 'var(--bg-border)', color: 'var(--text-secondary)' }}
        >
          <Filter size={14} />
        </button>
      </div>

      {/* Drop zone */}
      <div
        className="border-2 border-dashed rounded-2xl p-8 text-center transition-colors"
        style={{ borderColor: 'var(--bg-border)' }}
        onDrop={(e) => { e.preventDefault(); handleUpload(e.dataTransfer.files) }}
        onDragOver={(e) => e.preventDefault()}
      >
        <Upload size={24} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Drag & drop files here to upload</p>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => <div key={`skeleton-${i}`} className="aspect-square rounded-2xl skeleton" />)}
        </div>
      ) : (
        <MediaGrid items={items} onDeleted={(id) => setItems((prev) => prev.filter((i) => i.id !== id))} />
      )}

      {/* Cleanup confirmation modal */}
      {mounted && cleanupOpen && createPortal(
        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ zIndex: 99999, background: 'rgba(0,0,0,0.6)' }}
          onClick={() => { if (!cleanupDeleting) setCleanupOpen(false) }}
        >
          <div
            className="w-full max-w-lg max-h-[85vh] flex flex-col rounded-2xl overflow-hidden bg-white"
            style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.22)', border: '1px solid #e5e7eb' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
              <div className="p-2 rounded-xl bg-red-50">
                <AlertTriangle size={18} className="text-red-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Clean Up Unused Media</h3>
                <p className="text-xs text-gray-400 mt-0.5">Files not referenced by any article will be permanently deleted</p>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {cleanupScanning ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <Loader2 size={24} className="animate-spin text-violet-500" />
                  <p className="text-sm text-gray-400">Scanning for unused files…</p>
                </div>
              ) : unusedAssets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
                  <span className="text-4xl">✅</span>
                  <p className="text-sm font-medium text-gray-700 mt-1">Everything is in use!</p>
                  <p className="text-xs text-gray-400">No unused media files were found.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-gray-700">
                      {unusedAssets.length} unused file{unusedAssets.length !== 1 ? 's' : ''} found
                    </p>
                    <span className="text-xs px-2 py-1 rounded-lg bg-red-50 text-red-500 font-semibold">
                      {formatBytes(unusedTotalBytes)} to free
                    </span>
                  </div>
                  <div className="divide-y divide-gray-50 border border-gray-100 rounded-xl overflow-hidden">
                    {unusedAssets.map((a) => (
                      <div key={a.id} className="flex items-center gap-3 px-3.5 py-2.5 bg-white hover:bg-gray-50 transition-colors">
                        <span className="text-lg shrink-0">
                          {a.mimeType?.startsWith('image/') ? '🖼️' : a.mimeType?.startsWith('audio/') ? '🎵' : '📄'}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-800 truncate">{a.filename}</p>
                          <p className="text-[11px] text-gray-400">
                            {a.type}{a.sizeBytes ? ` · ${formatBytes(a.sizeBytes)}` : ''}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-gray-100 bg-gray-50">
              <button
                onClick={() => setCleanupOpen(false)}
                disabled={cleanupDeleting}
                className="px-4 py-2 text-sm rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              {unusedAssets.length > 0 && (
                <button
                  onClick={confirmCleanup}
                  disabled={cleanupDeleting || cleanupScanning}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-xl font-medium text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-60"
                >
                  {cleanupDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  {cleanupDeleting ? 'Deleting…' : `Delete ${unusedAssets.length} file${unusedAssets.length !== 1 ? 's' : ''}`}
                </button>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
