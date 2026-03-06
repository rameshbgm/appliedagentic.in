'use client'
// app/(admin)/admin/menus/MenuSubMenusPanel.tsx
// Shows sub-menus linked to a menu on the edit page for quick access.
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Pencil, Eye, EyeOff, FileText } from 'lucide-react'
import { toast } from 'sonner'

interface SubMenuSummary {
  id: number
  title: string
  slug: string
  isVisible: boolean
  order: number
  _count: { articles: number }
}

interface Props {
  menuId: number
  menuTitle: string
  initialSubMenus: SubMenuSummary[]
}

export default function MenuSubMenusPanel({ menuId, menuTitle, initialSubMenus }: Props) {
  const [subMenus, setSubMenus] = useState<SubMenuSummary[]>(initialSubMenus)

  const toggleVisibility = async (sm: SubMenuSummary) => {
    try {
      const res = await fetch(`/api/submenus/${sm.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVisible: !sm.isVisible }),
      })
      const data = await res.json()
      if (data.success) {
        setSubMenus((prev) => prev.map((s) => s.id === sm.id ? { ...s, isVisible: !s.isVisible } : s))
        toast.success(sm.isVisible ? 'Sub-menu hidden' : 'Sub-menu visible')
      } else {
        toast.error(data.error ?? 'Failed to update visibility')
      }
    } catch {
      toast.error('Network error')
    }
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-xl" style={{ color: 'var(--text-primary)' }}>
            Sub-Menus
          </h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {subMenus.length} sub-menu{subMenus.length !== 1 ? 's' : ''} under &ldquo;{menuTitle}&rdquo;
          </p>
        </div>
        <Link
          href={`/admin/submenus/new?menuId=${menuId}`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
          style={{ background: 'var(--color-violet)' }}
        >
          <Plus size={14} /> Add Sub-Menu
        </Link>
      </div>

      {subMenus.length === 0 ? (
        <div
          className="text-center py-10 rounded-2xl border-2 border-dashed"
          style={{ borderColor: 'var(--bg-border)', color: 'var(--text-muted)' }}
        >
          <p className="text-sm">No sub-menus yet.</p>
          <Link
            href={`/admin/submenus/new?menuId=${menuId}`}
            className="text-sm font-medium mt-2 inline-block"
            style={{ color: 'var(--color-violet)' }}
          >
            Create the first sub-menu →
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {subMenus.map((sm) => (
            <div
              key={sm.id}
              className="card p-4 flex items-center gap-4 group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                    {sm.title}
                  </span>
                  <span className={`badge ${sm.isVisible ? 'badge-success' : 'badge-warning'}`}>
                    {sm.isVisible ? 'Visible' : 'Hidden'}
                  </span>
                </div>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  /{sm.slug} · {sm._count.articles} article{sm._count.articles !== 1 ? 's' : ''}
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Visibility toggle */}
                <button
                  type="button"
                  onClick={() => toggleVisibility(sm)}
                  title={sm.isVisible ? 'Hide' : 'Show'}
                  className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                  style={{ color: sm.isVisible ? 'var(--green)' : 'var(--text-muted)' }}
                >
                  {sm.isVisible ? <Eye size={15} /> : <EyeOff size={15} />}
                </button>

                {/* Articles */}
                <Link
                  href={`/admin/submenus/${sm.id}/articles`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium hover:bg-gray-100 transition-colors border"
                  style={{ borderColor: 'var(--bg-border)', color: 'var(--text-secondary)' }}
                  title="Manage articles"
                >
                  <FileText size={12} />
                  Articles ({sm._count.articles})
                </Link>

                {/* Edit */}
                <Link
                  href={`/admin/submenus/${sm.id}/edit`}
                  className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                  title="Edit sub-menu"
                >
                  <Pencil size={15} className="text-gray-400" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
