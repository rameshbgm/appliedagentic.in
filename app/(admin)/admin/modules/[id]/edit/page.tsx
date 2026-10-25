// app/(admin)/modules/[id]/edit/page.tsx
export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ModuleForm from '@/components/admin/ModuleForm'

export const metadata: Metadata = { title: 'Edit Module' }

export default async function EditModulePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const moduleRecord = await prisma.module.findUnique({ where: { id: Number(id) } })
  if (!moduleRecord) notFound()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>Edit Module</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{moduleRecord.name}</p>
      </div>
      <ModuleForm
        initialData={{
          id: moduleRecord.id,
          name: moduleRecord.name,
          slug: moduleRecord.slug,
          description: moduleRecord.description ?? '',
          icon: moduleRecord.icon ?? '📚',
          color: moduleRecord.color ?? '#6C3DFF',
          published: moduleRecord.isPublished,
        }}
      />
    </div>
  )
}
