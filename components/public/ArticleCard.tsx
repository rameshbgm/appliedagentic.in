'use client'
// components/public/ArticleCard.tsx
import Link from 'next/link'
import { Clock, Eye, ArrowRight } from 'lucide-react'

// Warm-to-cool gradient pairs that cycle per card index
const CARD_GRADIENTS = [
  ['#f59e0b', '#ef4444'],
  ['#ef4444', '#ec4899'],
  ['#ec4899', '#8b5cf6'],
  ['#8b5cf6', '#3b82f6'],
  ['#3b82f6', '#10b981'],
  ['#10b981', '#f59e0b'],
]

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
  index?: number
}

export default function ArticleCard({
  title, slug, summary, coverImageUrl, readingTime, viewCount = 0,
  createdAt, tags = [], moduleName, index = 1,
}: Props) {
  const [gA, gB] = CARD_GRADIENTS[(index - 1) % CARD_GRADIENTS.length]
  const numLabel = String(index).padStart(2, '0')

  return (
    <Link href={`/articles/${slug}`} className="block group h-full">
      <article
        className="relative h-full flex flex-col overflow-hidden rounded-2xl transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-xl"
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--bg-border)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        {/* Faded index watermark — top right */}
        <span
          aria-hidden
          className="absolute top-2 right-3 font-black leading-none select-none pointer-events-none"
          style={{
            fontSize: '4.5rem',
            background: `linear-gradient(135deg, ${gA}20, ${gB}10)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {numLabel}
        </span>

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

        {/* Left gradient accent bar + content row */}
        <div className="flex flex-1 min-h-0">
          {/* Vertical gradient sidebar */}
          <div
            className="w-[3px] shrink-0 my-3 ml-3 rounded-full"
            style={{ background: `linear-gradient(180deg, ${gA}, ${gB})` }}
          />

          <div className="p-5 flex flex-col flex-1 gap-3">
            {/* Module badge */}
            {moduleName && (
              <span
                className="self-start text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full"
                style={{
                  background: `linear-gradient(135deg, ${gA}18, ${gB}18)`,
                  color: gA,
                  border: `1px solid ${gA}30`,
                }}
              >
                {moduleName}
              </span>
            )}

            {/* Title — gradient on hover */}
            <h3
              className="font-bold text-[15px] leading-snug line-clamp-2"
              style={{ color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif" }}
            >
              {title}
            </h3>

            {/* Summary */}
            {summary && (
              <p className="text-[13px] line-clamp-2 flex-1" style={{ color: 'var(--text-muted)' }}>
                {summary}
              </p>
            )}

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag.name}
                    className="text-[10px] px-2 py-0.5 rounded-full"
                    style={{
                      background: 'var(--bg-elevated)',
                      color: 'var(--text-muted)',
                      border: '1px solid var(--bg-border)',
                    }}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}

            {/* Meta row */}
            <div
              className="flex items-center gap-3 text-[11px] pt-2.5 mt-auto"
              style={{ borderTop: `1px solid ${gA}18`, color: 'var(--text-muted)' }}
            >
              {readingTime && (
                <span className="flex items-center gap-1"><Clock size={10} />{readingTime} min</span>
              )}
              <span className="flex items-center gap-1"><Eye size={10} />{viewCount.toLocaleString()}</span>
              <span className="ml-auto text-[11px]">
                {new Date(createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <span
                className="flex items-center justify-center w-6 h-6 rounded-full transition-all group-hover:scale-110"
                style={{
                  background: `linear-gradient(135deg, ${gA}20, ${gB}20)`,
                  color: gA,
                  border: `1px solid ${gA}30`,
                }}
              >
                <ArrowRight size={11} />
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}
