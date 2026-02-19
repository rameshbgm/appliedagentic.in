'use client'
// components/public/RelatedArticles.tsx
import Link from 'next/link'
import Image from 'next/image'
import { Clock, Eye } from 'lucide-react'
import { formatDate } from '@/lib/utils'

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
  if (!articles.length) return null

  return (
    <section className="mt-12">
      <h2 className="text-lg font-bold mb-5" style={{ color: 'var(--text-primary)' }}>
        {title}
      </h2>

      {/* Horizontal scroll on mobile, wrap on desktop */}
      <div className="flex gap-4 overflow-x-auto pb-3 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:overflow-visible sm:pb-0 snap-x snap-mandatory">
        {articles.map((a) => {
          const color = a.module?.color ?? '#6C3DFF'
          return (
            <Link
              key={a.id}
              href={`/articles/${a.slug}`}
              className="group flex-shrink-0 w-72 sm:w-auto rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg snap-start"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--bg-border)',
              }}
            >
              {a.coverImage ? (
                <div className="relative h-36 overflow-hidden">
                  <Image
                    src={a.coverImage}
                    alt={a.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              ) : (
                <div
                  className="h-36 flex items-center justify-center text-3xl"
                  style={{ background: color + '15' }}
                >
                  📄
                </div>
              )}

              <div className="p-4">
                {a.module && (
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full inline-block mb-2"
                    style={{ background: color + '20', color }}
                  >
                    {a.module.name}
                  </span>
                )}
                <h3
                  className="font-semibold text-sm leading-snug line-clamp-2 mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {a.title}
                </h3>
                <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                  {a.readingTime && (
                    <span className="flex items-center gap-1">
                      <Clock size={11} /> {a.readingTime} min
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Eye size={11} /> {a.viewCount}
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
