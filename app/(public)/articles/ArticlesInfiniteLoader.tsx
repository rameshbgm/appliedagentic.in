'use client'
// app/(public)/articles/ArticlesInfiniteLoader.tsx
// Client component: renders the initial server-loaded articles, then loads
// more in batches of 50 when the user scrolls near the bottom.
import { useState, useEffect, useRef, useCallback } from 'react'
import ArticleCard from '@/components/public/ArticleCard'
import { Loader2, LayoutGrid, LayoutList, Clock, Eye, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useArticleLoading } from '@/components/shared/ArticleLoadingContext'

interface Article {
  id: number
  title: string
  slug: string
  summary?: string | null
  readingTimeMinutes?: number | null
  viewCount: number
  createdAt: string | Date
  articleTags: { tag: { name: string } }[]
  topicArticles: { topic: { module: { name: string; color: string | null } | null } | null }[]
}

interface Props {
  initialArticles: Article[]
  totalCount: number
  tag?: string
}

const LOAD_MORE_SIZE = 50

const CARD_GRADIENTS = [
  ['#f59e0b', '#ef4444'],
  ['#ef4444', '#ec4899'],
  ['#ec4899', '#8b5cf6'],
  ['#8b5cf6', '#3b82f6'],
  ['#3b82f6', '#10b981'],
  ['#10b981', '#f59e0b'],
]

export default function ArticlesInfiniteLoader({ initialArticles, totalCount, tag }: Props) {
  const { showLoading } = useArticleLoading()
  const [articles, setArticles] = useState<Article[]>(initialArticles)
  const [offset, setOffset]     = useState(initialArticles.length)
  const [loading, setLoading]   = useState(false)
  const [hasMore, setHasMore]   = useState(initialArticles.length < totalCount)
  const [view, setView]         = useState<'grid' | 'list'>('grid')
  const sentinelRef = useRef<HTMLDivElement>(null)

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return
    setLoading(true)
    try {
      const params = new URLSearchParams({
        offset: String(offset),
        limit:  String(LOAD_MORE_SIZE),
      })
      if (tag) params.set('tag', tag)
      const res  = await fetch(`/api/articles/public?${params}`)
      const data = await res.json()
      if (data.articles?.length) {
        setArticles((prev) => [...prev, ...data.articles])
        setOffset((prev)   => prev + data.articles.length)
        setHasMore(data.hasMore ?? false)
      } else {
        setHasMore(false)
      }
    } catch {
      // silently fail, user can scroll again
    } finally {
      setLoading(false)
    }
  }, [loading, hasMore, offset, tag])

  // Observe the sentinel element — fire loadMore when it enters the viewport
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore()
      },
      { rootMargin: '400px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [loadMore])

  return (
    <>
      {/* ── View toggle bar ── */}
      <div className="flex items-center justify-end mb-5">
        <div
          className="flex items-center gap-1 p-1 rounded-lg"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--bg-border)' }}
        >
          <button
            type="button"
            onClick={() => setView('grid')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all"
            style={
              view === 'grid'
                ? { background: 'var(--bg-surface)', color: 'var(--text-primary)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }
                : { color: 'var(--text-muted)' }
            }
          >
            <LayoutGrid size={14} />
            Grid
          </button>
          <button
            type="button"
            onClick={() => setView('list')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all"
            style={
              view === 'list'
                ? { background: 'var(--bg-surface)', color: 'var(--text-primary)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }
                : { color: 'var(--text-muted)' }
            }
          >
            <LayoutList size={14} />
            List
          </button>
        </div>
      </div>

      {/* ── Grid view ── */}
      {view === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((a, i) => (
            <ArticleCard
              key={a.id}
              index={i + 1}
              title={a.title}
              slug={a.slug}
              summary={a.summary}
              readingTime={a.readingTimeMinutes}
              viewCount={a.viewCount}
              createdAt={a.createdAt}
              tags={a.articleTags.map((at) => ({ name: at.tag.name }))}
              moduleName={a.topicArticles[0]?.topic?.module?.name}
              moduleColor={a.topicArticles[0]?.topic?.module?.color}
            />
          ))}
        </div>
      )}

      {/* ── List view ── */}
      {view === 'list' && (
        <div className="space-y-3">
          {articles.map((a, i) => {
            const [gA, gB] = CARD_GRADIENTS[i % CARD_GRADIENTS.length]
            return (
              <Link key={a.id} href={`/articles/${a.slug}`} className="group block" onClick={() => showLoading(`/articles/${a.slug}`)}>
                <div
                  className="flex items-start gap-0 overflow-hidden rounded-xl transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md"
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-border)' }}
                >
                  {/* Gradient accent bar */}
                  <div
                    className="w-[3px] shrink-0 self-stretch rounded-l-xl"
                    style={{ background: `linear-gradient(180deg, ${gA}, ${gB})` }}
                  />
                  <div className="flex flex-1 items-center gap-4 px-4 py-3 min-w-0">
                    {/* Index */}
                    <span
                      className="hidden sm:block shrink-0 font-black text-xl leading-none select-none"
                      style={{
                        background: `linear-gradient(135deg, ${gA}40, ${gB}30)`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        fontFamily: "'Inter', sans-serif",
                        minWidth: '2.2rem',
                        textAlign: 'right',
                      }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3
                        className="font-semibold text-[14px] leading-snug line-clamp-1 group-hover:text-(--green) transition-colors"
                        style={{ color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif" }}
                      >
                        {a.title}
                      </h3>
                      {a.summary && (
                        <p className="text-[12px] line-clamp-1 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                          {a.summary}
                        </p>
                      )}
                      {a.articleTags.length > 0 && (
                        <div className="hidden sm:flex flex-wrap gap-1 mt-1.5">
                          {a.articleTags.slice(0, 3).map((at) => (
                            <span
                              key={at.tag.name}
                              className="text-[10px] px-1.5 py-0.5 rounded-full"
                              style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--bg-border)' }}
                            >
                              {at.tag.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Meta */}
                    <div className="shrink-0 flex items-center gap-3 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                      {a.readingTimeMinutes && (
                        <span className="hidden sm:flex items-center gap-1"><Clock size={10} />{a.readingTimeMinutes} min</span>
                      )}
                      <span className="flex items-center gap-1"><Eye size={10} />{a.viewCount.toLocaleString()}</span>
                      <span className="hidden md:block">
                        {new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span
                        className="flex items-center justify-center w-6 h-6 rounded-full transition-all group-hover:scale-110 shrink-0"
                        style={{ background: `linear-gradient(135deg, ${gA}20, ${gB}20)`, color: gA, border: `1px solid ${gA}30` }}
                      >
                        <ArrowRight size={11} />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {/* Sentinel + loading indicator */}
      <div ref={sentinelRef} className="flex items-center justify-center py-10">
        {loading && (
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            <Loader2 size={16} className="animate-spin" />
            Loading more articles…
          </div>
        )}
        {!loading && !hasMore && articles.length > 0 && (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            All {articles.length} articles loaded
          </p>
        )}
      </div>
    </>
  )
}
