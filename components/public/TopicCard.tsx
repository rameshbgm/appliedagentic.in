// components/public/TopicCard.tsx
import Link from 'next/link'
import { BookOpen, FileText, ArrowRight } from 'lucide-react'

interface Props {
  topic: {
    id: string
    name: string
    slug: string
    description?: string | null
    module?: { name: string; color: string } | null
    _count?: { articles?: number }
    articleCount?: number
  }
}

export default function TopicCard({ topic }: Props) {
  const count = topic._count?.articles ?? topic.articleCount ?? 0
  const color = topic.module?.color ?? '#6C3DFF'

  return (
    <Link
      href={`/topics/${topic.slug}`}
      className="group block rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--bg-border)',
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {topic.module && (
            <span
              className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full mb-2"
              style={{ background: color + '20', color }}
            >
              <BookOpen size={10} />
              {topic.module.name}
            </span>
          )}
          <h3
            className="font-semibold text-base leading-snug mb-1.5 group-hover:text-transparent group-hover:bg-clip-text line-clamp-2 transition-all"
            style={{
              color: 'var(--text-primary)',
              backgroundImage: 'linear-gradient(135deg, #6C3DFF, #00D4FF)',
            }}
          >
            {topic.name}
          </h3>
          {topic.description && (
            <p className="text-sm line-clamp-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {topic.description}
            </p>
          )}
        </div>
        <ArrowRight
          size={16}
          className="flex-shrink-0 mt-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all"
          style={{ color }}
        />
      </div>

      <div className="flex items-center gap-1.5 mt-3 pt-3" style={{ borderTop: '1px solid var(--bg-border)' }}>
        <FileText size={13} style={{ color: 'var(--text-muted)' }} />
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {count} {count === 1 ? 'article' : 'articles'}
        </span>
      </div>
    </Link>
  )
}
