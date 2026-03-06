// app/(admin)/dashboard/page.tsx
export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { Plus, FileText, Menu, ListTree, Image as ImageIcon } from 'lucide-react'
import StatsCard from '@/components/admin/StatsCard'
import DashboardCharts from './DashboardCharts'

export const metadata: Metadata = { title: 'Dashboard' }
export const revalidate = 60

async function getStats() {
  try {
    const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/analytics`, { cache: 'no-store' })
    if (!res.ok) return null
    const data = await res.json()
    return data.success ? data.data : null
  } catch {
    return null
  }
}

export default async function DashboardPage() {
  const raw = await getStats()
  const s = raw?.stats ?? {}
  const recentArticles = raw?.recentArticles ?? []

  const totalArticles = s.totalArticles ?? ((s.publishedArticles ?? 0) + (s.draftArticles ?? 0))
  const totalViews = s.totalViews ?? 0

  const cards = [
    { label: 'Total Articles', value: totalArticles,             iconName: 'FileText',   color: '#6C3DFF' },
    { label: 'Published',      value: s.publishedArticles ?? 0, iconName: 'TrendingUp', color: '#2ED573' },
    { label: 'Draft',          value: s.draftArticles    ?? 0,  iconName: 'FileText',   color: '#FFA502' },
    { label: 'Menus',          value: s.totalMenus       ?? 0,  iconName: 'Menu',        color: '#10B981' },
    { label: 'Sub-Menus',      value: s.totalSubMenus    ?? 0,  iconName: 'ListTree',    color: '#3B82F6' },
    { label: 'Total Views',    value: totalViews,               iconName: 'Eye',         color: '#FF6B6B', suffix: '' },
    { label: 'Media Assets',   value: s.totalMedia       ?? 0,  iconName: 'Image',       color: '#FF69B4' },
  ]

  const quickActions = [
    { href: '/admin/articles/new', label: 'New Article',  color: '#6C3DFF', icon: FileText },
    { href: '/admin/menus/new',    label: 'New Menu',     color: '#10B981', icon: Menu },
    { href: '/admin/submenus/new', label: 'New Sub-Menu', color: '#3B82F6', icon: ListTree },
    { href: '/admin/media',        label: 'Upload Media', color: '#FF69B4', icon: ImageIcon },
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>Dashboard</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Welcome back! Here&apos;s what&apos;s happening.</p>
        </div>
        <Link
          href="/admin/articles/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ background: '#6C3DFF' }}
        >
          <Plus size={16} /> New Article
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-4 gap-4">
        {cards.map((c) => (
          <StatsCard key={c.label} {...c} />
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="font-display font-semibold text-base mb-3" style={{ color: 'var(--text-primary)' }}>
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map(({ href, label, color, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all hover:scale-105"
              style={{ borderColor: color + '40', background: color + '12', color }}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* Charts */}
      <Suspense fallback={<div className="h-64 rounded-2xl skeleton" />}>
        <DashboardCharts recentArticles={recentArticles} topArticles={recentArticles} />
      </Suspense>

      {/* Recent articles table */}
      {recentArticles.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>
              Recent Articles
            </h2>
            <Link href="/admin/articles" className="text-xs font-medium" style={{ color: '#6C3DFF' }}>
              View all →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ color: 'var(--text-muted)' }}>
                  <th className="text-left pb-3 font-medium">Title</th>
                  <th className="text-left pb-3 font-medium">Status</th>
                  <th className="text-left pb-3 font-medium hidden md:table-cell">Views</th>
                  <th className="text-left pb-3 font-medium hidden md:table-cell">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentArticles.slice(0, 8).map((a: any) => (
                  <tr key={a.id} className="border-t" style={{ borderColor: 'var(--bg-border)' }}>
                    <td className="py-3 pr-4 font-medium truncate max-w-xs" style={{ color: 'var(--text-primary)' }}>
                      <a href={`/admin/articles/${a.id}/edit`} className="hover:text-violet-400 transition-colors">
                        {a.title}
                      </a>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`badge ${a.status === 'PUBLISHED' ? 'badge-success' : a.status === 'DRAFT' ? 'badge-warning' : 'badge-default'}`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="py-3 pr-4 hidden md:table-cell" style={{ color: 'var(--text-secondary)' }}>{a.viewCount?.toLocaleString() ?? 0}</td>
                    <td className="py-3 hidden md:table-cell" style={{ color: 'var(--text-muted)' }}>
                      {new Date(a.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
