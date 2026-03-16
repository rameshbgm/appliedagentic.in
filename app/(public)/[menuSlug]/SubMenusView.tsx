'use client'
// app/(public)/[menuSlug]/SubMenusView.tsx
// Grid / List toggle for the sub-menus (Topics) section

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, FileText, LayoutGrid, LayoutList } from 'lucide-react'
import { useArticleLoading } from '@/components/shared/ArticleLoadingContext'

const TOPIC_PALETTE = [
  { colorA: '#34d399', colorB: '#38bdf8', gradient: 'linear-gradient(135deg, #34d399, #38bdf8)', bg: 'rgba(52,211,153,0.07)', border: 'rgba(52,211,153,0.22)', accent: '#34d399' },
  { colorA: '#818cf8', colorB: '#ec4899', gradient: 'linear-gradient(135deg, #818cf8, #ec4899)', bg: 'rgba(129,140,248,0.07)', border: 'rgba(129,140,248,0.22)', accent: '#818cf8' },
  { colorA: '#f59e0b', colorB: '#ef4444', gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)', bg: 'rgba(245,158,11,0.07)', border: 'rgba(245,158,11,0.22)', accent: '#f59e0b' },
  { colorA: '#38bdf8', colorB: '#818cf8', gradient: 'linear-gradient(135deg, #38bdf8, #818cf8)', bg: 'rgba(56,189,248,0.07)', border: 'rgba(56,189,248,0.22)', accent: '#38bdf8' },
  { colorA: '#f472b6', colorB: '#fb923c', gradient: 'linear-gradient(135deg, #f472b6, #fb923c)', bg: 'rgba(244,114,182,0.07)', border: 'rgba(244,114,182,0.22)', accent: '#f472b6' },
  { colorA: '#4ade80', colorB: '#38bdf8', gradient: 'linear-gradient(135deg, #4ade80, #38bdf8)', bg: 'rgba(74,222,128,0.07)', border: 'rgba(74,222,128,0.22)', accent: '#4ade80' },
]

interface SubMenu {
  id: number
  slug: string
  title: string
  description: string | null
  _count: { articles: number }
}

interface Props {
  subMenus: SubMenu[]
  menuSlug: string
}

export default function SubMenusView({ subMenus, menuSlug }: Props) {
  const { showLoading } = useArticleLoading()
  const [view, setView] = useState<'grid' | 'list'>('grid')

  return (
    <section>
      {/* Header + toggle */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif" }}>
          Topics
        </h2>
        <div
          className="flex items-center gap-1 p-1 rounded-lg"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--bg-border)' }}
        >
          <button
            type="button"
            onClick={() => setView('grid')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all"
            style={
              view === 'grid'
                ? { background: 'var(--bg-surface)', color: 'var(--text-primary)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }
                : { color: 'var(--text-muted)' }
            }
          >
            <LayoutGrid size={14} />
            Grid
          </button>
          <button
            type="button"
            onClick={() => setView('list')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all"
            style={
              view === 'list'
                ? { background: 'var(--bg-surface)', color: 'var(--text-primary)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }
                : { color: 'var(--text-muted)' }
            }
          >
            <LayoutList size={14} />
            List
          </button>
        </div>
      </div>

      {/* Grid view */}
      {view === 'grid' && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {subMenus.map((sm, idx) => {
            const pal = TOPIC_PALETTE[idx % TOPIC_PALETTE.length]
            return (
              <Link
                key={sm.id}
                href={`/${menuSlug}/${sm.slug}`}
                onClick={() => showLoading(`/${menuSlug}/${sm.slug}`)}
                className="group relative flex flex-col rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
                style={{ background: 'var(--bg-surface)', border: `1px solid ${pal.border}` }}
              >
                {/* Colored top accent bar */}
                <div className="h-1 w-full" style={{ background: pal.gradient }} />
                <div className="flex flex-col flex-1 p-6">
                  {/* Article count badge */}
                  <span
                    className="self-start text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full mb-4"
                    style={{ background: pal.bg, color: pal.accent, border: `1px solid ${pal.border}` }}
                  >
                    {sm._count.articles} article{sm._count.articles !== 1 ? 's' : ''}
                  </span>

                  <h3
                    className="font-bold text-lg leading-snug mb-3 transition-all"
                    style={{ background: pal.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontFamily: "'Inter', sans-serif" }}
                  >
                    {sm.title}
                  </h3>

                  {sm.description && (
                    <p
                      className="text-sm leading-relaxed mb-5 line-clamp-3"
                      style={{ color: 'var(--text-secondary)', fontFamily: "'Lora', Georgia, serif", fontStyle: 'italic', lineHeight: 1.65 }}
                    >
                      {sm.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-auto pt-4" style={{ borderTop: `1px solid ${pal.border}` }}>
                    <span className="flex items-center gap-1.5 text-xs" style={{ color: pal.accent }}>
                      <FileText size={12} />
                      Explore
                    </span>
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 group-hover:scale-110 group-hover:rotate-[-8deg]"
                      style={{ background: pal.bg, border: `1px solid ${pal.border}`, color: pal.accent }}
                    >
                      <ArrowRight size={13} />
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {/* List view */}
      {view === 'list' && (
        <div className="space-y-3">
          {subMenus.map((sm, idx) => {
            const pal = TOPIC_PALETTE[idx % TOPIC_PALETTE.length]
            return (
              <Link
                key={sm.id}
                href={`/${menuSlug}/${sm.slug}`}
                onClick={() => showLoading(`/${menuSlug}/${sm.slug}`)}
                className="group flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                style={{ background: 'var(--bg-surface)', border: `1px solid ${pal.border}`, borderLeft: `3px solid ${pal.accent}` }}
              >
                <div className="flex-1 min-w-0">
                  <h3
                    className="font-bold text-base mb-0.5"
                    style={{ background: pal.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontFamily: "'Inter', sans-serif" }}
                  >
                    {sm.title}
                  </h3>
                  {sm.description && (
                    <p className="text-sm line-clamp-1" style={{ color: 'var(--text-secondary)' }}>
                      {sm.description}
                    </p>
                  )}
                </div>
                <span className="shrink-0 text-xs font-semibold px-2 py-1 rounded-full" style={{ background: pal.bg, color: pal.accent }}>
                  {sm._count.articles} article{sm._count.articles !== 1 ? 's' : ''}
                </span>
                <ArrowRight size={14} className="shrink-0 group-hover:translate-x-1 transition-transform" style={{ color: pal.accent }} />
              </Link>
            )
          })}
        </div>
      )}
    </section>
  )
}
