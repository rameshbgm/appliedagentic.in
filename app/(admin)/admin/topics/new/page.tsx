// app/(admin)/topics/new/page.tsx
export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import TopicForm from '@/components/admin/TopicForm'

export const metadata: Metadata = { title: 'New Topic' }

export default async function NewTopicPage() {
  const modules = await prisma.module.findMany({ orderBy: { order: 'asc' }, select: { id: true, name: true } })
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>New Topic</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Create a new topic under a module</p>
      </div>
      <TopicForm modules={modules} />
    </div>
  )
}
