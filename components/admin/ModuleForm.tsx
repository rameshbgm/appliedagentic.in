'use client'
// components/admin/ModuleForm.tsx
import { useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

interface ModuleFormData {
  name: string
  slug: string
  description: string
  icon: string
  color: string
  published: boolean
}

interface Props {
  initialData?: ModuleFormData & { id?: number }
}

const ICONS = ['🤖','⚡','🧠','🔮','🛠️','📊','🌐','🔐','💡','🚀','🎯','🔬']
const COLORS = ['#6C3DFF','#00D4FF','#FF6B6B','#FFA502','#2ED573','#FF69B4','#A29BFE','#55EFC4']

export default function ModuleForm({ initialData }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<ModuleFormData>({
    name: initialData?.name ?? '',
    slug: initialData?.slug ?? '',
    description: initialData?.description ?? '',
    icon: initialData?.icon ?? '🤖',
    color: initialData?.color ?? '#6C3DFF',
    published: initialData?.published ?? true,
  })

  const set = (key: keyof ModuleFormData, value: string | boolean) =>
    setForm((f) => ({ ...f, [key]: value }))

  const autoSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const handleNameChange = (name: string) => {
    set('name', name)
    if (!initialData?.id) set('slug', autoSlug(name))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Name is required'); return }
    setLoading(true)
    try {
      const url = initialData?.id ? `/api/modules/${initialData.id}` : '/api/modules'
      const method = initialData?.id ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(`Module ${initialData?.id ? 'updated' : 'created'}!`)
        router.push('/admin/modules')
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
          <label className={labelClass} style={labelStyle}>Module Name *</label>
          <input
            value={form.name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="e.g. AI Agents & Orchestration"
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
            placeholder="ai-agents-orchestration"
            className={inputClass}
            style={inputStyle}
          />
        </div>
      </div>

      <div>
        <label className={labelClass} style={labelStyle}>Description</label>
        <textarea
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          placeholder="Brief description of this module..."
          rows={3}
          className={inputClass + ' resize-none'}
          style={inputStyle}
        />
      </div>

      <div>
        <label className={labelClass} style={labelStyle}>Icon</label>
        <div className="flex flex-wrap gap-2 mt-1">
          {ICONS.map((icon) => (
            <button
              key={icon}
              type="button"
              onClick={() => set('icon', icon)}
              className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all border-2 ${
                form.icon === icon ? 'border-violet-500 scale-110' : 'border-transparent'
              }`}
              style={{ background: 'var(--bg-surface)' }}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className={labelClass} style={labelStyle}>Color</label>
        <div className="flex flex-wrap gap-2 mt-1">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => set('color', c)}
              className={`w-8 h-8 rounded-full border-4 transition-transform hover:scale-110 ${
                form.color === c ? 'border-white scale-110' : 'border-transparent'
              }`}
              style={{ background: c }}
            />
          ))}
        </div>
      </div>

      {/* Preview */}
      <div
        className="flex items-center gap-4 p-4 rounded-2xl border"
        style={{ borderColor: form.color + '40', background: form.color + '10' }}
      >
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
          style={{ background: form.color + '20' }}>
          {form.icon}
        </div>
        <div>
          <p className="font-display font-bold" style={{ color: 'var(--text-primary)' }}>{form.name || 'Module Name'}</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{form.description || 'Description...'}</p>
        </div>
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
          Publish this module (visible on public site)
        </label>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.push('/admin/modules')}
          className="px-5 py-2.5 rounded-xl text-sm border"
          style={{ borderColor: 'var(--bg-border)', color: 'var(--text-secondary)' }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-50 flex items-center gap-2"
          style={{ background: 'linear-gradient(135deg, #6C3DFF, #00D4FF)' }}
        >
          {loading && <Loader2 size={14} className="animate-spin" />}
          {initialData?.id ? 'Update Module' : 'Create Module'}
        </button>
      </div>
    </form>
  )
}
