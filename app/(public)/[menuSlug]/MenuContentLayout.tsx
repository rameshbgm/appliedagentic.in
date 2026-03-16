'use client'
// app/(public)/[menuSlug]/MenuContentLayout.tsx
// Two-panel layout: left sidebar = submenu list, right = article cards with images.
// Mirrors the nav mega-menu design.

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, ChevronRight, Clock } from 'lucide-react'
import { useArticleLoading } from '@/components/shared/ArticleLoadingContext'

const FONT = "'Inter', sans-serif"

interface ArticlePreview {
  id: number
  slug: string
  title: string
  summary: string | null
  readingTimeMinutes: number | null
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

export default function MenuContentLayout({ subMenus, menuSlug }: Props) {
  const { showLoading } = useArticleLoading()
  const [selectedId, setSelectedId] = useState<number>(subMenus[0]?.id ?? 0)

  const selected = subMenus.find((sm) => sm.id === selectedId) ?? subMenus[0]
  const articles = selected?.articles.map((a) => a.article) ?? []

  return (
    <section>
      {/* Section header */}
      <div className="flex items-center justify-between mb-5">
        <h2
          className="text-2xl font-black tracking-tight"
          style={{ color: 'var(--text-primary)', fontFamily: FONT }}
        >
          Topics
        </h2>
      </div>

      {/* Two-panel container */}
      <div
        className="flex rounded-2xl overflow-hidden"
        style={{ border: '1px solid var(--bg-border)', minHeight: 420 }}
      >
        {/* ── Left sidebar: submenu list ── */}
        <div
          className="hidden md:block flex-none w-[220px] overflow-y-auto"
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
                  {/* Active indicator bar */}
                  <span
                    className="shrink-0 self-stretch transition-all duration-150"
                    style={{
                      width: 3,
                      background: isActive ? '#3b82f6' : 'transparent',
                      borderRadius: '0 2px 2px 0',
                      minHeight: '100%',
                    }}
                  />
                  <span className="flex-1 flex items-center justify-between gap-2 px-4 py-3">
                    <span
                      className="text-[13.5px] leading-snug truncate"
                      style={{ fontFamily: FONT, fontWeight: isActive ? 600 : 500 }}
                    >
                      {sm.title}
                    </span>
                    <ChevronRight
                      size={13}
                      className="shrink-0 transition-transform duration-150"
                      style={{
                        color: isActive ? '#3b82f6' : 'var(--text-muted)',
                        opacity: isActive ? 1 : 0.4,
                        transform: isActive ? 'translateX(2px)' : 'none',
                      }}
                    />
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Right panel: article cards ── */}
        <div className="flex-1 min-w-0 p-5 overflow-y-auto">
          {/* Panel header */}
          <div
            className="flex items-center justify-between mb-4 pb-2.5"
            style={{ borderBottom: '1px solid var(--bg-border)' }}
          >
            <p
              className="text-[10px] font-bold uppercase tracking-[0.14em]"
              style={{ color: 'var(--text-muted)', fontFamily: FONT }}
            >
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

          {/* Mobile: submenu tabs (scrollable row) */}
          <div
            className="md:hidden flex gap-2 mb-4 overflow-x-auto pb-1"
            style={{ scrollbarWidth: 'none' }}
          >
            {subMenus.map((sm) => {
              const isActive = sm.id === selectedId
              return (
                <button
                  key={sm.id}
                  type="button"
                  onClick={() => setSelectedId(sm.id)}
                  className="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                  style={
                    isActive
                      ? { background: '#3b82f6', color: '#fff', fontFamily: FONT }
                      : { background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--bg-border)', fontFamily: FONT }
                  }
                >
                  {sm.title}
                </button>
              )
            })}
          </div>

          {/* Article grid */}
          {articles.length > 0 ? (
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <Link
                  key={article.id}
                  href={`/articles/${article.slug}`}
                  onClick={() => showLoading(`/articles/${article.slug}`)}
                  className="group flex flex-col rounded-xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-border)' }}
                >
                  {/* Cover image */}
                  <div
                    className="relative w-full overflow-hidden"
                    style={{ height: 112, background: 'var(--bg-elevated)' }}
                  >
                    {article.coverImage?.url ? (
                      <Image
                        src={article.coverImage.url}
                        alt={article.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                          No image
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card body */}
                  <div className="p-3 flex flex-col flex-1">
                    <h3
                      className="font-semibold text-[13px] leading-snug line-clamp-2 mb-1.5 group-hover:text-blue-500 transition-colors"
                      style={{ color: 'var(--text-primary)', fontFamily: FONT }}
                    >
                      {article.title}
                    </h3>
                    {article.summary && (
                      <p
                        className="text-[11px] line-clamp-2 leading-relaxed"
                        style={{
                          color: 'var(--text-muted)',
                          fontFamily: "'Lora', Georgia, serif",
                          fontStyle: 'italic',
                        }}
                      >
                        {article.summary}
                      </p>
                    )}
                    {article.readingTimeMinutes != null && (
                      <span
                        className="mt-auto pt-2 flex items-center gap-1 text-[10px]"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        <Clock size={10} />
                        {article.readingTimeMinutes} min read
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div
              className="flex items-center justify-center"
              style={{ minHeight: 200, opacity: 0.4 }}
            >
              <p className="text-sm" style={{ color: 'var(--text-muted)', fontFamily: FONT }}>
                No articles in this topic yet
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
