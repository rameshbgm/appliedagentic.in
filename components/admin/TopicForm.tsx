'use client'
// components/admin/TopicForm.tsx
import { useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

interface TopicFormData {
  name: string
  slug: string
  description: string
  moduleId: number | ''
  order: number
  published: boolean
}

interface Props {
  initialData?: TopicFormData & { id?: number }
  modules: { id: number; name: string }[]
}

export default function TopicForm({ initialData, modules }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<TopicFormData>({
    name: initialData?.name ?? '',
    slug: initialData?.slug ?? '',
    description: initialData?.description ?? '',
    moduleId: initialData?.moduleId ?? '',
    order: initialData?.order ?? 0,
    published: initialData?.published ?? true,
  })

  const set = <K extends keyof TopicFormData>(key: K, value: TopicFormData[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const autoSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Name is required'); return }
    if (!form.moduleId) { toast.error('Please select a module'); return }
    setLoading(true)
    try {
      const url = initialData?.id ? `/api/topics/${initialData.id}` : '/api/topics'
      const method = initialData?.id ? 'PUT' : 'POST'
      const payload = { ...form, moduleId: Number(form.moduleId) }
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(`Topic ${initialData?.id ? 'updated' : 'created'}!`)
        router.push('/admin/topics')
        router.refresh()
      } else {
        toast.error(data.error ?? 'Failed to save')
      }
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
  const inputStyle = { background: 'var(--bg-surface)', borderColor: 'var(--bg-border)', color: 'var(--text-primary)' }
  const labelClass = "block text-sm font-medium mb-1.5"
  const labelStyle = { color: 'var(--text-secondary)' }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div className="grid grid-cols-2 gap-5">
        <div>
          <label className={labelClass} style={labelStyle}>Topic Name *</label>
          <input
            value={form.name}
            onChange={(e) => {
              set('name', e.target.value)
              if (!initialData?.id) set('slug', autoSlug(e.target.value))
            }}
            placeholder="e.g. LangGraph Deep Dive"
            className={inputClass}
            style={inputStyle}
            required
          />
        </div>
        <div>
          <label className={labelClass} style={labelStyle}>Slug</label>
          <input
            value={form.slug}
            onChange={(e) => set('slug', e.target.value)}
            placeholder="langgraph-deep-dive"
            className={inputClass}
            style={inputStyle}
          />
        </div>
      </div>

      <div>
        <label className={labelClass} style={labelStyle}>Module *</label>
        <select
          value={form.moduleId}
          onChange={(e) => set('moduleId', e.target.value ? Number(e.target.value) : '')}
          className={inputClass}
          style={inputStyle}
          required
        >
          <option value="">— Select a Module —</option>
          {modules.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass} style={labelStyle}>Description</label>
        <textarea
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          placeholder="What will readers learn in this topic?"
          rows={3}
          className={inputClass + ' resize-none'}
          style={inputStyle}
        />
      </div>

      <div>
        <label className={labelClass} style={labelStyle}>Order</label>
        <input
          type="number"
          min={0}
          value={form.order}
          onChange={(e) => set('order', Number(e.target.value))}
          className={inputClass}
          style={inputStyle}
        />
      </div>

      <div className="flex items-center gap-3">
        <input
          id="published"
          type="checkbox"
          checked={form.published}
          onChange={(e) => set('published', e.target.checked)}
          className="accent-violet-500 w-4 h-4"
        />
        <label htmlFor="published" className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Publish this topic
        </label>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.push('/admin/topics')}
          className="px-5 py-2.5 rounded-xl text-sm border"
          style={{ borderColor: 'var(--bg-border)', color: 'var(--text-secondary)' }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold text-black disabled:opacity-50 flex items-center gap-2"
          style={{ background: '#AAFF00' }}
        >
          {loading && <Loader2 size={14} className="animate-spin" />}
          {initialData?.id ? 'Update Topic' : 'Create Topic'}
        </button>
      </div>
    </form>
  )
}
