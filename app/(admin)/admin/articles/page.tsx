// app/(admin)/articles/page.tsx
export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus, Pencil, Eye, ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight, Star } from 'lucide-react'
import type { ArticleStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import ArticleActions from './ArticleActions'
import ArticleFilters from './ArticleFilters'
import { Suspense } from 'react'

export const metadata: Metadata = { title: 'Articles' }
export const revalidate = 0

interface SearchParams {
  status?: string
  search?: string
  page?: string
  sortBy?: string
  sortDir?: string
  menuId?: string
  subMenuId?: string
}

// Build a URL preserving current params, overriding specific keys
function buildHref(base: string, current: SearchParams, overrides: Partial<SearchParams>): string {
  const merged = { ...current, ...overrides }
  const params = new URLSearchParams()
  if (merged.status)   params.set('status',    merged.status)
  if (merged.search)   params.set('search',    merged.search)
  if (merged.page && merged.page !== '1') params.set('page', merged.page)
  if (merged.sortBy)   params.set('sortBy',    merged.sortBy)
  if (merged.sortDir)  params.set('sortDir',   merged.sortDir)
  if (merged.menuId)   params.set('menuId',    merged.menuId)
  if (merged.subMenuId) params.set('subMenuId', merged.subMenuId)
  const qs = params.toString()
  return qs ? `${base}?${qs}` : base
}

// Compact pagination page list: max 7 items with ellipsis
function getPageList(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | '…')[] = []
  const WING = 2
  const showLeft  = current > WING + 2
  const showRight = current < total - WING - 1
  pages.push(1)
  if (showLeft)  pages.push('…')
  for (let p = Math.max(2, current - WING); p <= Math.min(total - 1, current + WING); p++) pages.push(p)
  if (showRight) pages.push('…')
  pages.push(total)
  return pages
}

export default async function ArticlesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  // Next.js 15/16: searchParams is a Promise — must await before reading
  const sp = await searchParams
  const page     = Math.max(1, Number(sp.page ?? 1))
  const pageSize = 20
  const statusFilter = sp.status as ArticleStatus | undefined
  const search   = sp.search
  const sortBy   = sp.sortBy  === 'title' ? 'title'     : 'updatedAt'
  const sortDir  = sp.sortDir === 'asc'   ? ('asc' as const)  : ('desc' as const)
  const menuId    = sp.menuId    ? parseInt(sp.menuId)    : undefined
  const subMenuId = sp.subMenuId ? parseInt(sp.subMenuId) : undefined

  const where: Record<string, unknown> = {
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(search ? {
      OR: [
        { title:   { contains: search } },
        { summary: { contains: search } },
      ],
    } : {}),
    // Filter by submenu (which implicitly is within a menu)
    ...(subMenuId
      ? { subMenuArticles: { some: { subMenuId } } }
      : menuId
      ? { subMenuArticles: { some: { subMenu: { menuId } } } }
      : {}),
  }

  const orderBy = sortBy === 'title'
    ? { title: sortDir }
    : { updatedAt: sortDir }

  const [articles, total, statusCounts] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        topicArticles: {
          include: { topic: { include: { module: { select: { name: true, color: true } } } } },
        },
        subMenuArticles: {
          include: { subMenu: { select: { title: true, menu: { select: { title: true } } } } },
        },
      },
    }),
    prisma.article.count({ where }),
    prisma.article.groupBy({ by: ['status'], _count: { id: true } }),
  ])

  const countMap: Record<string, number> = Object.fromEntries(statusCounts.map((r: any) => [r.status, r._count.id as number]))
  const totalAll = Object.values(countMap).reduce((s, n) => s + n, 0)

  const statusOptions = [
    { value: '',          label: 'All',       count: totalAll },
    { value: 'DRAFT',     label: 'Draft',     count: countMap['DRAFT']     ?? 0 },
    { value: 'PUBLISHED', label: 'Published', count: countMap['PUBLISHED'] ?? 0 },
    { value: 'ARCHIVED',  label: 'Archived',  count: countMap['ARCHIVED']  ?? 0 },
  ]

  const totalPages = Math.ceil(total / pageSize)

  // Sort column helpers
  function SortIcon({ col }: { col: string }) {
    if (sortBy !== col) return <ChevronsUpDown size={13} className="opacity-40" />
    return sortDir === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />
  }

  function sortHref(col: string) {
    const newDir = sortBy === col && sortDir === 'desc' ? 'asc' : 'desc'
    return buildHref('/admin/articles', sp, { sortBy: col, sortDir: newDir, page: '1' })
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>Articles</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{total} articles total</p>
        </div>
        <Link
          href="/admin/articles/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-transform hover:scale-105"
          style={{ background: '#6C3DFF' }}
        >
          <Plus size={16} />
          New Article
        </Link>
      </div>

      {/* Search + filter row */}
      <Suspense>
        <ArticleFilters />
      </Suspense>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2">
        {statusOptions.map((opt) => {
          const active = opt.value === '' ? !statusFilter : opt.value === statusFilter
          return (
            <Link
              key={opt.value || 'all'}
              href={buildHref('/admin/articles', sp, { status: opt.value || undefined, page: '1' })}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                active ? 'text-white' : 'border hover:bg-gray-50'
              }`}
              style={{
                background:  active ? '#1E293B' : 'transparent',
                borderColor: active ? 'transparent' : 'var(--bg-border)',
                color:       active ? '#fff' : 'var(--text-muted)',
              }}
            >
              {opt.label}
              <span
                className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-semibold"
                style={{
                  background: active ? 'rgba(255,255,255,0.20)' : 'var(--bg-elevated)',
                  color:      active ? '#fff' : 'var(--text-muted)',
                }}
              >
                {opt.count}
              </span>
            </Link>
          )
        })}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--bg-border)', color: 'var(--text-muted)' }}>
              {/* Sortable: Title */}
              <th className="text-left px-4 py-3 font-medium">
                <Link
                  href={sortHref('title')}
                  className="inline-flex items-center gap-1 hover:text-gray-700 transition-colors"
                >
                  Title
                  <SortIcon col="title" />
                </Link>
              </th>
              <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Navigation</th>
              <th className="text-left px-4 py-3 font-medium hidden xl:table-cell">Module / Topic</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Views</th>
              {/* Sortable: Updated */}
              <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">
                <Link
                  href={sortHref('updatedAt')}
                  className="inline-flex items-center gap-1 hover:text-gray-700 transition-colors"
                >
                  Updated
                  <SortIcon col="updatedAt" />
                </Link>
              </th>
              <th className="px-4 py-3 sticky right-0" style={{ background: 'var(--bg-card)' }} />
            </tr>
          </thead>
          <tbody>
            {articles.map((a: any) => {
              const firstTopic = a.topicArticles[0]?.topic
              return (
                <tr key={a.id} className="group border-t" style={{ borderColor: 'var(--bg-border)' }}>
                  <td className="px-4 py-3">
                    <div className="flex items-start gap-1.5">
                      {a.isFeatured && (
                        <Star size={12} fill="#f59e0b" style={{ color: '#f59e0b', marginTop: '3px', flexShrink: 0 }} />
                      )}
                      <div className="min-w-0">
                        <p className="font-medium truncate max-w-xs" style={{ color: 'var(--text-primary)' }}>{a.title}</p>
                        <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>/{a.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="flex flex-col gap-0.5">
                      {(a.subMenuArticles as any[]).slice(0, 3).map((sma: any) => (
                        <span
                          key={sma.subMenu.title}
                          className="text-[11px] truncate max-w-[180px]"
                          style={{ color: 'var(--text-muted)' }}
                          title={`${sma.subMenu.menu.title} › ${sma.subMenu.title}`}
                        >
                          <span style={{ color: 'var(--text-secondary)' }}>{sma.subMenu.menu.title}</span>
                          <span className="mx-0.5 opacity-40">&rsaquo;</span>
                          {sma.subMenu.title}
                        </span>
                      ))}
                      {(a.subMenuArticles as any[]).length > 3 && (
                        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>+{(a.subMenuArticles as any[]).length - 3} more</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden xl:table-cell">
                    <div className="flex flex-col gap-1">
                      {firstTopic && (
                        <>
                          <span
                            className="inline-flex text-xs px-2 py-1 rounded-lg font-medium w-fit"
                            style={{
                              background: (firstTopic.module.color ?? '#6C3DFF') + '25',
                              color: firstTopic.module.color ?? '#6C3DFF',
                            }}
                          >
                            {firstTopic.module.name}
                          </span>
                          <span className="text-[11px] truncate max-w-[160px]" style={{ color: 'var(--text-muted)' }}>
                            {firstTopic.name}
                          </span>
                        </>
                      )}
                      {(a.subMenuArticles as any[]).slice(0, 2).map((sma: any) => (
                        <span
                          key={sma.subMenu.title}
                          className="text-[11px] truncate max-w-[160px]"
                          style={{ color: 'var(--text-muted)' }}
                          title={`${sma.subMenu.menu.title} › ${sma.subMenu.title}`}
                        >
                          {sma.subMenu.title}
                        </span>
                      ))}
                      {!firstTopic && (a.subMenuArticles as any[]).length === 0 && (
                        <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${
                      a.status === 'PUBLISHED' ? 'badge-success' :
                      a.status === 'DRAFT'     ? 'badge-warning' : 'badge-default'
                    }`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell" style={{ color: 'var(--text-secondary)' }}>
                    {a.viewCount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-xs" style={{ color: 'var(--text-muted)' }}>
                    {new Date(a.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 sticky right-0" style={{ background: 'var(--bg-card)' }}>
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/articles/${a.slug}`} target="_blank" className="p-1.5 rounded-lg hover:bg-gray-100">
                        <Eye size={14} style={{ color: 'var(--text-muted)' }} />
                      </Link>
                      <Link href={`/admin/articles/${a.id}/edit`} className="p-1.5 rounded-lg hover:bg-gray-100">
                        <Pencil size={14} style={{ color: 'var(--text-muted)' }} />
                      </Link>
                      <ArticleActions id={a.id} title={a.title} status={a.status} />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {articles.length === 0 && (
          <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
            No articles found.{' '}
            <Link href="/admin/articles/new" className="text-violet-400 hover:underline">Write one.</Link>
          </div>
        )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5">
          {/* Prev */}
          {page > 1 ? (
            <Link
              href={buildHref('/admin/articles', sp, { page: String(page - 1) })}
              className="w-8 h-8 rounded-xl border flex items-center justify-center hover:bg-gray-50 transition-colors"
              style={{ borderColor: 'var(--bg-border)', color: 'var(--text-muted)' }}
            >
              <ChevronLeft size={14} />
            </Link>
          ) : (
            <span
              className="w-8 h-8 rounded-xl border flex items-center justify-center opacity-30 cursor-default"
              style={{ borderColor: 'var(--bg-border)', color: 'var(--text-muted)' }}
            >
              <ChevronLeft size={14} />
            </span>
          )}

          {/* Page numbers */}
          {getPageList(page, totalPages).map((p, i) =>
            p === '…' ? (
              <span
                key={`ellipsis-${i}`}
                className="w-8 h-8 flex items-center justify-center text-xs"
                style={{ color: 'var(--text-muted)' }}
              >
                …
              </span>
            ) : (
              <Link
                key={p}
                href={buildHref('/admin/articles', sp, { page: String(p) })}
                className="w-8 h-8 rounded-xl text-sm flex items-center justify-center font-medium transition-colors"
                style={{
                  background:   p === page ? '#1E293B' : 'transparent',
                  borderWidth:  p === page ? '0' : '1px',
                  borderStyle:  p === page ? 'none' : 'solid',
                  borderColor:  'var(--bg-border)',
                  color:        p === page ? '#000' : 'var(--text-muted)',
                }}
              >
                {p}
              </Link>
            )
          )}

          {/* Next */}
          {page < totalPages ? (
            <Link
              href={buildHref('/admin/articles', sp, { page: String(page + 1) })}
              className="w-8 h-8 rounded-xl border flex items-center justify-center hover:bg-gray-50 transition-colors"
              style={{ borderColor: 'var(--bg-border)', color: 'var(--text-muted)' }}
            >
              <ChevronRight size={14} />
            </Link>
          ) : (
            <span
              className="w-8 h-8 rounded-xl border flex items-center justify-center opacity-30 cursor-default"
              style={{ borderColor: 'var(--bg-border)', color: 'var(--text-muted)' }}
            >
              <ChevronRight size={14} />
            </span>
          )}
        </div>
      )}
    </div>
  )
}
