'use client'
// app/(admin)/articles/ArticleEditorPage.tsx  (used by new & edit pages)
import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Save, Eye, Loader2, ImagePlus, X as XIcon, BookOpen, Clock, Globe, Tag, Navigation2, PlusCircle } from 'lucide-react'
import MediaPickerModal from '@/components/admin/MediaPickerModal'
import TagInput from '@/components/shared/TagInput'
import { calculateReadingTime } from '@/lib/readingTime'
import { stripHtml } from '@/lib/utils'
import ArticleSectionEditor, { type SectionData } from '@/components/admin/editor/ArticleSectionEditor'

interface InitialArticle {
  id?: number
  title: string
  slug: string
  summary: string
  content: string
  status: string
  scheduledAt?: string
  coverImageUrl: string
  seoTitle: string
  seoDescription: string
  audioUrl?: string
  tagNames: string[]
  navMenuId?: number
  subMenuIds: number[]
  sections?: { id: number; title: string; content: string; order: number }[]
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
  initialArticle: InitialArticle
  menus: NavMenu[]
  allTags: { id: number; name: string }[]
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  DRAFT:     { bg: '#f1f5f9', text: '#64748b' },
  PUBLISHED: { bg: '#dcfce7', text: '#16a34a' },
  SCHEDULED: { bg: '#fef3c7', text: '#d97706' },
  ARCHIVED:  { bg: '#f1f5f9', text: '#94a3b8' },
}

export default function ArticleEditorPage({ initialArticle, menus, allTags }: Props) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [autoSaveTimer, setAutoSaveTimer] = useState<ReturnType<typeof setTimeout> | null>(null)
  const [showCoverPicker, setShowCoverPicker] = useState(false)

  const [title, setTitle] = useState(initialArticle.title)
  const [slug, setSlug] = useState(initialArticle.slug)
  const [summary, setSummary] = useState(initialArticle.summary)
  const [coverImageUrl, setCoverImageUrl] = useState(initialArticle.coverImageUrl)

  // Multi-section state — default from DB sections or fall back to a single section from legacy content
  const makeDefaultSections = (): SectionData[] => {
    if (initialArticle.sections && initialArticle.sections.length > 0) {
      return initialArticle.sections.map((s) => ({
        tempId: `existing-${s.id}`,
        id: s.id,
        title: s.title,
        content: s.content,
        order: s.order,
      }))
    }
    return [{ tempId: 'section-0', title: '', content: initialArticle.content, order: 0 }]
  }
  const [sections, setSections] = useState<SectionData[]>(makeDefaultSections)
  const [meta, setMeta] = useState({
    status: initialArticle.status,
    scheduledAt: initialArticle.scheduledAt,
    navMenuId: initialArticle.navMenuId,
    subMenuIds: initialArticle.subMenuIds,
    tagNames: initialArticle.tagNames,
    seoTitle: initialArticle.seoTitle,
    seoDescription: initialArticle.seoDescription,
    audioUrl: initialArticle.audioUrl,
  })

  const wordCount = stripHtml(sections.map(s => s.content).join(' ')).split(/\s+/).filter(Boolean).length
  const readingTime = calculateReadingTime(sections.map(s => s.content).join(' '))

  // Section helpers
  const updateSection = useCallback((tempId: string, updated: SectionData) => {
    setSections((prev) => prev.map((s) => s.tempId === tempId ? updated : s))
  }, [])

  const deleteSection = useCallback((tempId: string) => {
    setSections((prev) => {
      const next = prev.filter((s) => s.tempId !== tempId)
      return next.map((s, i) => ({ ...s, order: i }))
    })
  }, [])

  const moveSection = useCallback((from: number, to: number) => {
    setSections((prev) => {
      const next = [...prev]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      return next.map((s, i) => ({ ...s, order: i }))
    })
  }, [])

  const addSection = useCallback(() => {
    setSections((prev) => [
      ...prev,
      {
        tempId: `section-${Date.now()}`,
        title: '',
        content: '',
        order: prev.length,
      },
    ])
  }, [])

  const autoSlug = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const handleTitleChange = (v: string) => {
    setTitle(v)
    if (!initialArticle.id) setSlug(autoSlug(v))
  }

  const getPayload = () => ({
    title,
    slug: slug || autoSlug(title),
    summary,
    // legacy content field: combine all sections for backward compat / search indexing
    content: sections.map(s => s.content).join('\n'),
    coverImageUrl,
    status: meta.status,
    scheduledAt: meta.scheduledAt,
    tagNames: meta.tagNames,
    seoTitle: meta.seoTitle,
    seoDescription: meta.seoDescription,
    audioUrl: meta.audioUrl,
    subMenuIds: meta.subMenuIds,
    sections: sections.map((s, i) => ({
      id: s.id,
      title: s.title,
      content: s.content,
      order: i,
    })),
  })

  const save = useCallback(async () => {
    if (!title.trim()) { toast.error('Title is required'); return }
    setSaving(true)
    try {
      const payload = getPayload()
      const url = initialArticle.id ? `/api/articles/${initialArticle.id}` : '/api/articles'
      const method = initialArticle.id ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.success) {
        const label = meta.status.charAt(0) + meta.status.slice(1).toLowerCase()
        toast.success(`Saved as ${label}!`)
        if (!initialArticle.id) {
          router.push(`/admin/articles/${data.data.id}/edit`)
        } else {
          // Sync saved section IDs back to state
          if (data.data?.sections) {
            setSections(data.data.sections.map((s: { id: number; title: string; content: string; order: number }) => ({
              tempId: `existing-${s.id}`,
              id: s.id,
              title: s.title,
              content: s.content,
              order: s.order,
            })))
          }
          router.refresh()
        }
      } else {
        toast.error(data.error ?? 'Save failed')
      }
    } finally {
      setSaving(false)
    }
  }, [title, slug, summary, sections, coverImageUrl, meta, initialArticle.id]) // eslint-disable-line

  // Auto-save every 60s
  useEffect(() => {
    if (autoSaveTimer) clearTimeout(autoSaveTimer)
    const timer = setTimeout(() => {
      if (initialArticle.id && title.trim()) save()
    }, 60000)
    setAutoSaveTimer(timer)
    return () => clearTimeout(timer)
  }, [title, slug, summary, sections, coverImageUrl, meta]) // eslint-disable-line

  const statusColor = STATUS_COLORS[meta.status] ?? STATUS_COLORS.DRAFT

  // Prevent hydration mismatch from browser extensions injecting attributes into form inputs
  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return (
    <div className="space-y-4 animate-pulse">
      <div className="h-14 rounded-2xl" style={{ background: 'var(--bg-elevated)' }} />
      <div className="h-32 rounded-2xl" style={{ background: 'var(--bg-elevated)' }} />
      <div className="h-96 rounded-2xl" style={{ background: 'var(--bg-elevated)' }} />
    </div>
  )

  return (
    <div className="space-y-4">
      {/* ── Topbar ── */}
      <div
        className="flex items-center justify-between flex-wrap gap-3 px-4 py-3 rounded-2xl border"
        style={{ background: 'var(--bg-elevated)', borderColor: 'var(--bg-border)' }}
      >
        {/* Left: status + scheduled-date + preview + save */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status select */}
          <select
            value={meta.status}
            onChange={(e) => setMeta((m) => ({ ...m, status: e.target.value, subMenuIds: m.subMenuIds }))}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border outline-none cursor-pointer"
            style={{
              background: statusColor.bg,
              color: statusColor.text,
              borderColor: statusColor.text + '40',
            }}
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="ARCHIVED">Archived</option>
          </select>
          {/* Scheduled date inline */}
          {meta.status === 'SCHEDULED' && (
            <input
              type="datetime-local"
              value={meta.scheduledAt ?? ''}
              onChange={(e) => setMeta((m) => ({ ...m, scheduledAt: e.target.value }))}
              className="px-3 py-1.5 rounded-lg text-xs border outline-none"
              style={{ background: 'var(--bg-surface)', borderColor: 'var(--bg-border)', color: 'var(--text-primary)' }}
            />
          )}

          {/* Preview */}
          {initialArticle.id && (
            <a
              href={`/articles/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border hover:bg-gray-50 transition-colors"
              style={{ borderColor: 'var(--bg-border)', color: 'var(--text-secondary)' }}
            >
              <Eye size={13} />
              Preview
            </a>
          )}

          {/* Single Save button */}
          <button
            type="button"
            onClick={() => save()}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50 transition-opacity hover:opacity-90"
            style={{
              background: meta.status === 'PUBLISHED' ? '#AAFF00'
                : meta.status === 'SCHEDULED' ? '#fef3c7'
                : 'var(--color-violet)',
              color: meta.status === 'PUBLISHED' ? '#000' : meta.status === 'SCHEDULED' ? '#d97706' : '#fff',
            }}
          >
            {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            {meta.status === 'PUBLISHED' ? 'Save & Publish'
              : meta.status === 'SCHEDULED' ? 'Save & Schedule'
              : meta.status === 'ARCHIVED' ? 'Archive'
              : 'Save Draft'}
          </button>
        </div>

        {/* Right: stats */}
        <div className="flex items-center gap-2 ml-auto">
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs"
            style={{ background: 'var(--bg-surface)', color: 'var(--text-muted)' }}
          >
            <BookOpen size={11} />
            {wordCount.toLocaleString()} words
          </span>
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs"
            style={{ background: 'var(--bg-surface)', color: 'var(--text-muted)' }}
          >
            <Clock size={11} />
            {readingTime} min read
          </span>
        </div>
      </div>

      {/* ── Title / Slug / Summary ── */}
      <div className="space-y-2 px-1">
        <input
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Article title..."
          className="w-full bg-transparent outline-none font-display font-bold text-3xl"
          style={{ color: 'var(--text-primary)' }}
        />
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>/articles/</span>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="article-slug"
            className="flex-1 text-xs bg-transparent outline-none border-b border-dashed"
            style={{ borderColor: 'var(--bg-border)', color: 'var(--color-violet)' }}
          />
        </div>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Brief summary / excerpt (shown in cards and search)..."
          rows={2}
          className="w-full bg-transparent outline-none text-base resize-none"
          style={{ color: 'var(--text-secondary)' }}
        />
      </div>

      {/* ── Editor + Sections ── */}
      <div className="w-full space-y-4">

          {/* ── Content Sections ── */}
          <div className="space-y-3">
            {sections.map((section, idx) => (
              <ArticleSectionEditor
                key={section.tempId}
                section={section}
                index={idx}
                total={sections.length}
                articleId={initialArticle.id}
                onChange={(updated) => updateSection(section.tempId, updated)}
                onDelete={() => deleteSection(section.tempId)}
                onMoveUp={() => moveSection(idx, idx - 1)}
                onMoveDown={() => moveSection(idx, idx + 1)}
                onAudioGenerated={(url) => setMeta((m) => ({ ...m, audioUrl: url }))}
              />
            ))}

            {/* Add Section button */}
            <button
              type="button"
              onClick={addSection}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-dashed text-sm font-medium hover:opacity-80 transition-all"
              style={{ borderColor: 'var(--color-violet)', color: 'var(--color-violet)', background: 'transparent' }}
            >
              <PlusCircle size={16} />
              Add Content Section
            </button>
          </div>

          {/* ── Cover Image Section ── */}
          <div
            className="rounded-2xl border overflow-hidden"
            style={{ background: 'var(--bg-elevated)', borderColor: 'var(--bg-border)' }}
          >
            <div
              className="flex items-center justify-between px-4 py-3 border-b"
              style={{ borderColor: 'var(--bg-border)' }}
            >
              <div className="flex items-center gap-2">
                <ImagePlus size={15} style={{ color: 'var(--color-violet)' }} />
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  Cover Image
                </span>
              </div>
              <div className="flex items-center gap-2">
                {coverImageUrl && (
                  <button
                    type="button"
                    onClick={() => setCoverImageUrl('')}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs border hover:bg-red-50 transition-colors"
                    style={{ borderColor: 'var(--bg-border)', color: 'var(--text-muted)' }}
                  >
                    <XIcon size={11} />
                    Remove
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowCoverPicker(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:opacity-90"
                  style={{ background: 'var(--color-violet)', color: '#fff' }}
                >
                  <ImagePlus size={12} />
                  {coverImageUrl ? 'Change' : 'Select from Media'}
                </button>
              </div>
            </div>

            {coverImageUrl ? (
              <div className="relative">
                <img
                  src={coverImageUrl}
                  alt="Cover"
                  className="w-full max-h-72 object-cover"
                />
                <div
                  className="absolute bottom-3 left-3 px-2 py-1 rounded-lg text-xs"
                  style={{ background: 'rgba(0,0,0,0.6)', color: '#fff' }}
                >
                  Cover image
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowCoverPicker(true)}
                className="w-full flex flex-col items-center justify-center gap-3 py-16 border-2 border-dashed m-4 rounded-xl hover:bg-black/3 transition-colors"
                style={{
                  borderColor: 'var(--bg-border)',
                  width: 'calc(100% - 2rem)',
                }}
              >
                <ImagePlus size={28} style={{ color: 'var(--text-muted)' }} />
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Click to select a cover image from your media library
                </span>
              </button>
            )}
          </div>

          {/* ── SEO Section ── */}
          <div
            className="rounded-2xl border overflow-hidden"
            style={{ background: 'var(--bg-elevated)', borderColor: 'var(--bg-border)' }}
          >
            <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: 'var(--bg-border)' }}>
              <Globe size={15} style={{ color: 'var(--color-violet)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>SEO &amp; Social</span>
            </div>
            <div className="p-4 space-y-4">
              {/* SERP Preview */}
              <div className="p-3 rounded-xl border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--bg-border)' }}>
                <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Google Preview</p>
                <p className="text-sm font-medium mb-0.5 truncate" style={{ color: '#1a0dab' }}>
                  {meta.seoTitle || title || 'Page Title'}
                </p>
                <p className="text-xs mb-0.5" style={{ color: '#006621' }}>
                  appliedagentic.in/articles/{slug || 'article-slug'}
                </p>
                <p className="text-xs line-clamp-2" style={{ color: '#545454' }}>
                  {meta.seoDescription || summary || 'No description provided. Add a meta description to improve click-through rates.'}
                </p>
              </div>

              {/* SEO Title */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>SEO Title</label>
                  <span className="text-xs" style={{ color: meta.seoTitle.length > 60 ? '#ef4444' : meta.seoTitle.length > 50 ? '#f59e0b' : 'var(--text-muted)' }}>
                    {meta.seoTitle.length}/60
                  </span>
                </div>
                <input
                  value={meta.seoTitle}
                  onChange={(e) => setMeta((m) => ({ ...m, seoTitle: e.target.value }))}
                  placeholder={title || 'Override the page title for search engines...'}
                  className="w-full px-3 py-2 rounded-xl border text-sm outline-none"
                  style={{ background: 'var(--bg-surface)', borderColor: 'var(--bg-border)', color: 'var(--text-primary)' }}
                />
              </div>

              {/* Meta Description */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Meta Description</label>
                  <span className="text-xs" style={{ color: meta.seoDescription.length > 160 ? '#ef4444' : meta.seoDescription.length > 140 ? '#f59e0b' : 'var(--text-muted)' }}>
                    {meta.seoDescription.length}/160
                  </span>
                </div>
                <textarea
                  value={meta.seoDescription}
                  onChange={(e) => setMeta((m) => ({ ...m, seoDescription: e.target.value }))}
                  placeholder={summary || 'Describe this article for search engines and social sharing...'}
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border text-sm outline-none resize-none"
                  style={{ background: 'var(--bg-surface)', borderColor: 'var(--bg-border)', color: 'var(--text-primary)' }}
                />
              </div>

              {/* OG image hint */}
              {coverImageUrl && (
                <div className="flex items-center gap-3 p-2 rounded-xl border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--bg-border)' }}>
                  <img src={coverImageUrl} alt="" className="w-16 h-10 rounded-lg object-cover shrink-0" />
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Cover image will be used as the social share (OG) image.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── Navigation Section ── */}
          <div
            className="rounded-2xl border overflow-hidden"
            style={{ background: 'var(--bg-elevated)', borderColor: 'var(--bg-border)' }}
          >
            <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: 'var(--bg-border)' }}>
              <Navigation2 size={15} style={{ color: 'var(--color-violet)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Navigation</span>
              {meta.subMenuIds.length > 0 && (
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'var(--color-violet)', color: '#fff' }}>
                  {meta.subMenuIds.length} selected
                </span>
              )}
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Menu select */}
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Menu</label>
                <select
                  value={meta.navMenuId ?? ''}
                  onChange={(e) => {
                    const val = e.target.value ? Number(e.target.value) : undefined
                    setMeta((m) => ({ ...m, navMenuId: val, subMenuIds: [] }))
                  }}
                  className="w-full px-3 py-2 rounded-xl border text-sm outline-none"
                  style={{ background: 'var(--bg-surface)', borderColor: 'var(--bg-border)', color: 'var(--text-primary)' }}
                >
                  <option value="">— None —</option>
                  {menus.map((m) => (
                    <option key={m.id} value={m.id}>{m.title}</option>
                  ))}
                </select>
              </div>
              {/* Sub-menus */}
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Sub-menu</label>
                {!meta.navMenuId ? (
                  <p className="text-xs italic" style={{ color: 'var(--text-muted)' }}>Select a menu first.</p>
                ) : (() => {
                  const subs = menus.find((m) => m.id === meta.navMenuId)?.subMenus ?? []
                  return subs.length === 0 ? (
                    <p className="text-xs italic" style={{ color: 'var(--text-muted)' }}>No sub-menus for this menu.</p>
                  ) : (
                    <div>
                      <select
                        multiple
                        size={Math.min(subs.length, 6)}
                        value={meta.subMenuIds.map(String)}
                        onChange={(e) => {
                          const selected = Array.from(e.target.selectedOptions, (opt) => Number(opt.value))
                          setMeta((m) => ({ ...m, subMenuIds: selected }))
                        }}
                        className="w-full rounded-xl border text-sm outline-none"
                        style={{ background: 'var(--bg-surface)', borderColor: 'var(--bg-border)', color: 'var(--text-primary)' }}
                      >
                        {subs.map((sm) => (
                          <option
                            key={sm.id}
                            value={sm.id}
                            style={{ padding: '6px 12px' }}
                          >
                            {sm.title}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                        Hold {typeof navigator !== 'undefined' && /Mac/i.test(navigator.platform) ? '⌘' : 'Ctrl'} to select multiple
                      </p>
                    </div>
                  )
                })()}
              </div>
            </div>
          </div>

          {/* ── Tags Section ── */}
          <div
            className="rounded-2xl border overflow-hidden"
            style={{ background: 'var(--bg-elevated)', borderColor: 'var(--bg-border)' }}
          >
            <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: 'var(--bg-border)' }}>
              <Tag size={15} style={{ color: 'var(--color-violet)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Tags</span>
              {meta.tagNames.length > 0 && (
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'var(--color-violet)', color: '#fff' }}>
                  {meta.tagNames.length}
                </span>
              )}
            </div>
            <div className="p-4">
              <TagInput
                value={meta.tagNames.map((n) => ({ name: n }))}
                onChange={(tags) => setMeta((m) => ({ ...m, tagNames: tags.map((t) => t.name) }))}
                suggestions={allTags}
              />
              {meta.tagNames.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {meta.tagNames.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
                      style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)', border: '1px solid var(--bg-border)' }}
                    >
                      #{t}
                      <button
                        type="button"
                        onClick={() => setMeta((m) => ({ ...m, tagNames: m.tagNames.filter((x) => x !== t) }))}
                        className="opacity-50 hover:opacity-100 transition-opacity ml-0.5"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

      </div>

      {/* Media Picker Modal */}
      {showCoverPicker && (
        <MediaPickerModal
          onSelect={(url) => setCoverImageUrl(url)}
          onClose={() => setShowCoverPicker(false)}
        />
      )}
    </div>
  )
}
