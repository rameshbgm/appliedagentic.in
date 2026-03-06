'use client'
// app/(admin)/articles/ArticleEditorPage.tsx  (used by new & edit pages)
import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Save, Eye, Loader2, ImagePlus, X as XIcon, BookOpen, Clock, Globe, Tag, Navigation2, PlusCircle, Star, Sparkles } from 'lucide-react'
import MediaPickerModal from '@/components/admin/MediaPickerModal'
import TagInput from '@/components/shared/TagInput'
import { calculateReadingTime } from '@/lib/readingTime'
import ArticleSectionEditor, { type SectionData } from '@/components/admin/editor/ArticleSectionEditor'

interface InitialArticle {
  id?: number
  title: string
  slug: string
  summary: string
  content: string
  status: string
  coverImageUrl: string
  seoTitle: string
  seoDescription: string
  seoKeywords?: string
  ogTitle?: string
  ogDescription?: string
  twitterTitle?: string
  twitterDescription?: string
  aiContentDeclaration?: string
  audioUrl?: string
  tagNames: string[]
  subMenuIds: number[]
  menuIds: number[]
  isFeatured?: boolean
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
  ARCHIVED:  { bg: '#f1f5f9', text: '#94a3b8' },
}

export default function ArticleEditorPage({ initialArticle, menus, allTags }: Props) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [metaLoading, setMetaLoading] = useState(false)
  const [tagsLoading, setTagsLoading] = useState(false)
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
    subMenuIds: initialArticle.subMenuIds,
    menuIds: initialArticle.menuIds,
    tagNames: initialArticle.tagNames,
    seoTitle: initialArticle.seoTitle,
    seoDescription: initialArticle.seoDescription,
    seoKeywords: initialArticle.seoKeywords ?? '',
    ogTitle: initialArticle.ogTitle ?? '',
    ogDescription: initialArticle.ogDescription ?? '',
    twitterTitle: initialArticle.twitterTitle ?? '',
    twitterDescription: initialArticle.twitterDescription ?? '',
    aiContentDeclaration: initialArticle.aiContentDeclaration ?? 'human-written',
    audioUrl: initialArticle.audioUrl,
    isFeatured: initialArticle.isFeatured ?? false,
  })

  const combinedContent = sections.map(s => s.content).join(' ')
  const wordCount = combinedContent
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]*`/g, '')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_~>]+/g, '')
    .trim()
    .split(/\s+/).filter(Boolean).length
  const readingTime = calculateReadingTime(combinedContent)

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

  const generateMeta = async () => {
    setMetaLoading(true)
    try {
      const res = await fetch('/api/ai/generate-seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: title,
          context: combinedContent.slice(0, 3000),
        }),
      })
      const data = await res.json()
      if (data.success) {
        const d = data.data
        setMeta((m) => ({
          ...m,
          seoTitle:            (d.seoTitle            ?? m.seoTitle).slice(0, 60),
          seoDescription:      (d.seoDescription      ?? m.seoDescription).slice(0, 160),
          seoKeywords:         d.seoKeywords          ?? m.seoKeywords,
          ogTitle:             (d.ogTitle             ?? m.ogTitle).slice(0, 70),
          ogDescription:       (d.ogDescription       ?? m.ogDescription).slice(0, 200),
          twitterTitle:        (d.twitterTitle        ?? m.twitterTitle).slice(0, 70),
          twitterDescription:  (d.twitterDescription  ?? m.twitterDescription).slice(0, 200),
          tagNames:            d.tags?.length > 0 ? d.tags.slice(0, 10) : m.tagNames,
        }))
        toast.success('SEO metadata generated!')
      } else {
        toast.error(data.error ?? 'Meta generation failed')
      }
    } catch {
      toast.error('Failed to parse AI response')
    } finally {
      setMetaLoading(false)
    }
  }

  const generateTags = async () => {
    setTagsLoading(true)
    try {
      const res = await fetch('/api/ai/generate-tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Article title: ${title}\n\nContent excerpt:\n${combinedContent.slice(0, 2000)}`,
        }),
      })
      const data = await res.json()
      if (data.success) {
        const tags: string[] = data.data.tags ?? []
        const newTags = tags.slice(0, 10).map((t) => t.toLowerCase().trim()).filter(Boolean)
        setMeta((m) => ({ ...m, tagNames: newTags }))
        toast.success(`Generated ${newTags.length} tags!`)
      } else {
        toast.error(data.error ?? 'Tag generation failed')
      }
    } catch {
      toast.error('Failed to generate tags')
    } finally {
      setTagsLoading(false)
    }
  }

  const getPayload = () => ({
    title,
    slug: slug || autoSlug(title),
    summary,
    content: sections.map(s => s.content).join('\n'),
    coverImageUrl,
    status: meta.status,
    tagNames: meta.tagNames,
    seoTitle: meta.seoTitle,
    seoDescription: meta.seoDescription,
    seoKeywords: meta.seoKeywords,
    ogTitle: meta.ogTitle,
    ogDescription: meta.ogDescription,
    twitterTitle: meta.twitterTitle,
    twitterDescription: meta.twitterDescription,
    aiContentDeclaration: meta.aiContentDeclaration,
    audioUrl: meta.audioUrl,
    isFeatured: meta.isFeatured,
    subMenuIds: meta.subMenuIds,
    menuIds: meta.menuIds,
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
            <option value="ARCHIVED">Archived</option>
          </select>

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

          {/* Featured toggle */}
          <button
            type="button"
            onClick={() => setMeta((m) => ({ ...m, isFeatured: !m.isFeatured }))}
            title={meta.isFeatured ? 'Remove from Featured' : 'Mark as Featured'}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-colors"
            style={{
              borderColor: meta.isFeatured ? '#f59e0b' : 'var(--bg-border)',
              background: meta.isFeatured ? '#fef3c722' : 'transparent',
              color: meta.isFeatured ? '#d97706' : 'var(--text-muted)',
            }}
          >
            <Star size={13} fill={meta.isFeatured ? '#f59e0b' : 'none'} strokeWidth={2} />
            {meta.isFeatured ? 'Featured' : 'Feature'}
          </button>

          {/* Single Save button */}
          <button
            type="button"
            onClick={() => save()}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50 transition-opacity hover:opacity-90"
            style={{
              background: meta.status === 'PUBLISHED' ? '#1E293B' : 'var(--color-violet)',
              color: '#fff',
            }}
          >
            {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            {meta.status === 'PUBLISHED' ? 'Save & Publish'
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
              <button
                type="button"
                onClick={generateMeta}
                disabled={metaLoading || !title.trim()}
                className="ml-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium disabled:opacity-40 transition-opacity hover:opacity-80"
                style={{ background: 'rgba(124,58,237,0.1)', color: 'var(--color-violet)' }}
              >
                {metaLoading ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />}
                Generate with AI
              </button>
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

              {/* ── Open Graph ── */}
              <p className="text-xs font-semibold uppercase tracking-widest pt-2 border-t" style={{ color: 'var(--text-muted)', borderColor: 'var(--bg-border)' }}>Open Graph (Social)</p>

              {/* OG Title */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>OG Title</label>
                  <span className="text-xs" style={{ color: meta.ogTitle.length > 70 ? '#ef4444' : 'var(--text-muted)' }}>{meta.ogTitle.length}/70</span>
                </div>
                <input
                  value={meta.ogTitle}
                  onChange={(e) => setMeta((m) => ({ ...m, ogTitle: e.target.value }))}
                  placeholder={meta.seoTitle || title || 'Facebook / LinkedIn / Discord title...'}
                  className="w-full px-3 py-2 rounded-xl border text-sm outline-none"
                  style={{ background: 'var(--bg-surface)', borderColor: 'var(--bg-border)', color: 'var(--text-primary)' }}
                />
              </div>

              {/* OG Description */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>OG Description</label>
                  <span className="text-xs" style={{ color: meta.ogDescription.length > 200 ? '#ef4444' : 'var(--text-muted)' }}>{meta.ogDescription.length}/200</span>
                </div>
                <textarea
                  value={meta.ogDescription}
                  onChange={(e) => setMeta((m) => ({ ...m, ogDescription: e.target.value }))}
                  placeholder={meta.seoDescription || 'Social sharing description...'}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border text-sm outline-none resize-none"
                  style={{ background: 'var(--bg-surface)', borderColor: 'var(--bg-border)', color: 'var(--text-primary)' }}
                />
              </div>

              {/* ── Keywords ── */}
              <p className="text-xs font-semibold uppercase tracking-widest pt-2 border-t" style={{ color: 'var(--text-muted)', borderColor: 'var(--bg-border)' }}>Keywords</p>
              <div>
                <input
                  value={meta.seoKeywords}
                  onChange={(e) => setMeta((m) => ({ ...m, seoKeywords: e.target.value }))}
                  placeholder="ai agents, langchain, machine learning, ..."
                  className="w-full px-3 py-2 rounded-xl border text-sm outline-none"
                  style={{ background: 'var(--bg-surface)', borderColor: 'var(--bg-border)', color: 'var(--text-primary)' }}
                />
                <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>Comma-separated. Used for meta keywords tag and AI crawler context.</p>
              </div>

              {/* ── Twitter / X Card ── */}
              <p className="text-xs font-semibold uppercase tracking-widest pt-2 border-t" style={{ color: 'var(--text-muted)', borderColor: 'var(--bg-border)' }}>Twitter / X Card</p>

              {/* Twitter Title */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Twitter Title</label>
                  <span className="text-xs" style={{ color: meta.twitterTitle.length > 70 ? '#ef4444' : 'var(--text-muted)' }}>{meta.twitterTitle.length}/70</span>
                </div>
                <input
                  value={meta.twitterTitle}
                  onChange={(e) => setMeta((m) => ({ ...m, twitterTitle: e.target.value }))}
                  placeholder={meta.ogTitle || meta.seoTitle || title || 'Twitter / X title...'}
                  className="w-full px-3 py-2 rounded-xl border text-sm outline-none"
                  style={{ background: 'var(--bg-surface)', borderColor: 'var(--bg-border)', color: 'var(--text-primary)' }}
                />
              </div>

              {/* Twitter Description */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Twitter Description</label>
                  <span className="text-xs" style={{ color: meta.twitterDescription.length > 200 ? '#ef4444' : 'var(--text-muted)' }}>{meta.twitterDescription.length}/200</span>
                </div>
                <textarea
                  value={meta.twitterDescription}
                  onChange={(e) => setMeta((m) => ({ ...m, twitterDescription: e.target.value }))}
                  placeholder={meta.ogDescription || meta.seoDescription || 'Twitter / X description...'}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border text-sm outline-none resize-none"
                  style={{ background: 'var(--bg-surface)', borderColor: 'var(--bg-border)', color: 'var(--text-primary)' }}
                />
              </div>

              {/* ── AI / LLM Meta ── */}
              <p className="text-xs font-semibold uppercase tracking-widest pt-2 border-t" style={{ color: 'var(--text-muted)', borderColor: 'var(--bg-border)' }}>AI &amp; LLM Meta</p>

              {/* AI Content Declaration */}
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: 'var(--text-secondary)' }}>Content Declaration</label>
                <select
                  value={meta.aiContentDeclaration}
                  onChange={(e) => setMeta((m) => ({ ...m, aiContentDeclaration: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border text-sm outline-none"
                  style={{ background: 'var(--bg-surface)', borderColor: 'var(--bg-border)', color: 'var(--text-primary)' }}
                >
                  <option value="human-written">Human-written</option>
                  <option value="ai-assisted">AI-assisted</option>
                  <option value="ai-generated">AI-generated</option>
                </select>
                <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                  Declares authorship to AI crawlers (GPTBot, Anthropic, Gemini).
                </p>
              </div>
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
              {(meta.subMenuIds.length + meta.menuIds.length) > 0 && (
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'var(--color-violet)', color: '#fff' }}>
                  {meta.subMenuIds.length + meta.menuIds.length} assigned
                </span>
              )}
            </div>
            <div className="p-4 space-y-5">

              {/* Assignment pills — shows both direct menu and sub-menu assignments */}
              {(meta.menuIds.length > 0 || meta.subMenuIds.length > 0) && (
                <div className="flex flex-wrap gap-1.5">
                  {/* Direct menu pills */}
                  {menus
                    .filter((menu) => meta.menuIds.includes(menu.id))
                    .map((menu) => (
                      <span
                        key={`menu-${menu.id}`}
                        className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full font-medium"
                        style={{ background: 'rgba(16,185,129,0.12)', color: '#059669', border: '1px solid rgba(16,185,129,0.25)' }}
                      >
                        <span>📁</span>
                        <span>{menu.title}</span>
                      </span>
                    ))}
                  {/* Sub-menu pills */}
                  {menus.flatMap((menu) =>
                    (menu.subMenus ?? [])
                      .filter((sub) => meta.subMenuIds.includes(sub.id))
                      .map((sub) => (
                        <span
                          key={`sub-${sub.id}`}
                          className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full font-medium"
                          style={{ background: 'rgba(124,58,237,0.12)', color: 'var(--color-violet)', border: '1px solid rgba(124,58,237,0.25)' }}
                        >
                          <span style={{ opacity: 0.7 }}>{menu.title}</span>
                          <span style={{ opacity: 0.4 }}>›</span>
                          <span>{sub.title}</span>
                        </span>
                      ))
                  )}
                </div>
              )}

              {/* ── Direct Menu Assignment ── */}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
                  Assign to Main Menu
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {menus.map((menu) => {
                    const checked = meta.menuIds.includes(menu.id)
                    return (
                      <label
                        key={menu.id}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer transition-colors text-sm select-none"
                        style={{
                          borderColor: checked ? '#059669' : 'var(--bg-border)',
                          background: checked ? 'rgba(16,185,129,0.06)' : 'var(--bg-surface)',
                          color: checked ? '#059669' : 'var(--text-secondary)',
                        }}
                      >
                        <input
                          type="checkbox"
                          className="shrink-0"
                          style={{ accentColor: '#059669' }}
                          checked={checked}
                          onChange={(e) =>
                            setMeta((m) => ({
                              ...m,
                              menuIds: e.target.checked
                                ? [...m.menuIds, menu.id]
                                : m.menuIds.filter((id) => id !== menu.id),
                            }))
                          }
                        />
                        <span className="truncate text-xs font-medium">{menu.title}</span>
                      </label>
                    )
                  })}
                </div>
                {menus.length === 0 && (
                  <p className="text-xs italic" style={{ color: 'var(--text-muted)' }}>No menus configured yet.</p>
                )}
              </div>

              {/* ── Sub-menu Assignment ── */}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
                  Assign to Sub-menu
                </p>
                {menus.filter(m => (m.subMenus?.length ?? 0) > 0).map((menu) => (
                  <div key={menu.id} className="mb-3">
                    <p
                      className="text-[10px] font-medium mb-1.5 pl-0.5"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {menu.title}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                      {menu.subMenus?.map((sub) => {
                        const checked = meta.subMenuIds.includes(sub.id)
                        return (
                          <label
                            key={sub.id}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer transition-colors text-sm select-none"
                            style={{
                              borderColor: checked ? 'var(--color-violet)' : 'var(--bg-border)',
                              background: checked ? 'rgba(124,58,237,0.06)' : 'var(--bg-surface)',
                              color: checked ? 'var(--color-violet)' : 'var(--text-secondary)',
                            }}
                          >
                            <input
                              type="checkbox"
                              className="accent-violet-600 shrink-0"
                              checked={checked}
                              onChange={(e) =>
                                setMeta((m) => ({
                                  ...m,
                                  subMenuIds: e.target.checked
                                    ? [...m.subMenuIds, sub.id]
                                    : m.subMenuIds.filter((id) => id !== sub.id),
                                }))
                              }
                            />
                            <span className="truncate text-xs font-medium">{sub.title}</span>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                ))}
                {menus.every(m => (m.subMenus?.length ?? 0) === 0) && (
                  <p className="text-xs italic" style={{ color: 'var(--text-muted)' }}>No sub-menus configured yet.</p>
                )}
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
                <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'var(--color-violet)', color: '#fff' }}>
                  {meta.tagNames.length}/10
                </span>
              )}
              <button
                type="button"
                onClick={generateTags}
                disabled={tagsLoading || !title.trim()}
                className="ml-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium disabled:opacity-40 transition-opacity hover:opacity-80"
                style={{ background: 'rgba(124,58,237,0.1)', color: 'var(--color-violet)' }}
              >
                {tagsLoading ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />}
                Generate tags
              </button>
            </div>
            <div className="p-4">
              <TagInput
                value={meta.tagNames.map((n) => ({ name: n }))}
                onChange={(tags) => {
                  const names = tags.map((t) => t.name).slice(0, 10)
                  setMeta((m) => ({ ...m, tagNames: names }))
                }}
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
