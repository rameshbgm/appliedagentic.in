'use client'
// app/(admin)/articles/ArticleEditorPage.tsx  (used by new & edit pages)
import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Save, Eye, Send, Loader2 } from 'lucide-react'
import dynamic from 'next/dynamic'
import ArticleMetaSidebar from '@/components/admin/ArticleMetaSidebar'
import { calculateReadingTime } from '@/lib/readingTime'
import { stripHtml } from '@/lib/utils'

const ArticleEditor = dynamic(() => import('@/components/admin/editor/ArticleEditor'), {
  ssr: false,
  loading: () => <div className="h-96 rounded-2xl skeleton" />,
})

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
  topicIds: number[]
  tagNames: string[]
  moduleId?: number
}

interface Props {
  initialArticle: InitialArticle
  modules: { id: number; name: string }[]
  topics: { id: number; name: string; moduleId: number }[]
  allTags: { id: number; name: string }[]
}

export default function ArticleEditorPage({ initialArticle, modules, topics, allTags }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [autoSaveTimer, setAutoSaveTimer] = useState<ReturnType<typeof setTimeout> | null>(null)

  const [title, setTitle] = useState(initialArticle.title)
  const [slug, setSlug] = useState(initialArticle.slug)
  const [summary, setSummary] = useState(initialArticle.summary)
  const [content, setContent] = useState(initialArticle.content)
  const [meta, setMeta] = useState({
    status: initialArticle.status,
    scheduledAt: initialArticle.scheduledAt,
    moduleId: initialArticle.moduleId,
    topicIds: initialArticle.topicIds,
    tagNames: initialArticle.tagNames,
    coverImageUrl: initialArticle.coverImageUrl,
    seoTitle: initialArticle.seoTitle,
    seoDescription: initialArticle.seoDescription,
    audioUrl: initialArticle.audioUrl,
  })

  const wordCount = stripHtml(content).split(/\s+/).filter(Boolean).length
  const readingTime = calculateReadingTime(content)

  const autoSlug = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const handleTitleChange = (v: string) => {
    setTitle(v)
    if (!initialArticle.id) setSlug(autoSlug(v))
  }

  const getPayload = () => ({
    title,
    slug: slug || autoSlug(title),
    summary,
    content,
    ...meta,
    topicIds: meta.topicIds,
    tagNames: meta.tagNames,
  })

  const save = useCallback(async (publish = false) => {
    if (!title.trim()) { toast.error('Title is required'); return }
    setSaving(true)
    try {
      const payload = { ...getPayload(), ...(publish ? { status: 'PUBLISHED' } : {}) }
      const url = initialArticle.id ? `/api/articles/${initialArticle.id}` : '/api/articles'
      const method = initialArticle.id ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(publish ? 'Article published!' : 'Saved!')
        if (!initialArticle.id) {
          router.push(`/admin/articles/${data.data.id}/edit`)
        } else {
          router.refresh()
        }
      } else {
        toast.error(data.error ?? 'Save failed')
      }
    } finally {
      setSaving(false)
    }
  }, [title, slug, summary, content, meta, initialArticle.id]) // eslint-disable-line

  // Auto-save every 60s
  useEffect(() => {
    if (autoSaveTimer) clearTimeout(autoSaveTimer)
    const timer = setTimeout(() => {
      if (initialArticle.id && title.trim()) {
        save(false)
      }
    }, 60000)
    setAutoSaveTimer(timer)
    return () => clearTimeout(timer)
  }, [title, slug, summary, content, meta]) // eslint-disable-line

  return (
    <div className="space-y-4">
      {/* Topbar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-display font-bold text-xl" style={{ color: 'var(--text-primary)' }}>
          {initialArticle.id ? 'Edit Article' : 'New Article'}
        </h1>
        <div className="flex items-center gap-3">
          {initialArticle.id && (
            <a
              href={`/articles/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs border hover:bg-gray-50 transition-colors"
              style={{ borderColor: 'var(--bg-border)', color: 'var(--text-secondary)' }}
            >
              <Eye size={14} />Preview
            </a>
          )}
          <button
            onClick={() => save(false)}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm border disabled:opacity-50"
            style={{ borderColor: 'var(--bg-border)', color: 'var(--text-secondary)' }}
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Save Draft
          </button>
          <button
            onClick={() => save(true)}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-black disabled:opacity-50"
            style={{ background: '#AAFF00' }}
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            Publish
          </button>
        </div>
      </div>

      {/* Title & slug */}
      <div className="space-y-2">
        <input
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Article title..."
          className="w-full bg-transparent outline-none font-display font-bold text-3xl resize-none"
          style={{ color: 'var(--text-primary)' }}
        />
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>/articles/</span>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
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

      {/* Editor + Sidebar */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <div className="flex-1 min-w-0 w-full">
          <ArticleEditor
            content={content}
            onChange={setContent}
            articleId={initialArticle.id}
            onAudioGenerated={(url) => setMeta((m) => ({ ...m, audioUrl: url }))}
          />
        </div>
        <ArticleMetaSidebar
          meta={meta}
          onChange={(partial) => setMeta((m) => ({ ...m, ...partial }))}
          modules={modules}
          topics={topics}
          allTags={allTags}
          wordCount={wordCount}
          readingTime={readingTime}
        />
      </div>
    </div>
  )
}
