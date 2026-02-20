'use client'
// app/(admin)/admin/menus/MenusReorderList.tsx
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
import ConfirmDeleteMenu from './ConfirmDeleteMenu'

interface SubMenuData { id: number; title: string; slug: string }
interface MenuData {
  id: number
  title: string
  slug: string
  description?: string | null
  isVisible: boolean
  subMenus: SubMenuData[]
  _count: { subMenus: number }
}

function SortableMenuItem({ menu, isDeleting, onDeleted }: { menu: MenuData; isDeleting: boolean; onDeleted: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: menu.id })

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
          <h3 className="font-display font-semibold text-gray-900">{menu.title}</h3>
          <span className={`badge ${menu.isVisible ? 'badge-success' : 'badge-warning'}`}>
            {menu.isVisible ? 'Visible' : 'Hidden'}
          </span>
        </div>
        {menu.description && (
          <p className="text-sm mt-0.5 truncate text-gray-500">{menu.description}</p>
        )}
        <p className="text-xs mt-1 text-gray-400">
          {menu._count.subMenus} sub-menu{menu._count.subMenus !== 1 ? 's' : ''} · /{menu.slug}
        </p>
        {menu.subMenus.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {menu.subMenus.map((sm) => (
              <span
                key={sm.id}
                className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200"
              >
                {sm.title}
              </span>
            ))}
            {menu._count.subMenus > 5 && (
              <span className="text-xs px-2 py-0.5 rounded-full text-gray-400">
                +{menu._count.subMenus - 5} more
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Link
          href={`/admin/menus/${menu.id}/edit`}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
          title="Edit"
        >
          <Pencil size={16} className="text-gray-400" />
        </Link>
        <ConfirmDeleteMenu id={menu.id} name={menu.title} onDeleted={onDeleted} />
      </div>
    </div>
  )
}

export default function MenusReorderList({ initialMenus }: { initialMenus: MenuData[] }) {
  const [menus, setMenus] = useState(initialMenus)
  const [saving, setSaving] = useState(false)
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set())
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const handleDeleteStart = useCallback((id: number) => {
    setDeletingIds((prev) => new Set([...prev, id]))
    setTimeout(() => {
      setMenus((prev) => prev.filter((m) => m.id !== id))
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

    const oldIndex = menus.findIndex((m) => m.id === active.id)
    const newIndex = menus.findIndex((m) => m.id === over.id)
    const reordered = arrayMove(menus, oldIndex, newIndex)
    setMenus(reordered)

    setSaving(true)
    try {
      const res = await fetch('/api/menus/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: reordered.map((m, i) => ({ id: m.id, order: i + 1 })),
        }),
      })
      if (!res.ok) throw new Error('Failed')
      toast.success('Menu order saved')
    } catch {
      toast.error('Failed to save order')
      setMenus(initialMenus) // revert
    } finally {
      setSaving(false)
    }
  }, [menus, initialMenus])

  if (!mounted) {
    return (
      <div className="space-y-3">
        {menus.map((menu) => (
          <div key={menu.id} className="card p-5 flex items-center gap-5 group">
            <div className="p-1" style={{ color: 'var(--text-muted)' }}><GripVertical size={18} /></div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display font-semibold text-gray-900">{menu.title}</h3>
              {menu.description && <p className="text-sm mt-0.5 truncate text-gray-500">{menu.description}</p>}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {saving && (
        <p className="text-xs text-gray-400 text-right animate-pulse">Saving order…</p>
      )}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} id="menus-dnd">
        <SortableContext items={menus.map((m) => m.id)} strategy={verticalListSortingStrategy}>
          {menus.map((menu) => (
            <SortableMenuItem
              key={menu.id}
              menu={menu}
              isDeleting={deletingIds.has(menu.id)}
              onDeleted={() => handleDeleteStart(menu.id)}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  )
}
