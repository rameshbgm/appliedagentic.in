// app/(admin)/dashboard/page.tsx
export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { Plus, FileText, Menu, ListTree, Image as ImageIcon } from 'lucide-react'
import StatsCard from '@/components/admin/StatsCard'
import DashboardCharts from './DashboardCharts'
import { prisma } from '@/lib/prisma'
import { ArticleStatus } from '@prisma/client'

export const metadata: Metadata = { title: 'Dashboard' }
export const revalidate = 60

async function getStats() {
  try {
    const [
      totalModules, totalTopics,
      publishedArticles, draftArticles, totalArticlesRaw,
      totalMedia, totalMenus, totalSubMenus,
      viewsAgg, recentArticles, aiLogs, topArticles,
    ] = await prisma.$transaction([
      prisma.module.count(),
      prisma.topic.count(),
      prisma.article.count({ where: { status: ArticleStatus.PUBLISHED } }),
      prisma.article.count({ where: { status: ArticleStatus.DRAFT } }),
      prisma.article.count(),
      prisma.mediaAsset.count(),
      prisma.navMenu.count(),
      prisma.navSubMenu.count(),
      prisma.article.aggregate({ _sum: { viewCount: true } }),
      prisma.article.findMany({
        orderBy: { updatedAt: 'desc' },
        take: 10,
        select: { id: true, title: true, slug: true, status: true, updatedAt: true, viewCount: true, createdAt: true },
      }),
      prisma.aIUsageLog.aggregate({ _count: true, _sum: { inputTokens: true, outputTokens: true } }),
      prisma.article.findMany({
        where: { status: ArticleStatus.PUBLISHED },
        orderBy: { viewCount: 'desc' },
        take: 5,
        select: { id: true, title: true, slug: true, viewCount: true },
      }),
    ])

    return {
      stats: {
        totalModules,
        totalTopics,
        totalArticles: totalArticlesRaw,
        publishedArticles,
        draftArticles,
        totalMedia,
        totalMenus,
        totalSubMenus,
        totalViews: viewsAgg._sum.viewCount ?? 0,
        aiRequests: aiLogs._count,
        aiTokens: (aiLogs._sum.inputTokens ?? 0) + (aiLogs._sum.outputTokens ?? 0),
      },
      recentArticles,
      topArticles,
    }
  } catch {
    return null
  }
}

export default async function DashboardPage() {
  const raw = await getStats()
  const s = raw?.stats ?? {} as Record<string, number>
  const recentArticles = raw?.recentArticles ?? []
  const topArticles = raw?.topArticles ?? []

  const cards = [
    { label: 'Total Articles',  value: s.totalArticles     ?? 0, iconName: 'FileText',   color: '#6C3DFF' },
    { label: 'Published',       value: s.publishedArticles ?? 0, iconName: 'TrendingUp', color: '#2ED573' },
    { label: 'Draft',           value: s.draftArticles     ?? 0, iconName: 'FileText',   color: '#FFA502' },
    { label: 'Total Views',     value: s.totalViews        ?? 0, iconName: 'Eye',         color: '#FF6B6B' },
    { label: 'Menus',           value: s.totalMenus        ?? 0, iconName: 'Menu',        color: '#10B981' },
    { label: 'Sub-Menus',       value: s.totalSubMenus     ?? 0, iconName: 'ListTree',    color: '#3B82F6' },
    { label: 'Media Assets',    value: s.totalMedia        ?? 0, iconName: 'Image',       color: '#FF69B4' },
    { label: 'Modules',         value: s.totalModules      ?? 0, iconName: 'Layers',      color: '#00D4FF' },
    { label: 'Topics',          value: s.totalTopics       ?? 0, iconName: 'BookOpen',    color: '#FFA502' },
    { label: 'AI Requests',     value: s.aiRequests        ?? 0, iconName: 'Cpu',         color: '#A29BFE' },
    { label: 'AI Tokens Used',  value: s.aiTokens          ?? 0, iconName: 'Cpu',         color: '#55EFC4' },
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
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-4">
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
        <DashboardCharts topArticles={topArticles} />
      </Suspense>

      {/* Top Articles by Views */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>
            Top Articles by Views
          </h2>
          <Link href="/admin/articles" className="text-xs font-medium" style={{ color: '#6C3DFF' }}>
            View all →
          </Link>
        </div>
        <div className="space-y-3">
          {topArticles.length > 0 ? topArticles.map((a: any, i: number) => (
            <div key={a.id} className="flex items-center gap-4">
              <span
                className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                style={{ background: 'rgba(108,61,255,0.2)', color: '#A29BFE' }}
              >
                {i + 1}
              </span>
              <a
                href={`/articles/${a.slug}`}
                target="_blank"
                className="flex-1 text-sm truncate hover:text-violet-400 transition-colors"
                style={{ color: 'var(--text-primary)' }}
              >
                {a.title}
              </a>
              <span className="text-sm font-medium shrink-0" style={{ color: 'var(--text-muted)' }}>
                {(a.viewCount ?? 0).toLocaleString()} views
              </span>
            </div>
          )) : (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No published articles yet.</p>
          )}
        </div>
      </div>

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
