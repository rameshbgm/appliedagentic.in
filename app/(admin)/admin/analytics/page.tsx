// app/(admin)/analytics/page.tsx
export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { FileText, Eye, Layers, BookOpen, Image as ImageIcon, Cpu } from 'lucide-react'
import StatsCard from '@/components/admin/StatsCard'
import { prisma } from '@/lib/prisma'

export const metadata: Metadata = { title: 'Analytics' }
export const revalidate = 300

export default async function AnalyticsPage() {
  const [
    totalArticles,
    publishedArticles,
    totalModules,
    totalTopics,
    totalViews,
    totalMedia,
    aiLogs,
    topArticles,
  ] = await Promise.all([
    prisma.article.count(),
    prisma.article.count({ where: { status: 'PUBLISHED' } }),
    prisma.module.count(),
    prisma.topic.count(),
    prisma.article.aggregate({ _sum: { viewCount: true } }),
    prisma.mediaAsset.count(),
    prisma.aIUsageLog.aggregate({ _count: true, _sum: { inputTokens: true, outputTokens: true } }),
    prisma.article.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { viewCount: 'desc' },
      take: 10,
      select: { id: true, title: true, slug: true, viewCount: true },
    }),
  ])

  const cards = [
    { label: 'Total Articles', value: totalArticles, icon: FileText, color: '#6C3DFF' },
    { label: 'Published', value: publishedArticles, icon: FileText, color: '#2ED573' },
    { label: 'Modules', value: totalModules, icon: Layers, color: '#00D4FF' },
    { label: 'Topics', value: totalTopics, icon: BookOpen, color: '#FFA502' },
    { label: 'Total Views', value: totalViews._sum.viewCount ?? 0, icon: Eye, color: '#FF6B6B' },
    { label: 'Media Files', value: totalMedia, icon: ImageIcon, color: '#FF69B4' },
    { label: 'AI Requests', value: aiLogs._count, icon: Cpu, color: '#A29BFE' },
    { label: 'AI Tokens Used', value: (aiLogs._sum.inputTokens ?? 0) + (aiLogs._sum.outputTokens ?? 0), icon: Cpu, color: '#55EFC4' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>Analytics</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Platform-wide statistics</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((c) => <StatsCard key={c.label} {...c} />)}
      </div>

      {/* Top articles */}
      <div className="card p-6">
        <h2 className="font-display font-semibold text-lg mb-4" style={{ color: 'var(--text-primary)' }}>
          Top Articles by Views
        </h2>
        <div className="space-y-3">
          {topArticles.map((a, i) => (
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
                {a.viewCount.toLocaleString()} views
              </span>
            </div>
          ))}
          {topArticles.length === 0 && (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No published articles yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}
