'use client'
// components/public/ModuleCard.tsx
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface Props {
  id: number
  name: string
  slug: string
  icon?: string | null
  color?: string | null
  description?: string | null
  topicCount?: number
  articleCount?: number
  index?: number
}

export default function ModuleCard({
  name, slug, icon, color, description, topicCount = 0, articleCount = 0, index = 0,
}: Props) {
  const c = color ?? '#1E293B'

  return (
    <Link href={`/modules/${slug}`} className="block group h-full">
      <div
        className="relative h-full rounded-2xl p-3 overflow-hidden transition-all duration-200 group-hover:-translate-y-1"
        style={{
          background: 'var(--bg-surface)',
          border: `1px solid ${c}28`,
          boxShadow: 'var(--shadow-card)',
        }}
        onMouseEnter={(e) => {
          ;(e.currentTarget as HTMLDivElement).style.boxShadow =
            `var(--shadow-card-hover), 0 0 0 1px ${c}30`
        }}
        onMouseLeave={(e) => {
          ;(e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-card)'
        }}
      >
        {/* Module number — subtle top-right */}
        <div
          className="absolute top-3 right-3 text-[9px] font-bold opacity-20 group-hover:opacity-40 transition-opacity"
          style={{ color: c }}
        >
          {String(index + 1).padStart(2, '0')}
        </div>

        {/* Icon */}
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-base mb-2.5 relative z-10"
          style={{ background: `${c}20` }}
        >
          {icon ?? '📚'}
        </div>

        {/* Title */}
        <h3 className="card-title mb-1 relative z-10 line-clamp-3">
          {name}
        </h3>

        {/* Description */}
        {description && (
          <p className="card-summary line-clamp-2 mb-3 relative z-10">
            {description}
          </p>
        )}

        {/* Footer meta */}
        <div className="flex items-center justify-between relative z-10 mt-auto pt-2.5" style={{ borderTop: `1px solid ${c}18` }}>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md" style={{ background: `${c}18`, color: c }}>
              {topicCount} {topicCount === 1 ? 'topic' : 'topics'}
            </span>
            <span className="card-meta-text text-[10px]">{articleCount} articles</span>
          </div>
          <ArrowRight size={12} className="transition-transform duration-200 group-hover:translate-x-1" style={{ color: c }} />
        </div>
      </div>
    </Link>
  )
}
