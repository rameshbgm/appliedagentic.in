'use client'
// app/(public)/[menuSlug]/SubMenusView.tsx
// Grid / List toggle for the sub-menus (Topics) section

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, FileText, LayoutGrid, LayoutList } from 'lucide-react'
import { useArticleLoading } from '@/components/shared/ArticleLoadingContext'

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
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
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
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {subMenus.map((sm) => (
            <Link
              key={sm.id}
              href={`/${menuSlug}/${sm.slug}`}
              onClick={() => showLoading(`/${menuSlug}/${sm.slug}`)}
              className="group card p-6 flex flex-col transition-all hover:-translate-y-1"
            >
              <h3
                className="font-display font-semibold text-lg mb-2 group-hover:text-(--green) transition-colors"
                style={{ color: 'var(--text-primary)' }}
              >
                {sm.title}
              </h3>
              {sm.description && (
                <p
                  className="text-sm leading-relaxed mb-4"
                  style={{
                    color: 'var(--text-secondary)',
                    maxHeight: '5.5rem',
                    overflowY: 'auto',
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'var(--bg-border) transparent',
                  }}
                >
                  {sm.description}
                </p>
              )}
              <div
                className="flex items-center justify-between mt-auto pt-4"
                style={{ borderTop: '1px solid var(--bg-border)' }}
              >
                <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                  <FileText size={12} />
                  {sm._count.articles} article{sm._count.articles !== 1 ? 's' : ''}
                </span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" style={{ color: 'var(--green)' }} />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* List view */}
      {view === 'list' && (
        <div className="space-y-3">
          {subMenus.map((sm) => (
            <Link
              key={sm.id}
              href={`/${menuSlug}/${sm.slug}`}
              onClick={() => showLoading(`/${menuSlug}/${sm.slug}`)}
              className="group card px-5 py-4 flex items-center gap-4 transition-all hover:-translate-y-0.5"
            >
              <div className="flex-1 min-w-0">
                <h3
                  className="font-display font-semibold text-base group-hover:text-(--green) transition-colors"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {sm.title}
                </h3>
                {sm.description && (
                  <p className="text-sm line-clamp-1 mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                    {sm.description}
                  </p>
                )}
              </div>
              <span className="shrink-0 flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                <FileText size={12} />
                {sm._count.articles} article{sm._count.articles !== 1 ? 's' : ''}
              </span>
              <ArrowRight size={14} className="shrink-0 group-hover:translate-x-1 transition-transform" style={{ color: 'var(--green)' }} />
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
