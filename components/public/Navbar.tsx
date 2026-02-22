'use client'
// components/public/Navbar.tsx
import Link from 'next/link'
import { useState, useRef, useCallback } from 'react'
import { Menu as MenuIcon, X, Search, Zap, ChevronDown } from 'lucide-react'
import { useTheme } from '@/components/shared/ThemeProvider'

interface NavSubMenuData {
  id: number
  title: string
  slug: string
  description?: string | null
}

interface NavMenuData {
  id: number
  title: string
  slug: string
  subMenus?: NavSubMenuData[]
}

interface Props {
  navMenus?: NavMenuData[]
}

export default function Navbar({ navMenus = [] }: Props) {
  const [mobileOpen, setMobileOpen]             = useState(false)
  const [openMenuId, setOpenMenuId]             = useState<number | null>(null)
  const [openMobileMenuId, setOpenMobileMenuId] = useState<number | null>(null)
  const { theme }                               = useTheme()
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isDark = theme === 'dark'
  const navBg        = isDark ? 'rgba(8, 14, 30, 0.96)'  : 'rgba(255, 255, 255, 0.95)'
  const navBorder    = isDark ? 'rgba(255,255,255,0.07)'  : 'rgba(0,0,0,0.08)'
  const textPrimary  = isDark ? 'rgba(255,255,255,0.92)'  : '#111827'
  const textSecond   = isDark ? 'rgba(255,255,255,0.65)'  : '#374151'
  const textMuted    = isDark ? 'rgba(255,255,255,0.35)'  : '#9CA3AF'
  const hoverBg      = isDark ? 'hover:bg-white/8'        : 'hover:bg-black/5'
  const dropdownBg   = isDark ? 'rgba(14, 22, 44, 0.98)'  : '#ffffff'
  const dropdownBdr  = isDark ? 'rgba(255,255,255,0.09)'  : 'rgba(0,0,0,0.09)'

  const handleMouseEnter = useCallback((id: number) => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setOpenMenuId(id)
  }, [])

  const handleMouseLeave = useCallback(() => {
    closeTimer.current = setTimeout(() => setOpenMenuId(null), 120)
  }, [])

  const closeMobile = () => {
    setMobileOpen(false)
    setOpenMobileMenuId(null)
  }

  return (
    <>
    <header
      className="fixed top-0 left-0 right-0 z-40"
      style={{ background: navBg, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderBottom: `1px solid ${navBorder}` }}
    >
      <div className="w-full px-[3%] h-16 flex items-center justify-between gap-4">

        {/* ── Logo ── */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)' }}
          >
            <Zap size={15} className="text-white" />
          </div>
          <span className="font-bold text-sm tracking-tight" style={{ color: textPrimary }}>
            Applied<span style={{
              background: 'linear-gradient(90deg, #3b82f6 0%, #06b6d4 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>Agentic</span>
          </span>
        </Link>

        {/* ── Desktop Nav ── */}
        <nav className="hidden lg:flex items-center gap-0.5 flex-1 justify-center">
          {navMenus.map((menu) => {
            const hasChildren = menu.subMenus && menu.subMenus.length > 0
            const isOpen = openMenuId === menu.id

            if (!hasChildren) {
              return (
                <Link
                  key={menu.id}
                  href={`/${menu.slug}`}
                  className={`flex items-center h-9 px-4 rounded-lg text-[15px] font-medium transition-colors ${hoverBg}`}
                  style={{ color: textSecond }}
                >
                  {menu.title}
                </Link>
              )
            }

            return (
              <div
                key={menu.id}
                className="relative"
                onMouseEnter={() => handleMouseEnter(menu.id)}
                onMouseLeave={handleMouseLeave}
              >
                <Link
                  href={`/${menu.slug}`}
                  className={`flex items-center gap-1 h-9 px-4 rounded-lg text-[15px] font-medium transition-colors ${hoverBg}`}
                  style={{ color: isOpen ? 'var(--green)' : textSecond }}
                >
                  {menu.title}
                  <ChevronDown
                    size={13}
                    className={`ml-0.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                  />
                </Link>

                {/* Dropdown — rendered always, toggle via opacity so mouse can travel into it */}
                <div
                  className={`absolute top-full left-0 w-72 rounded-2xl shadow-2xl overflow-hidden transition-all duration-150 origin-top ${
                    isOpen
                      ? 'opacity-100 scale-y-100 pointer-events-auto'
                      : 'opacity-0 scale-y-95 pointer-events-none'
                  }`}
                  style={{ background: dropdownBg, border: `1px solid ${dropdownBdr}` }}
                  onMouseEnter={() => handleMouseEnter(menu.id)}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className="p-2">
                    {menu.subMenus!.map((sub, idx) => (
                      <div key={sub.id}>
                        <Link
                          href={`/${menu.slug}/${sub.slug}`}
                          className={`flex flex-col gap-0.5 px-3 py-2.5 rounded-xl transition-colors ${hoverBg} group/item`}
                          onClick={() => setOpenMenuId(null)}
                        >
                          <p
                            className="text-[13px] font-semibold leading-snug group-hover/item:text-[var(--green)] transition-colors"
                            style={{ color: textPrimary }}
                          >
                            {sub.title}
                          </p>
                          {sub.description && (
                            <p className="text-[11px] line-clamp-1" style={{ color: textMuted }}>
                              {sub.description}
                            </p>
                          )}
                        </Link>
                        {idx < menu.subMenus!.length - 1 && (
                          <div style={{ height: '1px', background: dropdownBdr, margin: '2px 12px' }} />
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="px-2 pb-2 pt-1" style={{ borderTop: `1px solid ${dropdownBdr}` }}>
                    <Link
                      href={`/${menu.slug}`}
                      className={`flex items-center justify-center w-full py-2 rounded-xl text-xs font-semibold transition-colors ${hoverBg}`}
                      style={{ color: 'var(--green)' }}
                      onClick={() => setOpenMenuId(null)}
                    >
                      View all →
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}

          <Link
            href="/search"
            className={`flex items-center gap-1.5 h-9 px-4 rounded-lg text-[15px] font-medium transition-colors ${hoverBg}`}
            style={{ color: textSecond }}
          >
            <Search size={14} className="opacity-70" />
            Search
          </Link>
        </nav>

        {/* ── Right Actions ── */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Mobile search */}
          <Link
            href="/search"
            aria-label="Search"
            className={`lg:hidden p-2.5 rounded-lg transition-colors ${hoverBg}`}
            style={{ color: textSecond }}
          >
            <Search size={20} />
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            className={`lg:hidden p-2.5 rounded-lg transition-colors ${hoverBg}`}
            style={{ color: textSecond, touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' } as React.CSSProperties}
          >
            {mobileOpen ? <X size={22} /> : <MenuIcon size={22} />}
          </button>
        </div>
      </div>
    </header>

      {/* ── Mobile Drawer — OUTSIDE header to escape backdrop-filter stacking context ── */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-x-0 top-16 bottom-0 z-50 overflow-y-auto overscroll-contain"
          style={{ background: 'rgba(8, 14, 30, 0.99)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderTop: `1px solid ${navBorder}` }}
        >
          <nav className="px-4 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] space-y-0.5">
            {navMenus.map((menu) => {
              const hasSubs = menu.subMenus && menu.subMenus.length > 0
              const isExpanded = openMobileMenuId === menu.id

              return (
                <div key={menu.id}>
                  <div className="flex items-stretch rounded-xl overflow-hidden">
                    <Link
                      href={`/${menu.slug}`}
                      onClick={closeMobile}
                      className="flex-1 flex items-center px-4 py-3 text-sm font-semibold transition-colors hover:bg-white/8"
                      style={{ color: 'rgba(255,255,255,0.92)' }}
                    >
                      {menu.title}
                    </Link>
                    {hasSubs && (
                      <button
                        onClick={() => setOpenMobileMenuId(isExpanded ? null : menu.id)}
                        className="px-4 transition-colors hover:bg-white/8 text-xl font-light leading-none select-none"
                        style={{ color: 'rgba(255,255,255,0.55)', minWidth: '44px' }}
                        aria-label={isExpanded ? 'Collapse' : 'Expand'}
                      >
                        {isExpanded ? '−' : '+'}
                      </button>
                    )}
                  </div>

                  {hasSubs && isExpanded && (
                    <div
                      className="ml-5 mt-1 mb-1 pl-4 space-y-0.5"
                      style={{ borderLeft: '2px solid rgba(255,255,255,0.09)' }}
                    >
                      {menu.subMenus!.map((sub, idx) => (
                        <div key={sub.id}>
                          <Link
                            href={`/${menu.slug}/${sub.slug}`}
                            onClick={closeMobile}
                            className="flex flex-col gap-0.5 px-3 py-2.5 rounded-xl transition-colors hover:bg-white/8"
                          >
                            <span className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.90)' }}>
                              {sub.title}
                            </span>
                            {sub.description && (
                              <span className="text-xs leading-snug" style={{ color: 'rgba(255,255,255,0.45)' }}>
                                {sub.description}
                              </span>
                            )}
                          </Link>
                          {idx < menu.subMenus!.length - 1 && (
                            <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)', margin: '2px 12px' }} />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}

            <div className="mt-4 pt-4 space-y-1" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <Link
                href="/search"
                onClick={closeMobile}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-colors hover:bg-white/8"
                style={{ color: 'rgba(255,255,255,0.65)' }}
              >
                <Search size={16} /> Search
              </Link>
            </div>
          </nav>
        </div>
      )}
    </>
  )
}

