'use client'
// components/admin/ArticleMetaSidebar.tsx
import { useState, useEffect } from 'react'
import { Globe, Clock, Tag, Image as ImageIcon, Volume2, BookOpen } from 'lucide-react'
import TagInput from '@/components/shared/TagInput'

interface Meta {
  status: string
  scheduledAt?: string
  moduleId?: number
  topicIds: number[]
  tagNames: string[]
  coverImageUrl: string
  seoTitle: string
  seoDescription: string
  audioUrl?: string
}

interface Props {
  meta: Meta
  onChange: (meta: Partial<Meta>) => void
  modules: { id: number; name: string }[]
  topics: { id: number; name: string; moduleId: number }[]
  allTags: { id: number; name: string }[]
  wordCount?: number
  readingTime?: number
}

export default function ArticleMetaSidebar({ meta, onChange, modules, topics, allTags, wordCount = 0, readingTime = 0 }: Props) {
  const [section, setSection] = useState<'publish' | 'taxonomy' | 'seo' | 'media'>('publish')

  const filteredTopics = meta.moduleId
    ? topics.filter((t) => t.moduleId === meta.moduleId)
    : topics

  const toggleTopicId = (id: number) => {
    const updated = meta.topicIds.includes(id)
      ? meta.topicIds.filter((x) => x !== id)
      : [...meta.topicIds, id]
    onChange({ topicIds: updated })
  }

  const Section = ({ id, label, children }: { id: typeof section; label: string; children: React.ReactNode }) => (
    <div className="border-b" style={{ borderColor: 'var(--bg-border)' }}>
      <button
        onClick={() => setSection(section === id ? section : id)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-gray-50 transition-colors"
        style={{ color: 'var(--text-primary)' }}
      >
        {label}
        <span style={{ color: 'var(--text-muted)' }}>{section === id ? '−' : '+'}</span>
      </button>
      {section === id && <div className="px-4 pb-4 space-y-3">{children}</div>}
    </div>
  )

  const inputClass = "w-full px-3 py-2 rounded-xl border text-sm outline-none"
  const inputStyle = { background: 'var(--bg-surface)', borderColor: 'var(--bg-border)', color: 'var(--text-primary)' }
  const labelClass = "text-xs mb-1 block"
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
      </Section>

      {/* Taxonomy */}
      <Section id="taxonomy" label="Module & Topics">
        <div>
          <label className={labelClass} style={labelStyle}>Module</label>
          <select
            value={meta.moduleId ?? ''}
            onChange={(e) => onChange({ moduleId: e.target.value ? Number(e.target.value) : undefined })}
            className={inputClass}
            style={inputStyle}
          >
            <option value="">— None —</option>
            {modules.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass} style={labelStyle}>Topics</label>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {filteredTopics.map((t) => (
              <label key={t.id} className="flex items-center gap-2 cursor-pointer py-1 hover:bg-gray-50 rounded-lg px-2">
                <input
                  type="checkbox"
                  checked={meta.topicIds.includes(t.id)}
                  onChange={() => toggleTopicId(t.id)}
                  className="accent-violet-500"
                />
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{t.name}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className={labelClass} style={labelStyle}>Tags</label>
          <TagInput
            value={meta.tagNames.map((n) => ({ name: n }))}
            onChange={(tags) => onChange({ tagNames: tags.map((t) => t.name) })}
            suggestions={allTags}
          />
        </div>
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

      {/* Media */}
      <Section id="media" label="Cover & Audio">
        <div>
          <label className={labelClass} style={labelStyle}>Cover Image URL</label>
          <input
            value={meta.coverImageUrl}
            onChange={(e) => onChange({ coverImageUrl: e.target.value })}
            placeholder="https://..."
            className={inputClass}
            style={inputStyle}
          />
          {meta.coverImageUrl && (
            <img src={meta.coverImageUrl} alt="cover" className="w-full h-28 object-cover rounded-xl mt-2 border" style={{ borderColor: 'var(--bg-border)' }} />
          )}
        </div>
        {meta.audioUrl && (
          <div>
            <label className={labelClass} style={labelStyle}>Audio</label>
            <audio controls src={meta.audioUrl} className="w-full" />
          </div>
        )}
      </Section>
    </aside>
  )
}
