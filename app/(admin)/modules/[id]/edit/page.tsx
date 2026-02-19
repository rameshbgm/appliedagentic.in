// app/(admin)/modules/[id]/edit/page.tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ModuleForm from '@/components/admin/ModuleForm'

export const metadata: Metadata = { title: 'Edit Module' }

export default async function EditModulePage({ params }: { params: { id: string } }) {
  const module = await prisma.module.findUnique({ where: { id: Number(params.id) } })
  if (!module) notFound()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>Edit Module</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{module.name}</p>
      </div>
      <ModuleForm
        initialData={{
          id: module.id,
          name: module.name,
          slug: module.slug,
          description: module.description ?? '',
          icon: module.icon ?? '📚',
          color: module.color ?? '#6C3DFF',
          published: module.published,
        }}
      />
    </div>
  )
}
