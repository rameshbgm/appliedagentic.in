'use client'
// app/(admin)/admin/articles/ArticleFilters.tsx
import { useState, useEffect, useCallback } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'

interface SubMenu { id: number; title: string }
interface NavMenu { id: number; title: string; subMenus: SubMenu[] }

export default function ArticleFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentSearch = searchParams.get('search') ?? ''
  const currentMenuId = searchParams.get('menuId') ?? ''
  const currentSubMenuId = searchParams.get('subMenuId') ?? ''

  const [searchInput, setSearchInput] = useState(currentSearch)
  const [menus, setMenus] = useState<NavMenu[]>([])
  const [subMenus, setSubMenus] = useState<SubMenu[]>([])

  // Fetch all menus once on mount
  useEffect(() => {
    fetch('/api/menus?includeSubMenus=true&visible=false')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setMenus(data.data ?? [])
      })
      .catch(() => {})
  }, [])

  // Update submenus when menuId changes
  useEffect(() => {
    if (!currentMenuId) { setSubMenus([]); return }
    const menu = menus.find((m) => String(m.id) === currentMenuId)
    setSubMenus(menu?.subMenus ?? [])
  }, [currentMenuId, menus])

  // Keep local input in sync when URL changes externally (e.g. tab click resets search)
  useEffect(() => {
    setSearchInput(searchParams.get('search') ?? '')
  }, [searchParams])

  const buildHref = useCallback(
    (overrides: Record<string, string | undefined>) => {
      const p = new URLSearchParams(searchParams.toString())
      // Always reset to page 1 on filter change
      p.delete('page')
      for (const [k, v] of Object.entries(overrides)) {
        if (v) p.set(k, v)
        else p.delete(k)
      }
      const qs = p.toString()
      return qs ? `${pathname}?${qs}` : pathname
    },
    [searchParams, pathname],
  )

  // Debounced search push
  useEffect(() => {
    // Don't fire on first render if nothing changed
    if (searchInput === currentSearch) return
    const timer = setTimeout(() => {
      router.push(buildHref({ search: searchInput || undefined }))
    }, 350)
    return () => clearTimeout(timer)
  }, [searchInput]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleMenuChange = (menuId: string) => {
    router.push(buildHref({ menuId: menuId || undefined, subMenuId: undefined }))
  }

  const handleSubMenuChange = (subMenuId: string) => {
    router.push(buildHref({ subMenuId: subMenuId || undefined }))
  }

  const clearAll = () => {
    setSearchInput('')
    router.push(pathname)
  }

  const hasFilters = !!(currentSearch || currentMenuId || currentSubMenuId)

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px] max-w-xs">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: 'var(--text-muted)' }}
        />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search articles…"
          className="w-full pl-8 pr-3 py-2 text-sm rounded-xl border outline-none transition-colors focus:ring-1"
          style={{
            background: 'var(--bg-elevated)',
            borderColor: searchInput ? 'var(--color-violet)' : 'var(--bg-border)',
            color: 'var(--text-primary)',
            boxShadow: searchInput ? '0 0 0 2px rgba(124,58,237,0.15)' : 'none',
          }}
        />
        {searchInput && (
          <button
            onClick={() => { setSearchInput(''); router.push(buildHref({ search: undefined })) }}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:opacity-70"
            style={{ color: 'var(--text-muted)' }}
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Menu filter */}
      <select
        value={currentMenuId}
        onChange={(e) => handleMenuChange(e.target.value)}
        className="px-3 py-2 text-sm rounded-xl border outline-none cursor-pointer"
        style={{
          background: 'var(--bg-elevated)',
          borderColor: currentMenuId ? 'var(--color-violet)' : 'var(--bg-border)',
          color: currentMenuId ? 'var(--color-violet)' : 'var(--text-secondary)',
          minWidth: '140px',
        }}
      >
        <option value="">All menus</option>
        {menus.map((m) => (
          <option key={m.id} value={String(m.id)}>
            {m.title}
          </option>
        ))}
      </select>

      {/* SubMenu filter — only shown if a menu is selected */}
      {currentMenuId && subMenus.length > 0 && (
        <select
          value={currentSubMenuId}
          onChange={(e) => handleSubMenuChange(e.target.value)}
          className="px-3 py-2 text-sm rounded-xl border outline-none cursor-pointer"
          style={{
            background: 'var(--bg-elevated)',
            borderColor: currentSubMenuId ? 'var(--color-violet)' : 'var(--bg-border)',
            color: currentSubMenuId ? 'var(--color-violet)' : 'var(--text-secondary)',
            minWidth: '160px',
          }}
        >
          <option value="">All sub-menus</option>
          {subMenus.map((s) => (
            <option key={s.id} value={String(s.id)}>
              {s.title}
            </option>
          ))}
        </select>
      )}

      {/* Clear all filters */}
      {hasFilters && (
        <button
          onClick={clearAll}
          className="flex items-center gap-1.5 px-3 py-2 text-xs rounded-xl border transition-colors hover:border-red-400 hover:text-red-400"
          style={{ borderColor: 'var(--bg-border)', color: 'var(--text-muted)' }}
        >
          <X size={11} />
          Clear filters
        </button>
      )}
    </div>
  )
}
