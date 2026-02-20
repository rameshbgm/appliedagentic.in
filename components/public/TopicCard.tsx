'use client'
// components/public/TopicCard.tsx
import Link from 'next/link'
import { BookOpen, FileText, ArrowRight } from 'lucide-react'

interface Props {
  topic: {
    id: number | string
    name: string
    slug: string
    description?: string | null
    module?: { name: string; color: string | null } | null
    _count?: { articles?: number }
    articleCount?: number
  }
}

export default function TopicCard({ topic }: Props) {
  const count = topic._count?.articles ?? topic.articleCount ?? 0
  const color = topic.module?.color ?? '#AAFF00'

  return (
    <Link href={`/topics/${topic.slug}`} className="group block h-full">
      <div
        className="h-full rounded-2xl p-4 transition-all duration-200 group-hover:-translate-y-0.5"
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--bg-border)',
          boxShadow: 'var(--shadow-card)',
        }}
        onMouseEnter={(e) => {
          ;(e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-card-hover)'
          ;(e.currentTarget as HTMLDivElement).style.borderColor = 'var(--bg-border-hover)'
        }}
        onMouseLeave={(e) => {
          ;(e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-card)'
          ;(e.currentTarget as HTMLDivElement).style.borderColor = 'var(--bg-border)'
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Module chip */}
            {topic.module && (
              <span
                className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full mb-2"
                style={{ background: color + '18', color }}
              >
                <BookOpen size={9} />
                {topic.module.name}
              </span>
            )}

            {/* Name */}
            <h3
              className="font-semibold text-[14px] leading-snug mb-1.5 line-clamp-2 transition-colors group-hover:text-[var(--green)]"
              style={{ color: 'var(--text-primary)' }}
            >
              {topic.name}
            </h3>

            {/* Description */}
            {topic.description && (
              <p className="text-[12px] line-clamp-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {topic.description}
              </p>
            )}
          </div>

          <ArrowRight
            size={14}
            className="shrink-0 mt-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200"
            style={{ color }}
          />
        </div>

        {/* Article count */}
        <div
          className="flex items-center gap-1.5 mt-3 pt-3"
          style={{ borderTop: '1px solid var(--bg-border)' }}
        >
          <FileText size={12} style={{ color: 'var(--text-muted)' }} />
          <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
            {count} {count === 1 ? 'article' : 'articles'}
          </span>
        </div>
      </div>
    </Link>
  )
}
