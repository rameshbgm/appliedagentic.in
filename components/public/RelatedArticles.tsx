'use client'
// components/public/RelatedArticles.tsx
import Link from 'next/link'
import LazyImage from '@/components/shared/LazyImage'
import { Clock, Eye } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useArticleLoading } from '@/components/shared/ArticleLoadingContext'

interface Article {
  id: string
  title: string
  slug: string
  summary?: string | null
  coverImage?: string | null
  readingTime?: number | null
  viewCount: number
  publishedAt?: Date | string | null
  module?: { name: string; color: string } | null
}

interface Props {
  articles: Article[]
  title?: string
}

export default function RelatedArticles({ articles, title = 'Related Articles' }: Props) {
  const { showLoading } = useArticleLoading()
  if (!articles.length) return null

  return (
    <section className="mt-12">
      <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
        {title}
      </h2>

      {/* Horizontal scroll on mobile, wrap on desktop */}
      <div className="flex gap-3 overflow-x-auto pb-3 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:overflow-visible sm:pb-0 snap-x snap-mandatory">
        {articles.map((a) => {
          const color = a.module?.color ?? '#1E293B'
          return (
            <Link
              key={a.id}
              href={`/articles/${a.slug}`}
              onClick={() => showLoading(`/articles/${a.slug}`)}
              className="group shrink-0 w-64 sm:w-auto rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg snap-start"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--bg-border)',
              }}
            >
              {/* Cover — thin banner */}
              {a.coverImage ? (
                <div className="card-cover">
                  <LazyImage
                    src={a.coverImage}
                    alt={a.title}
                    wrapperClassName="relative overflow-hidden w-full"
                    className="object-cover w-full group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              ) : (
                <div
                  className="h-10 flex items-center justify-center text-xl"
                  style={{ background: color + '15' }}
                >
                  📄
                </div>
              )}

              <div className="p-2.5">
                {a.module && (
                  <span
                    className="text-[9px] font-medium px-1.5 py-0.5 rounded-full inline-block mb-1.5"
                    style={{ background: color + '20', color }}
                  >
                    {a.module.name}
                  </span>
                )}
                <h3 className="card-title line-clamp-2 mb-1.5">
                  {a.title}
                </h3>
                {a.summary && (
                  <p className="card-summary line-clamp-1 mb-1.5">
                    {a.summary}
                  </p>
                )}
                <div className="card-meta-row flex items-center gap-2.5 text-[10px]">
                  {a.readingTime && (
                    <span className="flex items-center gap-1">
                      <Clock size={9} /> {a.readingTime} min
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Eye size={9} /> {a.viewCount}
                  </span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
