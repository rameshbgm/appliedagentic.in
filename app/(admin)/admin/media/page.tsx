'use client'
// app/(admin)/media/page.tsx
import type { Metadata } from 'next'
import { useState, useRef, useCallback } from 'react'
import { Upload, Search, Filter } from 'lucide-react'
import { toast } from 'sonner'
import MediaGrid from '@/components/admin/MediaGrid'

export default function MediaPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

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

  useCallback(() => { loadMedia() }, [])

  // Load data on first render
  if (!loaded && !loading) { loadMedia() }

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
        <div>
          <input ref={fileRef} type="file" multiple accept="image/*,audio/*,video/*" className="hidden"
            onChange={(e) => handleUpload(e.target.files)} />
          <button
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-black"
            style={{ background: '#AAFF00' }}
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
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); }}
          className="px-3 py-2 rounded-xl border text-sm outline-none"
          style={{ background: 'var(--bg-elevated)', borderColor: 'var(--bg-border)', color: 'var(--text-primary)' }}
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
          {[...Array(10)].map((_, i) => <div key={i} className="aspect-square rounded-2xl skeleton" />)}
        </div>
      ) : (
        <MediaGrid items={items} onDeleted={(id) => setItems((prev) => prev.filter((i) => i.id !== id))} />
      )}
    </div>
  )
}
