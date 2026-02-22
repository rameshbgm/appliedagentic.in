'use client'
// app/(admin)/admin/submenus/SubMenusReorderList.tsx
import Link from 'next/link'
import { useState, useCallback, useEffect } from 'react'
import { Pencil, GripVertical } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { toast } from 'sonner'
import ConfirmDeleteSubMenu from './ConfirmDeleteSubMenu'

interface SubMenuData {
  id: number
  title: string
  slug: string
  description?: string | null
  isVisible: boolean
  menu: { id: number; title: string; slug: string }
  _count: { articles: number }
}

function SortableSubMenuItem({
  sm,
  isDeleting,
  onDeleted,
}: {
  sm: SubMenuData
  isDeleting: boolean
  onDeleted: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: sm.id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: isDeleting
      ? 'max-height 0.35s ease, opacity 0.28s ease, margin 0.35s ease, padding 0.35s ease'
      : transition ?? undefined,
    opacity: isDeleting ? 0 : isDragging ? 0.5 : 1,
    maxHeight: isDeleting ? '0px' : '300px',
    overflow: 'hidden',
    marginBottom: isDeleting ? '0px' : undefined,
    zIndex: isDragging ? 50 : undefined,
    pointerEvents: isDeleting ? 'none' : undefined,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`card p-5 flex items-center gap-5 group ${isDragging ? 'shadow-2xl ring-2 ring-[#AAFF00]/40' : ''}`}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 rounded-lg hover:bg-gray-100 transition-colors touch-none"
        style={{ color: 'var(--text-muted)' }}
        aria-label="Drag to reorder"
      >
        <GripVertical size={18} />
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-display font-semibold text-gray-900">{sm.title}</h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-lime-50 text-lime-700 border border-lime-200">
            {sm.menu.title}
          </span>
          <span className={`badge ${sm.isVisible ? 'badge-success' : 'badge-warning'}`}>
            {sm.isVisible ? 'Visible' : 'Hidden'}
          </span>
        </div>
        {sm.description && (
          <p className="text-sm mt-0.5 truncate text-gray-500">{sm.description}</p>
        )}
        <p className="text-xs mt-1 text-gray-400">
          {sm._count.articles} article{sm._count.articles !== 1 ? 's' : ''} · /{sm.menu.slug}/{sm.slug}
        </p>
      </div>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Link
          href={`/admin/submenus/${sm.id}/edit`}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
          title="Edit"
        >
          <Pencil size={16} className="text-gray-400" />
        </Link>
        <Link
          href={`/admin/submenus/${sm.id}/articles`}
          className="px-3 py-1.5 rounded-xl text-xs font-medium hover:bg-gray-100 transition-colors border border-gray-200 text-gray-600"
        >
          Articles
        </Link>
        <ConfirmDeleteSubMenu id={sm.id} name={sm.title} onDeleted={onDeleted} />
      </div>
    </div>
  )
}

export default function SubMenusReorderList({ initialSubMenus }: { initialSubMenus: SubMenuData[] }) {
  const [subMenus, setSubMenus] = useState(initialSubMenus)
  const [saving, setSaving] = useState(false)
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set())
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const handleDeleteStart = useCallback((id: number) => {
    setDeletingIds((prev) => new Set([...prev, id]))
    setTimeout(() => {
      setSubMenus((prev) => prev.filter((s) => s.id !== id))
      setDeletingIds((prev) => { const n = new Set(prev); n.delete(id); return n })
    }, 400)
  }, [])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = subMenus.findIndex((s) => s.id === active.id)
    const newIndex = subMenus.findIndex((s) => s.id === over.id)
    const reordered = arrayMove(subMenus, oldIndex, newIndex)
    setSubMenus(reordered)

    setSaving(true)
    try {
      const res = await fetch('/api/submenus/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: reordered.map((s, i) => ({ id: s.id, order: i + 1 })),
        }),
      })
      if (!res.ok) throw new Error('Failed')
      toast.success('Sub-menu order saved')
    } catch {
      toast.error('Failed to save order')
      setSubMenus(initialSubMenus) // revert on error
    } finally {
      setSaving(false)
    }
  }, [subMenus, initialSubMenus])

  if (!mounted) {
    return (
      <div className="space-y-3">
        {subMenus.map((sm) => (
          <div key={sm.id} className="card p-5 flex items-center gap-5">
            <div className="p-1" style={{ color: 'var(--text-muted)' }}><GripVertical size={18} /></div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display font-semibold text-gray-900">{sm.title}</h3>
              {sm.description && <p className="text-sm mt-0.5 truncate text-gray-500">{sm.description}</p>}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {saving && (
        <p className="text-xs text-gray-400 text-right">Saving order…</p>
      )}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} id="submenus-dnd">
        <SortableContext items={subMenus.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          {subMenus.map((sm) => (
            <SortableSubMenuItem
              key={sm.id}
              sm={sm}
              isDeleting={deletingIds.has(sm.id)}
              onDeleted={() => handleDeleteStart(sm.id)}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  )
}
