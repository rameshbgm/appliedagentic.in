'use client'
// components/public/ArticleCard.tsx
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Clock3, Eye, ArrowUpRight } from 'lucide-react'
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
  createdAt, tags = [], moduleName, index = 1, navChip, moduleColor,
}: Props) {
  const { showLoading } = useArticleLoading()
  const router = useRouter()
  const [fallbackA, fallbackB] = CARD_GRADIENTS[(index - 1) % CARD_GRADIENTS.length]
  const gA = moduleColor || fallbackA
  const gB = fallbackB

  return (
    <Link href={`/articles/${slug}`} className="block group h-full" onClick={() => showLoading(`/articles/${slug}`)}>
      <article
        className="featured-article-card relative h-full flex flex-col overflow-hidden"
        style={{
          ['--card-accent' as string]: gA,
          ['--card-accent-alt' as string]: gB,
        }}
      >
        <div className="featured-article-card__topGlow" aria-hidden="true" />

        {coverImageUrl && (
          <div className="featured-article-card__imageWrap">
            <LazyImage
              src={coverImageUrl}
              alt={title}
              aspectClass="aspect-[16/12] sm:aspect-[16/11] lg:aspect-[16/12]"
              className="object-cover w-full transition-transform duration-700 group-hover:scale-[1.05]"
            />
            <div className="featured-article-card__imageShade" aria-hidden="true" />
          </div>
        )}

        <div className="featured-article-card__content flex flex-1 min-h-0 flex-col">
          <div className="featured-article-card__headerRow">
            {moduleName && (
              <span
                className="featured-article-card__module"
                style={{ background: `linear-gradient(135deg, ${gA}18, ${gB}16)` }}
              >
                {moduleName}
              </span>
            )}

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
                  className="featured-article-card__navChip"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); showLoading(navChip.href); router.push(navChip.href) }}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); showLoading(navChip.href); router.push(navChip.href) } }}
                >
                  <span className="featured-article-card__navChipSub">{dispSub}</span>
                  <span className="featured-article-card__navChipMenu">({dispMenu})</span>
                </span>
              )
            })()}
          </div>

          <h3 className="featured-article-card__title line-clamp-3">{title}</h3>

          {summary && (
            <p className="featured-article-card__summary line-clamp-3 flex-1">{summary}</p>
          )}

          {tags.length > 0 && (
            <div className="featured-article-card__tags">
              {tags.slice(0, 3).map((tag) => (
                <span key={tag.name} className="featured-article-card__tag">
                  {tag.name}
                </span>
              ))}
            </div>
          )}

          <div className="featured-article-card__footer">
            <div className="featured-article-card__meta">
              {readingTime && (
                <span className="featured-article-card__metaItem"><Clock3 size={14} />{readingTime} min</span>
              )}
              <span className="featured-article-card__metaItem"><Eye size={14} />{viewCount.toLocaleString()}</span>
            </div>
            <div className="featured-article-card__date">
              {new Date(createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
            <span className="featured-article-card__cta" aria-hidden="true">
              <ArrowUpRight size={15} />
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}
