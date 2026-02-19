// app/(admin)/articles/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus, Pencil, Copy, Trash2, Eye } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import ArticleActions from './ArticleActions'

export const metadata: Metadata = { title: 'Articles' }
export const revalidate = 0

interface SearchParams { status?: string; search?: string; page?: string }

export default async function ArticlesPage({ searchParams }: { searchParams: SearchParams }) {
  const page = Number(searchParams.page ?? 1)
  const pageSize = 20
  const statusFilter = searchParams.status as any
  const search = searchParams.search

  const where = {
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(search ? {
      OR: [
        { title: { contains: search } },
        { summary: { contains: search } },
      ],
    } : {}),
  }

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { topicArticles: { include: { topic: { include: { module: { select: { name: true, color: true } } } } } } },
    }),
    prisma.article.count({ where }),
  ])

  const statusOptions = ['', 'DRAFT', 'PUBLISHED', 'SCHEDULED', 'ARCHIVED']
  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>Articles</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{total} articles total</p>
        </div>
        <Link
          href="/admin/articles/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white"
          style={{ background: 'linear-gradient(135deg, #6C3DFF, #00D4FF)' }}
        >
          <Plus size={16} />New Article
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {statusOptions.map((s) => (
          <Link
            key={s || 'all'}
            href={`/admin/articles${s ? `?status=${s}` : ''}`}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
              (s === '' && !statusFilter) || s === statusFilter ? 'text-white' : 'border'
            }`}
            style={{
              background: (s === '' && !statusFilter) || s === statusFilter ? 'linear-gradient(135deg,#6C3DFF,#00D4FF)' : 'transparent',
              borderColor: 'var(--bg-border)',
              color: (s === '' && !statusFilter) || s === statusFilter ? 'white' : 'var(--text-muted)',
            }}
          >
            {s || 'All'}
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--bg-border)', color: 'var(--text-muted)' }}>
              <th className="text-left px-4 py-3 font-medium">Title</th>
              <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Module/Topic</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Views</th>
              <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Updated</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {articles.map((a) => {
              const firstTopic = a.topicArticles[0]?.topic
              return (
                <tr key={a.id} className="group border-t" style={{ borderColor: 'var(--bg-border)' }}>
                  <td className="px-4 py-3">
                    <p className="font-medium truncate max-w-xs" style={{ color: 'var(--text-primary)' }}>{a.title}</p>
                    <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>/{a.slug}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {firstTopic && (
                      <span
                        className="inline-flex text-xs px-2 py-1 rounded-lg font-medium"
                        style={{ background: (firstTopic.module.color ?? '#6C3DFF') + '25', color: firstTopic.module.color ?? '#6C3DFF' }}
                      >
                        {firstTopic.module.name}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${
                      a.status === 'PUBLISHED' ? 'badge-success' :
                      a.status === 'DRAFT' ? 'badge-warning' :
                      a.status === 'SCHEDULED' ? 'badge-info' : 'badge-default'
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
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/articles/${a.slug}`} target="_blank" className="p-1.5 rounded-lg hover:bg-white/10">
                        <Eye size={14} style={{ color: 'var(--text-muted)' }} />
                      </Link>
                      <Link href={`/admin/articles/${a.id}/edit`} className="p-1.5 rounded-lg hover:bg-white/10">
                        <Pencil size={14} style={{ color: 'var(--text-muted)' }} />
                      </Link>
                      <ArticleActions id={a.id} title={a.title} />
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/articles?page=${p}${statusFilter ? `&status=${statusFilter}` : ''}`}
              className={`w-8 h-8 rounded-xl text-sm flex items-center justify-center transition-colors ${
                p === page ? 'text-white' : 'border hover:bg-white/5'
              }`}
              style={{
                background: p === page ? 'linear-gradient(135deg,#6C3DFF,#00D4FF)' : 'transparent',
                borderColor: 'var(--bg-border)',
                color: p === page ? 'white' : 'var(--text-muted)',
              }}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
