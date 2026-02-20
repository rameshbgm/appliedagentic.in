// app/(admin)/dashboard/page.tsx
export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { Suspense } from 'react'
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
  const stats = await getStats()

  const cards = [
    { label: 'Total Articles', value: stats?.totalArticles ?? 0, iconName: 'FileText', color: '#6C3DFF' },
    { label: 'Published', value: stats?.publishedArticles ?? 0, iconName: 'TrendingUp', color: '#2ED573' },
    { label: 'Menus', value: stats?.totalMenus ?? 0, iconName: 'Menu', color: '#AAFF00' },
    { label: 'Sub-Menus', value: stats?.totalSubMenus ?? 0, iconName: 'ListTree', color: '#88CC00' },
    { label: 'Modules', value: stats?.totalModules ?? 0, iconName: 'Layers', color: '#00D4FF' },
    { label: 'Topics', value: stats?.totalTopics ?? 0, iconName: 'BookOpen', color: '#FFA502' },
    { label: 'Total Views', value: stats?.totalViews ?? 0, iconName: 'Eye', color: '#FF6B6B', suffix: '' },
    { label: 'Media Assets', value: stats?.totalMedia ?? 0, iconName: 'Users', color: '#FF69B4' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>Dashboard</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Welcome back! Here's what's happening.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-4">
        {cards.map((c) => (
          <StatsCard key={c.label} {...c} />
        ))}
      </div>

      {/* Charts */}
      <Suspense fallback={<div className="h-64 rounded-2xl skeleton" />}>
        <DashboardCharts recentArticles={stats?.recentArticles ?? []} topArticles={stats?.topArticles ?? []} />
      </Suspense>

      {/* Recent articles table */}
      {stats?.recentArticles?.length > 0 && (
        <div className="card p-6">
          <h2 className="font-display font-semibold text-lg mb-4" style={{ color: 'var(--text-primary)' }}>
            Recent Articles
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ color: 'var(--text-muted)' }}>
                  <th className="text-left pb-3 font-medium">Title</th>
                  <th className="text-left pb-3 font-medium">Status</th>
                  <th className="text-left pb-3 font-medium">Views</th>
                  <th className="text-left pb-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentArticles.slice(0, 8).map((a: any) => (
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
                    <td className="py-3 pr-4" style={{ color: 'var(--text-secondary)' }}>{a.viewCount?.toLocaleString() ?? 0}</td>
                    <td className="py-3" style={{ color: 'var(--text-muted)' }}>
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
