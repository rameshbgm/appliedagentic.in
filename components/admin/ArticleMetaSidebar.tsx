'use client'
// components/admin/ArticleMetaSidebar.tsx
import { useState } from 'react'
import { Clock, BookOpen, ChevronDown, ChevronRight } from 'lucide-react'
import TagInput from '@/components/shared/TagInput'

interface Meta {
  status: string
  scheduledAt?: string
  navMenuId?: number
  subMenuIds: number[]
  tagNames: string[]
  seoTitle: string
  seoDescription: string
  audioUrl?: string
}

interface SubMenu {
  id: number
  title: string
  menuId: number
}

interface NavMenu {
  id: number
  title: string
  subMenus?: SubMenu[]
}

interface Props {
  meta: Meta
  onChange: (meta: Partial<Meta>) => void
  menus: NavMenu[]
  allTags: { id: number; name: string }[]
  wordCount?: number
  readingTime?: number
}

export default function ArticleMetaSidebar({
  meta,
  onChange,
  menus = [],
  allTags = [],
  wordCount = 0,
  readingTime = 0,
}: Props) {
  const [openSection, setOpenSection] = useState<'publish' | 'navigation' | 'tags' | 'seo'>('publish')

  const filteredSubMenus = meta.navMenuId
    ? (menus.find((m) => m.id === meta.navMenuId)?.subMenus ?? [])
    : []

  const toggleSubMenu = (id: number) => {
    const updated = meta.subMenuIds.includes(id)
      ? meta.subMenuIds.filter((x) => x !== id)
      : [...meta.subMenuIds, id]
    onChange({ subMenuIds: updated })
  }

  const Section = ({
    id,
    label,
    children,
  }: {
    id: typeof openSection
    label: string
    children: React.ReactNode
  }) => (
    <div className="border-b" style={{ borderColor: 'var(--bg-border)' }}>
      <button
        onClick={() => setOpenSection(id)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors hover:bg-black/5"
        style={{ color: 'var(--text-primary)' }}
      >
        <span>{label}</span>
        <span style={{ color: 'var(--text-muted)' }}>{openSection === id ? '−' : '+'}</span>
      </button>
      {openSection === id && <div className="px-4 pb-4 space-y-3">{children}</div>}
    </div>
  )

  const inputClass = 'w-full px-3 py-2 rounded-xl border text-sm outline-none'
  const inputStyle = {
    background: 'var(--bg-surface)',
    borderColor: 'var(--bg-border)',
    color: 'var(--text-primary)',
  }
  const labelClass = 'text-xs mb-1 block'
  const labelStyle = { color: 'var(--text-muted)' }

  return (
    <aside
      className="w-full md:w-80 lg:w-72 shrink-0 rounded-2xl overflow-hidden border"
      style={{ background: 'var(--bg-elevated)', borderColor: 'var(--bg-border)' }}
    >
      {/* Stats */}
      <div className="px-4 py-3 border-b grid grid-cols-2 gap-3" style={{ borderColor: 'var(--bg-border)' }}>
        <div className="flex flex-col items-center gap-1 p-2 rounded-xl" style={{ background: 'var(--bg-surface)' }}>
          <BookOpen size={14} style={{ color: 'var(--color-violet)' }} />
          <span className="text-lg font-bold font-display" style={{ color: 'var(--text-primary)' }}>{wordCount.toLocaleString()}</span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>words</span>
        </div>
        <div className="flex flex-col items-center gap-1 p-2 rounded-xl" style={{ background: 'var(--bg-surface)' }}>
          <Clock size={14} style={{ color: 'var(--color-cyan)' }} />
          <span className="text-lg font-bold font-display" style={{ color: 'var(--text-primary)' }}>{readingTime}</span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>min read</span>
        </div>
      </div>

      {/* Publish */}
      <Section id="publish" label="Publish">
        <div>
          <label className={labelClass} style={labelStyle}>Status</label>
          <select
            value={meta.status}
            onChange={(e) => onChange({ status: e.target.value })}
            className={inputClass}
            style={inputStyle}
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
        {meta.status === 'SCHEDULED' && (
          <div>
            <label className={labelClass} style={labelStyle}>Schedule Date & Time</label>
            <input
              type="datetime-local"
              value={meta.scheduledAt ?? ''}
              onChange={(e) => onChange({ scheduledAt: e.target.value })}
              className={inputClass}
              style={inputStyle}
            />
          </div>
        )}
        {meta.audioUrl && (
          <div>
            <label className={labelClass} style={labelStyle}>Audio Preview</label>
            <audio controls src={meta.audioUrl} className="w-full" />
          </div>
        )}
      </Section>

      {/* Navigation: Menu → Sub-menu */}
      <Section id="navigation" label="Navigation">
        <div>
          <label className={labelClass} style={labelStyle}>Menu</label>
          <select
            value={meta.navMenuId ?? ''}
            onChange={(e) => {
              const val = e.target.value ? Number(e.target.value) : undefined
              onChange({ navMenuId: val, subMenuIds: [] })
            }}
            className={inputClass}
            style={inputStyle}
          >
            <option value="">— None —</option>
            {menus.map((m) => (
              <option key={m.id} value={m.id}>{m.title}</option>
            ))}
          </select>
        </div>

        {meta.navMenuId != null && (
          <div>
            <label className={labelClass} style={labelStyle}>Sub-menu</label>
            {filteredSubMenus.length === 0 ? (
              <p className="text-xs italic" style={{ color: 'var(--text-muted)' }}>
                No sub-menus for this menu.
              </p>
            ) : (
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {filteredSubMenus.map((sm) => (
                  <label
                    key={sm.id}
                    className="flex items-center gap-2 cursor-pointer py-1 px-2 rounded-lg hover:bg-black/5 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={meta.subMenuIds.includes(sm.id)}
                      onChange={() => toggleSubMenu(sm.id)}
                      className="accent-violet-500"
                    />
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{sm.title}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}
      </Section>

      {/* Tags */}
      <Section id="tags" label="Tags">
        <TagInput
          value={meta.tagNames.map((n) => ({ name: n }))}
          onChange={(tags) => onChange({ tagNames: tags.map((t) => t.name) })}
          suggestions={allTags}
        />
      </Section>

      {/* SEO */}
      <Section id="seo" label="SEO">
        <div>
          <label className={labelClass} style={labelStyle}>SEO Title</label>
          <input
            value={meta.seoTitle}
            onChange={(e) => onChange({ seoTitle: e.target.value })}
            placeholder="Override page title..."
            className={inputClass}
            style={inputStyle}
          />
          <span className="text-xs mt-1 block" style={{ color: meta.seoTitle.length > 60 ? '#ff4757' : 'var(--text-muted)' }}>
            {meta.seoTitle.length}/60
          </span>
        </div>
        <div>
          <label className={labelClass} style={labelStyle}>SEO Description</label>
          <textarea
            value={meta.seoDescription}
            onChange={(e) => onChange({ seoDescription: e.target.value })}
            placeholder="Describe this article for search engines..."
            rows={3}
            className={inputClass + ' resize-none'}
            style={inputStyle}
          />
          <span className="text-xs mt-1 block" style={{ color: meta.seoDescription.length > 160 ? '#ff4757' : 'var(--text-muted)' }}>
            {meta.seoDescription.length}/160
          </span>
        </div>
      </Section>
    </aside>
  )
}
