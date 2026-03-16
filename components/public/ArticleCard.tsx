'use client'
// components/public/ArticleCard.tsx
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Clock, Eye, ArrowRight } from 'lucide-react'
import LazyImage from '@/components/shared/LazyImage'
import { useArticleLoading } from '@/components/shared/ArticleLoadingContext'

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
  /** Optional submenu navigation chip — only shown when provided (All Articles page only). */
  navChip?: { href: string; subMenuTitle: string; menuTitle: string } | null
}

export default function ArticleCard({
  title, slug, summary, coverImageUrl, readingTime, viewCount = 0,
  createdAt, tags = [], moduleName, index = 1, navChip,
}: Props) {
  const { showLoading } = useArticleLoading()
  const router = useRouter()
  const [gA, gB] = CARD_GRADIENTS[(index - 1) % CARD_GRADIENTS.length]

  return (
    <Link href={`/articles/${slug}`} className="block group h-full" onClick={() => showLoading(`/articles/${slug}`)}>
      <article
        className="relative h-full flex flex-col overflow-hidden rounded-xl transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-lg"
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--bg-border)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        {/* Cover image — capped at 72px */}
        {coverImageUrl && (
          <div className="card-cover">
            <LazyImage
              src={coverImageUrl}
              alt={title}
              aspectClass="aspect-[4/1]"
              className="object-cover w-full transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        )}

        {/* Left gradient accent bar + content */}
        <div className="flex flex-1 min-h-0">
          <div
            className="w-[3px] shrink-0 my-2 ml-2 rounded-full"
            style={{ background: `linear-gradient(180deg, ${gA}, ${gB})` }}
          />

          <div className="px-2.5 py-2 flex flex-col flex-1 gap-1">
            {/* Module badge */}
            {moduleName && (
              <span
                className="self-start text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full"
                style={{
                  background: `linear-gradient(135deg, ${gA}18, ${gB}18)`,
                  color: gA,
                  border: `1px solid ${gA}30`,
                }}
              >
                {moduleName}
              </span>
            )}

            {/* Submenu navigation chip */}
            {navChip && (() => {
              const sub = navChip.subMenuTitle
              const menu = navChip.menuTitle
              const fullLabel = `${sub} (${menu})`
              const dispSub  = sub.length  > 10 ? sub.slice(0, 10)  + '\u2026' : sub
              const dispMenu = menu.length > 8  ? menu.slice(0, 8)  + '\u2026' : menu
              return (
                <span
                  role="link"
                  tabIndex={0}
                  title={fullLabel}
                  className="self-start inline-flex items-center gap-0.5 text-[9px] font-medium rounded-full px-1.5 py-0.5 transition-opacity hover:opacity-80 cursor-pointer"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--bg-border)' }}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); showLoading(navChip.href); router.push(navChip.href) }}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); showLoading(navChip.href); router.push(navChip.href) } }}
                >
                  <span style={{ color: 'var(--green)' }}>{dispSub}</span>
                  <span style={{ color: 'var(--text-muted)' }}> ({dispMenu})</span>
                </span>
              )
            })()}

            {/* Title */}
            <h3 className="card-title line-clamp-4" style={{ color: gA }}>
              {title}
            </h3>

            {/* Summary */}
            {summary && (
              <p className="card-summary line-clamp-2 flex-1">
                {summary}
              </p>
            )}

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {tags.slice(0, 3).map((tag) => (
                  <span key={tag.name} className="card-tag text-[9px] px-1.5 py-0.5 rounded-full">
                    {tag.name}
                  </span>
                ))}
              </div>
            )}

            {/* Meta row */}
            <div
              className="card-meta-row flex items-center gap-2 text-[10px] pt-1.5 mt-auto"
              style={{ borderTop: `1px solid ${gA}18` }}
            >
              {readingTime && (
                <span className="flex items-center gap-1"><Clock size={9} />{readingTime} min</span>
              )}
              <span className="flex items-center gap-1"><Eye size={9} />{viewCount.toLocaleString()}</span>
              <span className="ml-auto text-[10px]">
                {new Date(createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <span
                className="flex items-center justify-center w-4 h-4 rounded-full transition-all group-hover:scale-110 shrink-0"
                style={{ background: `linear-gradient(135deg, ${gA}20, ${gB}20)`, color: gA, border: `1px solid ${gA}30` }}
              >
                <ArrowRight size={9} />
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}
