'use client'
// components/public/ArticleCard.tsx
import Link from 'next/link'
import { Clock, Eye } from 'lucide-react'

interface Props {
  title: string
  slug: string
  summary?: string | null
  coverImageUrl?: string | null
  readingTime?: number | null
  viewCount?: number
  createdAt: string | Date
  tags?: { name: string }[]
  moduleColor?: string | null
  moduleName?: string | null
}

export default function ArticleCard({
  title, slug, summary, coverImageUrl, readingTime, viewCount = 0,
  createdAt, tags = [], moduleColor, moduleName,
}: Props) {
  const c = moduleColor ?? '#AAFF00'

  return (
    <Link href={`/articles/${slug}`} className="block group h-full">
      <article
        className="h-full flex flex-col overflow-hidden rounded-2xl transition-all duration-200 group-hover:-translate-y-1"
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--bg-border)',
          boxShadow: 'var(--shadow-card)',
        }}
        onMouseEnter={(e) => {
          ;(e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-card-hover)'
          ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--bg-border-hover)'
        }}
        onMouseLeave={(e) => {
          ;(e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-card)'
          ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--bg-border)'
        }}
      >
        {/* Cover image */}
        {coverImageUrl && (
          <div className="aspect-video overflow-hidden shrink-0">
            <img
              src={coverImageUrl}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        )}

        {/* Accent bar */}
        <div className="h-[2px] shrink-0" style={{ background: `linear-gradient(90deg, ${c}, transparent)` }} />

        <div className="p-5 flex flex-col flex-1">
          {/* Module label */}
          {moduleName && (
            <span className="text-[11px] font-semibold mb-2 uppercase tracking-wide" style={{ color: c }}>
              {moduleName}
            </span>
          )}

          {/* Title */}
          <h3 className="font-semibold text-[15px] leading-snug mb-2 line-clamp-2 group-hover:text-[var(--green)] transition-colors"
            style={{ color: 'var(--text-primary)', fontFamily: "'Inter',sans-serif" }}>
            {title}
          </h3>

          {/* Summary */}
          {summary && (
            <p className="text-[13px] line-clamp-2 flex-1 mb-4" style={{ color: 'var(--text-muted)' }}>
              {summary}
            </p>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {tags.slice(0, 3).map((tag) => (
                <span key={tag.name} className="text-[11px] px-2 py-0.5 rounded-full"
                  style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--bg-border)' }}>
                  {tag.name}
                </span>
              ))}
            </div>
          )}

          {/* Meta row */}
          <div className="flex items-center gap-4 text-[11px] mt-auto" style={{ color: 'var(--text-muted)' }}>
            {readingTime && (
              <span className="flex items-center gap-1"><Clock size={11} />{readingTime} min</span>
            )}
            <span className="flex items-center gap-1"><Eye size={11} />{viewCount.toLocaleString()}</span>
            <span className="ml-auto">
              {new Date(createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}
