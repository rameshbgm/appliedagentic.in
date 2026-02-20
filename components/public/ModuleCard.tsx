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
  const c = color ?? '#AAFF00'

  return (
    <Link href={`/modules/${slug}`} className="block group h-full">
      <div
        className="relative h-full rounded-2xl p-5 overflow-hidden transition-all duration-200 group-hover:-translate-y-1"
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
        {/* Module number */}
        <div
          className="absolute top-4 right-4 text-[10px] font-bold opacity-20 group-hover:opacity-40 transition-opacity"
          style={{ color: c }}
        >
          {String(index + 1).padStart(2, '0')}
        </div>

        {/* Icon */}
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-4 relative z-10"
          style={{ background: `${c}20` }}
        >
          {icon ?? '📚'}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-[15px] mb-1.5 leading-snug relative z-10" style={{ color: 'var(--text-primary)' }}>
          {name}
        </h3>

        {/* Description */}
        {description && (
          <p className="text-[13px] line-clamp-2 mb-4 relative z-10" style={{ color: 'var(--text-muted)' }}>
            {description}
          </p>
        )}

        {/* Footer meta */}
        <div className="flex items-center justify-between relative z-10 mt-auto pt-3" style={{ borderTop: `1px solid ${c}18` }}>
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-md" style={{ background: `${c}18`, color: c }}>
              {topicCount} {topicCount === 1 ? 'topic' : 'topics'}
            </span>
            <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{articleCount} articles</span>
          </div>
          <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-1" style={{ color: c }} />
        </div>
      </div>
    </Link>
  )
}
