// app/(admin)/modules/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus, Pencil, Trash2, Eye } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import ConfirmDeleteModule from './ConfirmDeleteModule'

export const metadata: Metadata = { title: 'Modules' }
export const revalidate = 0

export default async function ModulesPage() {
  const modules = await prisma.module.findMany({
    orderBy: { order: 'asc' },
    include: { _count: { select: { topics: true } } },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>Modules</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{modules.length} modules total</p>
        </div>
        <Link
          href="/admin/modules/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white"
          style={{ background: 'linear-gradient(135deg, #6C3DFF, #00D4FF)' }}
        >
          <Plus size={16} />New Module
        </Link>
      </div>

      <div className="grid gap-4">
        {modules.map((mod) => (
          <div
            key={mod.id}
            className="card p-5 flex items-center gap-5 group"
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background: (mod.color ?? '#6C3DFF') + '20' }}
            >
              {mod.icon ?? '📚'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-display font-semibold" style={{ color: 'var(--text-primary)' }}>{mod.name}</h3>
                <span className={`badge ${mod.published ? 'badge-success' : 'badge-warning'}`}>
                  {mod.published ? 'Published' : 'Draft'}
                </span>
              </div>
              <p className="text-sm mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>{mod.description}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                {mod._count.topics} topic{mod._count.topics !== 1 ? 's' : ''} · /modules/{mod.slug}
              </p>
            </div>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Link
                href={`/modules/${mod.slug}`}
                target="_blank"
                className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                title="View"
              >
                <Eye size={16} style={{ color: 'var(--text-muted)' }} />
              </Link>
              <Link
                href={`/admin/modules/${mod.id}/edit`}
                className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                title="Edit"
              >
                <Pencil size={16} style={{ color: 'var(--text-muted)' }} />
              </Link>
              <ConfirmDeleteModule id={mod.id} name={mod.name} />
            </div>
          </div>
        ))}
      </div>

      {modules.length === 0 && (
        <div className="text-center py-20" style={{ color: 'var(--text-muted)' }}>
          <p className="text-lg font-display mb-2" style={{ color: 'var(--text-secondary)' }}>No modules yet</p>
          <p className="text-sm mb-4">Create your first module to get started.</p>
          <Link href="/admin/modules/new" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white" style={{ background: 'linear-gradient(135deg,#6C3DFF,#00D4FF)' }}>
            <Plus size={14} /> Create Module
          </Link>
        </div>
      )}
    </div>
  )
}
