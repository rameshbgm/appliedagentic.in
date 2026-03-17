'use client'
// app/(public)/[menuSlug]/MenuContentLayout.tsx

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, ChevronRight, Clock, Eye, Calendar } from 'lucide-react'
import { useArticleLoading } from '@/components/shared/ArticleLoadingContext'

const FONT    = "'Inter', sans-serif"
const ACCENTS = ['#3b82f6', '#06b6d4', '#8b5cf6', '#f59e0b', '#10b981', '#ec4899']

interface ArticlePreview {
  id: number
  slug: string
  title: string
  summary: string | null
  readingTimeMinutes: number | null
  viewCount: number | null
  updatedAt: string | null
  coverImage: { url: string } | null
}

interface SubMenuWithArticles {
  id: number
  slug: string
  title: string
  description: string | null
  _count: { articles: number }
  articles: { article: ArticlePreview }[]
}

interface Props {
  subMenus: SubMenuWithArticles[]
  menuSlug: string
}

function ArticleMeta({ article }: { article: ArticlePreview }) {
  return (
    <span
      className="mt-1.5 flex items-center gap-x-2 text-[10.5px] whitespace-nowrap overflow-hidden"
      style={{ color: 'var(--text-muted)', fontFamily: FONT }}
    >
      {article.viewCount != null && (
        <span className="inline-flex items-center gap-0.5"><Eye size={10} /> {article.viewCount} views</span>
      )}
      {article.viewCount != null && article.updatedAt && <span style={{ opacity: 0.35 }}>·</span>}
      {article.updatedAt && (
        <span className="inline-flex items-center gap-0.5">
          <Calendar size={10} />
          {new Date(article.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      )}
      {(article.viewCount != null || article.updatedAt) && article.readingTimeMinutes != null && (
        <span style={{ opacity: 0.35 }}>·</span>
      )}
      {article.readingTimeMinutes != null && (
        <span className="inline-flex items-center gap-0.5"><Clock size={10} /> {article.readingTimeMinutes} min read</span>
      )}
    </span>
  )
}

function ArticleRow({
  article,
  href,
  isLast,
  showLoading,
}: {
  article: ArticlePreview
  href: string
  isLast: boolean
  showLoading: (path: string) => void
}) {
  return (
    <Link
      href={href}
      onClick={() => showLoading(href)}
      className="group flex items-stretch gap-0 py-3 px-2 rounded-lg transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
      style={!isLast ? { borderBottom: '1px solid var(--bg-border)' } : {}}
    >
      {/* Thumbnail */}
      <div
        className="shrink-0 relative rounded-lg overflow-hidden"
        style={{ width: 80, minHeight: 56, background: 'var(--bg-elevated)' }}
      >
        {article.coverImage?.url ? (
          <Image
            src={article.coverImage.url}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="80px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>No image</span>
          </div>
        )}
      </div>
      {/* Vertical separator */}
      <div className="shrink-0 mx-3" style={{ width: 1, background: 'var(--bg-border)' }} />
      {/* Text */}
      <div className="flex-1 min-w-0">
        <h3
          className="font-semibold text-[13.5px] leading-snug line-clamp-2 group-hover:text-blue-500 transition-colors"
          style={{ color: 'var(--text-primary)', fontFamily: FONT }}
        >
          {article.title}
        </h3>
        {article.summary && (
          <p
            className="text-[11.5px] leading-relaxed line-clamp-1 mt-0.5"
            style={{ color: 'var(--text-muted)', fontFamily: FONT }}
          >
            {article.summary}
          </p>
        )}
        <ArticleMeta article={article} />
      </div>
      <ArrowRight
        size={14}
        className="shrink-0 self-center ml-2 opacity-0 group-hover:opacity-50 transition-opacity"
        style={{ color: 'var(--text-muted)' }}
      />
    </Link>
  )
}

export default function MenuContentLayout({ subMenus, menuSlug }: Props) {
  const { showLoading } = useArticleLoading()
  const [selectedId, setSelectedId]       = useState<number>(subMenus[0]?.id ?? 0)  // desktop
  const [mobileOpenId, setMobileOpenId]   = useState<number>(-1)                     // mobile: all collapsed

  const selected  = subMenus.find((sm) => sm.id === selectedId) ?? subMenus[0]
  const articles  = selected?.articles.map((a) => a.article) ?? []

  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)', fontFamily: FONT }}>
          Topics
        </h2>
      </div>

      {/* ═══════════════════════════════════════════
          MOBILE layout  (hidden on md+)
      ═══════════════════════════════════════════ */}
      <div className="md:hidden space-y-4">

        {/* Sub-menu accordion list */}
        <div className="overflow-hidden" style={{ border: '1px solid var(--bg-border)' }}>
          {subMenus.map((sm, idx) => {
            const isActive   = sm.id === mobileOpenId
            const smArticles = sm.articles.map((a) => a.article)
            const isLast     = idx === subMenus.length - 1
            const accent     = ACCENTS[idx % ACCENTS.length]
            return (
              <div key={sm.id} style={!isLast ? { borderBottom: '1px solid var(--bg-border)', paddingBottom: 6 } : { paddingBottom: 4 }}>

                {/* Sub-menu header row */}
                <button
                  type="button"
                  onClick={() => setMobileOpenId(isActive ? -1 : sm.id)}
                  className="w-full flex items-center justify-between px-4 py-4 transition-colors"
                  style={{
                    background: isActive ? `${accent}12` : 'var(--bg-elevated)',
                    color: isActive ? accent : 'var(--text-primary)',
                    borderLeft: `4px solid ${isActive ? accent : 'transparent'}`,
                    fontFamily: FONT,
                    fontWeight: 600,
                    fontSize: '15px',
                    WebkitTapHighlightColor: 'transparent',
                    border: 'none',
                    borderLeft: `4px solid ${isActive ? accent : 'transparent'}`,
                    cursor: 'pointer',
                  } as React.CSSProperties}
                >
                  <span className="text-left leading-snug flex-1 pr-3">{sm.title}</span>
                  <span className="shrink-0 flex items-center gap-2">
                    <span className="text-[11px] font-normal px-1.5 py-0.5 rounded" style={{ background: `${accent}20`, color: accent }}>
                      {sm._count.articles}
                    </span>
                    <ChevronRight
                      size={16}
                      className="transition-transform duration-200"
                      style={{ transform: isActive ? 'rotate(90deg)' : 'rotate(0deg)', color: isActive ? accent : 'var(--text-muted)' }}
                    />
                  </span>
                </button>

                {/* Expanded: articles + view all */}
                {isActive && (
                  <div style={{ background: 'var(--bg-page)', borderTop: `1px solid ${accent}30` }}>
                    {smArticles.length > 0 ? (
                      <>
                        <div className="px-3 pt-1">
                          {smArticles.map((article, i) => (
                            <ArticleRow
                              key={article.id}
                              article={article}
                              href={`/articles/${article.slug}`}
                              isLast={i === smArticles.length - 1}
                              showLoading={showLoading}
                            />
                          ))}
                        </div>
                        <div className="px-4 py-3" style={{ borderTop: `1px solid ${accent}25` }}>
                          <Link
                            href={`/${menuSlug}/${sm.slug}`}
                            onClick={() => showLoading(`/${menuSlug}/${sm.slug}`)}
                            className="inline-flex items-center gap-1 text-[12px] font-semibold"
                            style={{ color: accent, fontFamily: FONT }}
                          >
                            View all <ArrowRight size={11} />
                          </Link>
                        </div>
                      </>
                    ) : (
                      <p className="px-4 py-4 text-sm" style={{ color: 'var(--text-muted)', fontFamily: FONT }}>
                        No articles yet
                      </p>
                    )}
                  </div>
                )}

              </div>
            )
          })}
        </div>

      </div>

      {/* ═══════════════════════════════════════════
          DESKTOP layout  (hidden below md)
      ═══════════════════════════════════════════ */}
      <div
        className="hidden md:flex rounded-2xl overflow-hidden"
        style={{ border: '1px solid var(--bg-border)', minHeight: 420 }}
      >
        {/* Left sidebar */}
        <div
          className="flex-none w-[280px] overflow-y-auto"
          style={{ borderRight: '1px solid var(--bg-border)', background: 'var(--bg-elevated)' }}
        >
          <div className="space-y-px py-2">
            {subMenus.map((sm) => {
              const isActive = sm.id === selectedId
              return (
                <button
                  key={sm.id}
                  type="button"
                  onClick={() => setSelectedId(sm.id)}
                  className="w-full flex items-center text-left transition-all duration-150"
                  style={{ color: isActive ? '#3b82f6' : 'var(--text-secondary)' }}
                >
                  <span
                    className="shrink-0 self-stretch transition-all duration-150"
                    style={{ width: 3, background: isActive ? '#3b82f6' : 'transparent', borderRadius: '0 2px 2px 0', minHeight: '100%' }}
                  />
                  <span className="flex-1 flex items-center justify-between gap-2 px-4 py-3">
                    <span className="text-[13.5px] leading-snug" style={{ fontFamily: FONT, fontWeight: isActive ? 600 : 500 }}>
                      {sm.title}
                    </span>
                    <ChevronRight
                      size={13}
                      className="shrink-0 transition-transform duration-150"
                      style={{ color: isActive ? '#3b82f6' : 'var(--text-muted)', opacity: isActive ? 1 : 0.4, transform: isActive ? 'translateX(2px)' : 'none' }}
                    />
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Right panel */}
        <div className="flex-1 min-w-0 p-5 overflow-y-auto">
          {/* Panel header */}
          <div
            className="flex items-center justify-between mb-4 pb-2.5"
            style={{ borderBottom: '1px solid var(--bg-border)' }}
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--text-muted)', fontFamily: FONT }}>
              {selected?.title}
            </p>
            {selected && (
              <Link
                href={`/${menuSlug}/${selected.slug}`}
                onClick={() => showLoading(`/${menuSlug}/${selected.slug}`)}
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] transition-opacity hover:opacity-70"
                style={{ color: '#3b82f6', fontFamily: FONT }}
              >
                View all <ArrowRight size={10} />
              </Link>
            )}
          </div>

          {articles.length > 0 ? (
            <div className="flex flex-col">
              {articles.map((article, i) => (
                <ArticleRow
                  key={article.id}
                  article={article}
                  href={`/articles/${article.slug}`}
                  isLast={i === articles.length - 1}
                  showLoading={showLoading}
                />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center" style={{ minHeight: 200, opacity: 0.4 }}>
              <p className="text-sm" style={{ color: 'var(--text-muted)', fontFamily: FONT }}>No articles in this topic yet</p>
            </div>
          )}
        </div>
      </div>

    </section>
  )
}
