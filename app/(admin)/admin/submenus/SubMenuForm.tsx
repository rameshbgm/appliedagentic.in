'use client'
// app/(admin)/admin/submenus/SubMenuForm.tsx
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { slugify } from '@/lib/slugify'
import { Save, ArrowLeft, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

interface SubMenuData {
  id?: number
  title: string
  slug: string
  menuId: number
  description: string
  order: number
  isVisible: boolean
}

interface Menu {
  id: number
  title: string
}

interface Props {
  initial?: SubMenuData
  menus: Menu[]
  nextOrder?: number
}

export default function SubMenuForm({ initial, menus, nextOrder }: Props) {
  const router = useRouter()
  const isEdit = !!initial?.id
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<SubMenuData>({
    title: initial?.title ?? '',
    slug: initial?.slug ?? '',
    menuId: initial?.menuId ?? (menus[0]?.id ?? 0),
    description: initial?.description ?? '',
    order: initial?.order ?? nextOrder ?? 1,
    isVisible: initial?.isVisible ?? true,
  })

  const handleTitleChange = (title: string) => {
    setForm((f) => ({
      ...f,
      title,
      slug: isEdit ? f.slug : slugify(title),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) {
      toast.error('Title is required')
      return
    }
    if (!form.menuId) {
      toast.error('Please select a parent menu')
      return
    }
    setSaving(true)
    try {
      const url = isEdit ? `/api/submenus/${initial!.id}` : '/api/submenus'
      const method = isEdit ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(isEdit ? 'Sub-menu updated' : 'Sub-menu created')
        router.push('/admin/submenus')
        router.refresh()
      } else {
        toast.error(data.error ?? 'Save failed')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4 mb-2">
        <Link href="/admin/submenus" className="p-2 rounded-xl hover:bg-gray-100 transition-colors" style={{ color: 'var(--text-muted)' }}>
          <ArrowLeft size={18} />
        </Link>
        <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>
          {isEdit ? 'Edit Sub-Menu' : 'New Sub-Menu'}
        </h1>
      </div>

      {/* Parent Menu */}
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
          Parent Menu <span className="text-red-400">*</span>
        </label>
        <select
          value={form.menuId}
          onChange={(e) => setForm((f) => ({ ...f, menuId: parseInt(e.target.value) }))}
          className="input w-full"
          required
        >
          <option value="" disabled>Select a menu</option>
          {menus.map((m) => (
            <option key={m.id} value={m.id}>{m.title}</option>
          ))}
        </select>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
          Title <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className="input w-full"
          placeholder="e.g. RAG Basics"
          required
        />
      </div>

      {/* Slug */}
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
          Slug
        </label>
        <input
          type="text"
          value={form.slug}
          onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
          className="input w-full"
          placeholder="auto-generated-from-title"
        />
        {form.menuId > 0 && (
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            URL: /{menus.find((m) => m.id === form.menuId)?.title?.toLowerCase().replace(/\s+/g, '-') ?? '...'}/{form.slug || '...'}
          </p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
          Description
        </label>
        <textarea
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          className="input w-full"
          rows={3}
          placeholder="Short description"
        />
      </div>

      {/* Visibility */}
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
          Visibility
        </label>
        <button
          type="button"
          onClick={() => setForm((f) => ({ ...f, isVisible: !f.isVisible }))}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors"
          style={{
            borderColor: form.isVisible ? 'var(--green)' : 'var(--bg-border)',
            color: form.isVisible ? 'var(--green)' : 'var(--text-muted)',
            background: form.isVisible ? 'rgba(170,255,0,0.08)' : 'transparent',
          }}
        >
          {form.isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
          {form.isVisible ? 'Visible' : 'Hidden'}
        </button>
      </div>

      {/* Display Order — always last so new items go at the end */}
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
          Display Order
        </label>
        <input
          type="number"
          value={form.order}
          placeholder="e.g. 1"
          onChange={(e) => setForm((f) => ({ ...f, order: parseInt(e.target.value) || 0 }))}
          className="input w-full"
        />
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
          Lower numbers appear first. Defaults to last position.
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4" style={{ borderTop: '1px solid var(--bg-border)' }}>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-opacity disabled:opacity-50"
          style={{ background: 'var(--green)', color: '#000' }}
        >
          <Save size={14} />
          {saving ? 'Saving…' : isEdit ? 'Update Sub-Menu' : 'Create Sub-Menu'}
        </button>
        <Link
          href="/admin/submenus"
          className="px-5 py-2.5 rounded-xl text-sm font-medium transition-colors hover:bg-gray-100"
          style={{ color: 'var(--text-secondary)' }}
        >
          Cancel
        </Link>
      </div>
    </form>
  )
}
