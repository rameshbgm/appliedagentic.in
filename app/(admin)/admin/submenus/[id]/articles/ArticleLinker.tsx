'use client'
// app/(admin)/admin/submenus/[id]/articles/ArticleLinker.tsx
// Links / unlinks articles to a sub-menu
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Plus, X, Search, GripVertical } from 'lucide-react'
import Link from 'next/link'

interface LinkedArticle {
  id: number
  subMenuId: number
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

interface Props {
  subMenuId: number
  subMenuTitle: string
  menuTitle: string
  initialArticles: LinkedArticle[]
}

export default function ArticleLinker({ subMenuId, subMenuTitle, menuTitle, initialArticles }: Props) {
  const router = useRouter()
  const [articles, setArticles] = useState<LinkedArticle[]>(initialArticles)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<{ id: number; title: string; slug: string; status: string }[]>([])
  const [searching, setSearching] = useState(false)

  const linkedIds = new Set(articles.map((a) => a.articleId))

  // Search for articles to link
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([])
      return
    }

    const timer = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(`/api/articles?search=${encodeURIComponent(searchQuery)}&limit=20`)
        const data = await res.json()
        if (data.success) {
          setSearchResults(
            (data.data?.items ?? data.data ?? []).filter(
              (a: { id: number }) => !linkedIds.has(a.id)
            )
          )
        }
      } catch {
        /* ignore */
      } finally {
        setSearching(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, articles]) // eslint-disable-line

  const linkArticle = async (articleId: number) => {
    try {
      const res = await fetch(`/api/submenus/${subMenuId}/articles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Article linked')
        router.refresh()
        // Refresh list
        const listRes = await fetch(`/api/submenus/${subMenuId}/articles`)
        const listData = await listRes.json()
        if (listData.success) setArticles(listData.data)
        setSearchQuery('')
        setSearchResults([])
      } else {
        toast.error(data.error ?? 'Failed to link')
      }
    } catch {
      toast.error('Network error')
    }
  }

  const unlinkArticle = async (articleId: number) => {
    try {
      const res = await fetch(`/api/submenus/${subMenuId}/articles?articleId=${articleId}`, {
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
    } catch {
      toast.error('Network error')
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <Link
          href="/admin/submenus"
          className="text-sm hover:underline mb-2 inline-block"
          style={{ color: 'var(--text-muted)' }}
        >
          ← Back to Sub-Menus
        </Link>
        <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>
          Articles in &ldquo;{subMenuTitle}&rdquo;
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Menu: {menuTitle} · {articles.length} article{articles.length !== 1 ? 's' : ''} linked
        </p>
      </div>

      {/* Add article search */}
      <div className="card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Search size={14} style={{ color: 'var(--text-muted)' }} />
          <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Add Article</span>
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input w-full"
          placeholder="Search articles by title..."
        />
        {searchResults.length > 0 && (
          <div className="mt-2 max-h-48 overflow-y-auto rounded-xl" style={{ border: '1px solid var(--bg-border)', background: 'var(--bg-surface)' }}>
            {searchResults.map((article) => (
              <button
                key={article.id}
                onClick={() => linkArticle(article.id)}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-left text-sm transition-colors"
                style={{ borderBottom: '1px solid var(--bg-border)', color: 'var(--text-primary)' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-elevated)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                <Plus size={14} style={{ color: 'var(--green)', flexShrink: 0 }} />
                <span className="flex-1 truncate" style={{ color: 'var(--text-primary)' }}>{article.title}</span>
                <span className={`badge ${article.status === 'PUBLISHED' ? 'badge-success' : 'badge-warning'}`}>
                  {article.status}
                </span>
              </button>
            ))}
          </div>
        )}
        {searching && (
          <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>Searching…</p>
        )}
      </div>

      {/* Linked articles list */}
      <div className="space-y-2">
        {articles.map((item, idx) => (
          <div
            key={item.id}
            className="card p-4 flex items-center gap-4 group"
          >
            <span className="text-xs font-mono w-6 text-center" style={{ color: 'var(--text-muted)' }}>
              {idx + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                {item.article.title}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                /{item.article.slug} · {item.article.status}
                {item.article.readingTimeMinutes ? ` · ${item.article.readingTimeMinutes} min` : ''}
              </p>
            </div>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Link
                href={`/admin/articles/${item.articleId}/edit`}
                className="px-2.5 py-1 rounded-lg text-xs font-medium hover:bg-gray-100 transition-colors"
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
          <div className="text-center py-12 card" style={{ color: 'var(--text-muted)' }}>
            <p className="text-sm">No articles linked yet. Use the search above to add articles.</p>
          </div>
        )}
      </div>
    </div>
  )
}
