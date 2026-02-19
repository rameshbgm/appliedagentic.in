// components/public/ArticleCard.tsx
import Link from 'next/link'
import { Clock, Eye, Tag } from 'lucide-react'

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
  title, slug, summary, coverImageUrl, readingTime, viewCount = 0, createdAt, tags = [], moduleColor, moduleName,
}: Props) {
  const c = moduleColor ?? '#6C3DFF'

  return (
    <Link href={`/articles/${slug}`} className="block group">
      <article
        className="card overflow-hidden h-full flex flex-col transition-transform duration-200 group-hover:scale-[1.02] group-hover:shadow-2xl"
        style={{ borderLeft: `3px solid ${c}` }}
      >
        {/* Cover */}
        {coverImageUrl && (
          <div className="aspect-video overflow-hidden">
            <img
              src={coverImageUrl}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        )}

        <div className="p-5 flex flex-col flex-1">
          {/* Module badge */}
          {moduleName && (
            <span className="text-xs font-semibold mb-2 inline-block" style={{ color: c }}>
              {moduleName}
            </span>
          )}

          <h3 className="font-display font-bold text-lg leading-snug mb-2 line-clamp-2 group-hover:text-violet-400 transition-colors" style={{ color: 'var(--text-primary)' }}>
            {title}
          </h3>

          {summary && (
            <p className="text-sm line-clamp-2 flex-1 mb-4" style={{ color: 'var(--text-muted)' }}>
              {summary}
            </p>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {tags.slice(0, 3).map((tag) => (
                <span key={tag.name} className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--bg-border)', color: 'var(--text-muted)' }}>
                  {tag.name}
                </span>
              ))}
            </div>
          )}

          {/* Meta */}
          <div className="flex items-center gap-4 text-xs mt-auto" style={{ color: 'var(--text-muted)' }}>
            {readingTime && (
              <span className="flex items-center gap-1">
                <Clock size={11} />{readingTime} min
              </span>
            )}
            <span className="flex items-center gap-1">
              <Eye size={11} />{viewCount.toLocaleString()}
            </span>
            <span className="ml-auto">
              {new Date(createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}
