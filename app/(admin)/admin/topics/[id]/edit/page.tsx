// app/(admin)/topics/[id]/edit/page.tsx
export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import TopicForm from '@/components/admin/TopicForm'

export const metadata: Metadata = { title: 'Edit Topic' }

export default async function EditTopicPage({ params }: { params: { id: string } }) {
  const [topic, modules] = await Promise.all([
    prisma.topic.findUnique({ where: { id: Number(params.id) } }),
    prisma.module.findMany({ orderBy: { order: 'asc' }, select: { id: true, name: true } }),
  ])
  if (!topic) notFound()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>Edit Topic</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{topic.name}</p>
      </div>
      <TopicForm
        modules={modules}
        initialData={{
          id: topic.id,
          name: topic.name,
          slug: topic.slug,
          description: topic.description ?? '',
          moduleId: topic.moduleId,
          order: topic.order,
          published: topic.isPublished,
        }}
      />
    </div>
  )
}
