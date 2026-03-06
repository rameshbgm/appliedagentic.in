'use client'
// app/(admin)/admin/menus/[id]/articles/MenuArticleLinker.tsx
// Links / unlinks articles to a top-level nav menu, with multi-select support
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Plus, X, Search, Loader2, CheckSquare, Square, Link2 } from 'lucide-react'
import Link from 'next/link'

interface LinkedArticle {
  id: number
  menuId: number
  articleId: number
  orderIndex: number
  article: {
    id: number
    title: string
    slug: string
    summary: string | null
    status: string
    publishedAt: string | null
    readingTimeMinutes: number | null
  }
}

interface SearchResult {
  id: number
  title: string
  slug: string
  status: string
}

interface Props {
  menuId: number
  menuTitle: string
  initialArticles: LinkedArticle[]
  compact?: boolean
}

export default function MenuArticleLinker({ menuId, menuTitle, initialArticles, compact }: Props) {
  const router = useRouter()
  const [articles, setArticles] = useState<LinkedArticle[]>(initialArticles)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [addingMulti, setAddingMulti] = useState(false)

  const linkedIds = new Set(articles.map((a) => a.articleId))

  // ── Search ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([])
      return
    }
    const timer = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(`/api/articles?search=${encodeURIComponent(searchQuery)}&limit=30`)
        const data = await res.json()
        if (data.success) {
          setSearchResults(
            (data.data?.items ?? data.data ?? []).filter(
              (a: SearchResult) => !linkedIds.has(a.id)
            )
          )
        }
      } catch { /* ignore */ }
      finally { setSearching(false) }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, articles]) // eslint-disable-line

  const refreshList = useCallback(async () => {
    const res = await fetch(`/api/menus/${menuId}/articles`)
    const data = await res.json()
    if (data.success) setArticles(data.data)
  }, [menuId])

  // ── Single-link ──────────────────────────────────────────────────────────────
  const linkArticle = async (articleId: number) => {
    const res = await fetch(`/api/menus/${menuId}/articles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ articleId }),
    })
    const data = await res.json()
    if (data.success) {
      toast.success('Article linked')
      await refreshList()
      setSearchResults((prev) => prev.filter((a) => a.id !== articleId))
      router.refresh()
    } else {
      toast.error(data.error ?? 'Failed to link')
    }
  }

  // ── Multi-select toggle ──────────────────────────────────────────────────────
  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  // ── Bulk-link selected ───────────────────────────────────────────────────────
  const linkSelected = async () => {
    if (selectedIds.size === 0) return
    setAddingMulti(true)
    try {
      const ids = [...selectedIds]
      for (const articleId of ids) {
        await fetch(`/api/menus/${menuId}/articles`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ articleId }),
        })
      }
      toast.success(`${ids.length} article${ids.length > 1 ? 's' : ''} linked`)
      setSelectedIds(new Set())
      setSearchQuery('')
      setSearchResults([])
      await refreshList()
      router.refresh()
    } catch {
      toast.error('Failed to link some articles')
    } finally {
      setAddingMulti(false)
    }
  }

  // ── Unlink ───────────────────────────────────────────────────────────────────
  const unlinkArticle = async (articleId: number) => {
    const res = await fetch(`/api/menus/${menuId}/articles?articleId=${articleId}`, {
      method: 'DELETE',
    })
    const data = await res.json()
    if (data.success) {
      toast.success('Article unlinked')
      setArticles((prev) => prev.filter((a) => a.articleId !== articleId))
      router.refresh()
    } else {
      toast.error(data.error ?? 'Failed to unlink')
    }
  }

  const unlinkedResults = searchResults.filter((r) => !linkedIds.has(r.id))

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      {!compact ? (
        <div>
          <Link
            href="/admin/menus"
            className="text-sm hover:underline mb-2 inline-block"
            style={{ color: 'var(--text-muted)' }}
          >
            ← Back to Menus
          </Link>
          <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>
            Articles in &ldquo;{menuTitle}&rdquo;
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {articles.length} article{articles.length !== 1 ? 's' : ''} linked directly to this menu
          </p>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-xl" style={{ color: 'var(--text-primary)' }}>
              Direct Articles
            </h2>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {articles.length} article{articles.length !== 1 ? 's' : ''} linked directly to this menu
            </p>
          </div>
          <Link
            href={`/admin/menus/${menuId}/articles`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border hover:bg-gray-100 transition-colors"
            style={{ borderColor: 'var(--bg-border)', color: 'var(--text-secondary)' }}
          >
            <Link2 size={12} /> Manage all
          </Link>
        </div>
      )}

      {/* Search + multi-select panel */}
      <div className="card p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Search size={14} style={{ color: 'var(--text-muted)' }} />
          <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            Add Articles
          </span>
          {selectedIds.size > 0 && (
            <span className="ml-auto flex items-center gap-2">
              <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>
                {selectedIds.size} selected
              </span>
              <button
                onClick={linkSelected}
                disabled={addingMulti}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white disabled:opacity-50"
                style={{ background: 'var(--green)' }}
              >
                {addingMulti ? <Loader2 size={11} className="animate-spin" /> : <Plus size={11} />}
                Add {selectedIds.size}
              </button>
            </span>
          )}
        </div>

        <input
          suppressHydrationWarning
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input w-full"
          placeholder="Search articles by title…"
        />

        {searching && (
          <p className="text-xs flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
            <Loader2 size={11} className="animate-spin" /> Searching…
          </p>
        )}

        {unlinkedResults.length > 0 && (
          <div className="rounded-xl overflow-hidden border" style={{ borderColor: 'var(--bg-border)' }}>
            {/* Multi-select all toggle */}
            <button
              onClick={() =>
                setSelectedIds(
                  selectedIds.size === unlinkedResults.length
                    ? new Set()
                    : new Set(unlinkedResults.map((r) => r.id))
                )
              }
              className="flex items-center gap-2 w-full px-4 py-2 text-xs font-medium border-b transition-colors hover:bg-gray-50"
              style={{ borderColor: 'var(--bg-border)', color: 'var(--text-muted)', background: 'var(--bg-surface)' }}
            >
              {selectedIds.size === unlinkedResults.length ? (
                <CheckSquare size={13} className="text-blue-500" />
              ) : (
                <Square size={13} />
              )}
              Select all ({unlinkedResults.length})
            </button>

            <div className="max-h-56 overflow-y-auto" style={{ background: 'var(--bg-surface)' }}>
              {unlinkedResults.map((article) => {
                const isSelected = selectedIds.has(article.id)
                return (
                  <div
                    key={article.id}
                    className="flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors border-b last:border-0"
                    style={{ borderColor: 'var(--bg-border)', background: isSelected ? 'var(--bg-elevated)' : 'transparent' }}
                    onClick={() => toggleSelect(article.id)}
                    onMouseEnter={(e) => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'var(--bg-elevated)' }}
                    onMouseLeave={(e) => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                  >
                    <div className="flex-shrink-0">
                      {isSelected ? (
                        <CheckSquare size={15} className="text-blue-500" />
                      ) : (
                        <Square size={15} style={{ color: 'var(--text-muted)' }} />
                      )}
                    </div>
                    <span className="flex-1 text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                      {article.title}
                    </span>
                    <span className={`badge ${article.status === 'PUBLISHED' ? 'badge-success' : 'badge-warning'}`}>
                      {article.status}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); linkArticle(article.id) }}
                      className="p-1 rounded-lg transition-colors hover:bg-green-500/10"
                      title="Link now"
                    >
                      <Plus size={13} className="text-green-500" />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Linked articles list */}
      <div className="space-y-2">
        {articles.map((item, idx) => (
          <div key={item.id} className="card p-4 flex items-center gap-4 group">
            <span className="text-xs font-mono w-6 text-center shrink-0" style={{ color: 'var(--text-muted)' }}>
              {idx + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                {item.article.title}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                /{item.article.slug} ·{' '}
                <span className={item.article.status === 'PUBLISHED' ? 'text-green-500' : 'text-amber-500'}>
                  {item.article.status}
                </span>
                {item.article.readingTimeMinutes ? ` · ${item.article.readingTimeMinutes} min` : ''}
              </p>
            </div>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Link
                href={`/admin/articles/${item.articleId}/edit`}
                className="px-2.5 py-1 rounded-lg text-xs font-medium transition-colors hover:bg-gray-100"
                style={{ color: 'var(--text-secondary)', border: '1px solid var(--bg-border)' }}
              >
                Edit
              </Link>
              <button
                onClick={() => unlinkArticle(item.articleId)}
                className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                title="Unlink"
              >
                <X size={14} className="text-red-400" />
              </button>
            </div>
          </div>
        ))}

        {articles.length === 0 && (
          <div
            className="text-center py-12 rounded-2xl border-2 border-dashed"
            style={{ borderColor: 'var(--bg-border)', color: 'var(--text-muted)' }}
          >
            <p className="text-sm">No articles linked yet.</p>
            <p className="text-xs mt-1">Use the search above to link articles to this menu.</p>
          </div>
        )}
      </div>
    </div>
  )
}
