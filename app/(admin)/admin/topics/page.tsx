// app/(admin)/topics/page.tsx
export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import ConfirmDeleteTopic from './ConfirmDeleteTopic'

export const metadata: Metadata = { title: 'Topics' }
export const revalidate = 0

export default async function TopicsPage() {
  const topics = await prisma.topic.findMany({
    orderBy: [{ module: { order: 'asc' } }, { order: 'asc' }],
    include: {
      module: { select: { name: true, color: true } },
      _count: { select: { topicArticles: true } },
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>Topics</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{topics.length} topics total</p>
        </div>
        <Link
          href="/admin/topics/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-black"
          style={{ background: '#AAFF00' }}
        >
          <Plus size={16} />New Topic
        </Link>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--bg-border)', color: 'var(--text-muted)' }}>
              <th className="text-left px-4 py-3 font-medium">Topic</th>
              <th className="text-left px-4 py-3 font-medium">Module</th>
              <th className="text-left px-4 py-3 font-medium">Articles</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {topics.map((topic) => (
              <tr
                key={topic.id}
                className="group border-t"
                style={{ borderColor: 'var(--bg-border)' }}
              >
                <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>
                  {topic.name}
                  <p className="text-xs font-normal mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                    /{topic.slug}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <span
                    className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium"
                    style={{ background: (topic.module.color ?? '#6C3DFF') + '25', color: topic.module.color ?? '#6C3DFF' }}
                  >
                    {topic.module.name}
                  </span>
                </td>
                <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                  {topic._count.topicArticles}
                </td>
                <td className="px-4 py-3">
                  <span className={`badge ${topic.isPublished ? 'badge-success' : 'badge-warning'}`}>
                    {topic.isPublished ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link href={`/admin/topics/${topic.id}/edit`} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                      <Pencil size={14} style={{ color: 'var(--text-muted)' }} />
                    </Link>
                    <ConfirmDeleteTopic id={topic.id} name={topic.name} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {topics.length === 0 && (
          <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
            No topics yet. <Link href="/admin/topics/new" className="text-violet-400 hover:underline">Create one.</Link>
          </div>
        )}
      </div>
    </div>
  )
}
