'use client'
// app/(public)/articles/ArticlesInfiniteLoader.tsx
// Client component: renders the initial server-loaded articles, then loads
// more in batches of 50 when the user scrolls near the bottom.
import { useState, useEffect, useRef, useCallback } from 'react'
import ArticleCard from '@/components/public/ArticleCard'
import { Loader2 } from 'lucide-react'

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

export default function ArticlesInfiniteLoader({ initialArticles, totalCount, tag }: Props) {
  const [articles, setArticles] = useState<Article[]>(initialArticles)
  const [offset, setOffset]     = useState(initialArticles.length)
  const [loading, setLoading]   = useState(false)
  const [hasMore, setHasMore]   = useState(initialArticles.length < totalCount)
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((a) => (
          <ArticleCard
            key={a.id}
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
