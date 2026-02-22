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

  const handleChange = (val: string) => {
    const params = new URLSearchParams()
    if (val) params.set('menuId', val)
    router.push(`${pathname}${params.toString() ? `?${params}` : ''}`)
  }

  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Filter by Menu:</label>
      <select
        value={currentMenuId ? String(currentMenuId) : ''}
        onChange={(e) => handleChange(e.target.value)}
        className="px-3 py-2 rounded-xl border text-sm outline-none cursor-pointer min-w-[200px]"
        style={{
          background: 'var(--bg-elevated)',
          borderColor: 'var(--bg-border)',
          color: 'var(--text-primary)',
        }}
      >
        <option value="">All Menus</option>
        {menus.map((m) => (
          <option key={m.id} value={String(m.id)}>{m.title}</option>
        ))}
      </select>
    </div>
  )
}
