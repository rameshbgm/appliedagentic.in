'use client'
// app/(admin)/admin/submenus/SubMenuFilter.tsx
import { useRouter, usePathname } from 'next/navigation'

interface Props {
  menus: { id: number; title: string }[]
  currentMenuId?: number
}

export default function SubMenuFilter({ menus, currentMenuId }: Props) {
  const router = useRouter()
  const pathname = usePathname()

  const handleChange = (menuId: string) => {
    const params = new URLSearchParams()
    if (menuId) params.set('menuId', menuId)
    router.push(`${pathname}${params.toString() ? `?${params}` : ''}`)
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        onClick={() => handleChange('')}
        className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
        style={{
          background: !currentMenuId ? 'var(--green)' : 'var(--bg-elevated)',
          color: !currentMenuId ? '#000' : 'var(--text-secondary)',
          border: '1px solid var(--bg-border)',
        }}
      >
        All
      </button>
      {menus.map((m) => (
        <button
          key={m.id}
          onClick={() => handleChange(String(m.id))}
          className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
          style={{
            background: currentMenuId === m.id ? 'var(--green)' : 'var(--bg-elevated)',
            color: currentMenuId === m.id ? '#000' : 'var(--text-secondary)',
            border: '1px solid var(--bg-border)',
          }}
        >
          {m.title}
        </button>
      ))}
    </div>
  )
}
