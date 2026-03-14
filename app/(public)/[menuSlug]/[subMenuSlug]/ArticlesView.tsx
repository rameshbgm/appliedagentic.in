'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Calendar, Clock, Eye, ArrowRight, LayoutGrid, LayoutList } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useArticleLoading } from '@/components/shared/ArticleLoadingContext'

interface Tag { id: number; name: string }
interface Article {
  id: number
  slug: string
  title: string
  summary: string | null
  publishedAt: Date | null
  readingTimeMinutes: number | null
  viewCount: number
  coverImage: { url: string } | null
  articleTags: { tag: Tag }[]
}

export default function ArticlesView({ articles }: { articles: Article[] }) {
  const { showLoading } = useArticleLoading()
  const [view, setView] = useState<'list' | 'grid'>('grid')

  if (articles.length === 0) {
    return (
      <div className="text-center py-20" style={{ color: 'var(--text-muted)' }}>
        <p className="text-lg mb-2" style={{ color: 'var(--text-secondary)' }}>No articles yet</p>
        <p className="text-sm">Articles will appear here once published.</p>
      </div>
    )
  }

  return (
    <div>
      {/* Toggle bar */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {articles.length} article{articles.length !== 1 ? 's' : ''}
        </p>
        <div
          className="flex items-center gap-1 p-1 rounded-lg"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--bg-border)' }}
        >
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
        </div>
      </div>

      {/* List view */}
      {view === 'list' && (
        <div className="space-y-5">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/articles/${article.slug}`}
              className="group card p-5 flex flex-col sm:flex-row gap-4 transition-all hover:-translate-y-0.5"
              onClick={showLoading}
            >
              {article.coverImage && (
                <div className="w-full sm:w-44 h-32 sm:h-28 rounded-xl overflow-hidden shrink-0">
                  <img
                    src={article.coverImage.url}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h2
                  className="font-display font-semibold text-lg mb-1.5 group-hover:text-(--green) transition-colors line-clamp-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {article.title}
                </h2>
                {article.summary && (
                  <p className="text-sm leading-relaxed mb-2.5 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                    {article.summary}
                  </p>
                )}
                {article.articleTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2.5">
                    {article.articleTags.slice(0, 4).map(({ tag }) => (
                      <span
                        key={tag.id}
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{ border: '1px solid var(--bg-border)', color: 'var(--text-muted)' }}
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                    {article.publishedAt && (
                      <span className="flex items-center gap-1">
                        <Calendar size={11} />
                        {formatDate(article.publishedAt.toString())}
                      </span>
                    )}
                    {article.readingTimeMinutes && (
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        {article.readingTimeMinutes} min
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Eye size={11} />
                      {article.viewCount.toLocaleString()}
                    </span>
                  </div>
                  <span
                    className="inline-flex items-center gap-1 text-xs font-medium group-hover:gap-2 transition-all"
                    style={{ color: 'var(--green)' }}
                  >
                    Read more <ArrowRight size={12} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Grid view */}
      {view === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/articles/${article.slug}`}
              className="group card flex flex-col overflow-hidden transition-all hover:-translate-y-1"
              onClick={showLoading}
            >
              {/* Cover */}
              <div
                className="w-full overflow-hidden"
                style={{ height: article.coverImage ? '180px' : '0' }}
              >
                {article.coverImage && (
                  <img
                    src={article.coverImage.url}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
              </div>
              {/* No cover — colored top bar */}
              {!article.coverImage && (
                <div className="h-1.5 w-full" style={{ background: 'var(--green)' }} />
              )}

              <div className="flex flex-col flex-1 p-4">
                {article.articleTags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {article.articleTags.slice(0, 2).map(({ tag }) => (
                      <span
                        key={tag.id}
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{ border: '1px solid var(--bg-border)', color: 'var(--text-muted)' }}
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}
                <h2
                  className="font-display font-semibold text-base mb-2 group-hover:text-(--green) transition-colors line-clamp-2 leading-snug"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {article.title}
                </h2>
                {article.summary && (
                  <p className="text-sm leading-relaxed line-clamp-2 mb-3 flex-1" style={{ color: 'var(--text-secondary)' }}>
                    {article.summary}
                  </p>
                )}
                <div className="flex items-center justify-between mt-auto pt-3" style={{ borderTop: '1px solid var(--bg-border)' }}>
                  <div className="flex items-center gap-2.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                    {article.readingTimeMinutes && (
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        {article.readingTimeMinutes} min
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Eye size={11} />
                      {article.viewCount.toLocaleString()}
                    </span>
                  </div>
                  <span
                    className="inline-flex items-center gap-1 text-xs font-medium group-hover:gap-2 transition-all"
                    style={{ color: 'var(--green)' }}
                  >
                    Read <ArrowRight size={11} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
