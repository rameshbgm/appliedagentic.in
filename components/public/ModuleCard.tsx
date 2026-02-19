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

export default function ModuleCard({ name, slug, icon, color, description, topicCount = 0, articleCount = 0, index = 0 }: Props) {
  const c = color ?? '#6C3DFF'

  return (
    <Link href={`/modules/${slug}`} className="block group">
      <div
        className="relative rounded-3xl p-6 h-full transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-2xl overflow-hidden"
        style={{
          background: 'var(--bg-elevated)',
          border: `1px solid ${c}30`,
        }}
      >
        {/* Glow on hover */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"
          style={{ background: `radial-gradient(circle at center, ${c}10, transparent 70%)` }}
        />

        {/* Icon */}
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-4 transition-transform group-hover:scale-110 relative z-10"
          style={{ background: `${c}20` }}
        >
          {icon ?? '📚'}
        </div>

        {/* Content */}
        <h3
          className="font-display font-bold text-lg mb-2 relative z-10 group-hover:text-current transition-colors"
          style={{ color: 'var(--text-primary)' }}
        >
          {name}
        </h3>
        {description && (
          <p className="text-sm line-clamp-2 mb-4 relative z-10" style={{ color: 'var(--text-muted)' }}>
            {description}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <span className="text-xs px-2 py-1 rounded-lg font-medium" style={{ background: `${c}20`, color: c }}>
              {topicCount} topic{topicCount !== 1 ? 's' : ''}
            </span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {articleCount} articles
            </span>
          </div>
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" style={{ color: c }} />
        </div>

        {/* Module number badge */}
        <div
          className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold opacity-20 group-hover:opacity-40 transition-opacity"
          style={{ background: c, color: '#fff' }}
        >
          {String(index + 1).padStart(2, '0')}
        </div>
      </div>
    </Link>
  )
}
