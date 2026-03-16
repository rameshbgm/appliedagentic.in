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
  const color = topic.module?.color ?? '#1E293B'

  return (
    <Link href={`/topics/${topic.slug}`} className="group block h-full">
      <div
        className="h-full rounded-2xl p-3 transition-all duration-200 group-hover:-translate-y-0.5"
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
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {/* Module chip */}
            {topic.module && (
              <span
                className="inline-flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-full mb-1.5"
                style={{ background: color + '18', color }}
              >
                <BookOpen size={8} />
                {topic.module.name}
              </span>
            )}

            {/* Name */}
            <h3 className="card-title mb-1 line-clamp-3 transition-colors group-hover:text-(--green)">
              {topic.name}
            </h3>

            {/* Description */}
            {topic.description && (
              <p className="card-summary line-clamp-2">
                {topic.description}
              </p>
            )}
          </div>

          <ArrowRight
            size={12}
            className="shrink-0 mt-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200"
            style={{ color }}
          />
        </div>

        {/* Article count */}
        <div className="card-footer-row flex items-center gap-1.5 mt-2.5 pt-2.5">
          <FileText size={10} className="card-meta-icon" />
          <span className="card-meta-text text-[10px]">
            {count} {count === 1 ? 'article' : 'articles'}
          </span>
        </div>
      </div>
    </Link>
  )
}
