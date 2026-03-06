'use client'
// components/public/Navbar.tsx — 2-column mega-nav
import Link from 'next/link'
import { useState, useRef, useCallback } from 'react'
import { Menu as MenuIcon, X, Search, Zap, ChevronRight, ArrowRight } from 'lucide-react'
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
  const [openMobileMenuId, setOpenMobileMenuId] = useState<number | null>(null)
  const [megaOpen, setMegaOpen]                 = useState(false)
  const [activeMenuId, setActiveMenuId]         = useState<number | null>(null)
  const { theme }                               = useTheme()
  const closeTimer  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isDark      = theme === 'dark'

  const navBg        = isDark ? 'rgba(8,14,30,0.96)'     : 'rgba(255,255,255,0.95)'
  const navBorder    = isDark ? 'rgba(255,255,255,0.07)'  : 'rgba(0,0,0,0.08)'
  const textPrimary  = isDark ? 'rgba(255,255,255,0.92)'  : '#111827'
  const textSecond   = isDark ? 'rgba(255,255,255,0.65)'  : '#374151'
  const textMuted    = isDark ? 'rgba(255,255,255,0.35)'  : '#9CA3AF'
  const hoverBg      = isDark ? 'hover:bg-white/8'        : 'hover:bg-black/5'
  const megaBg       = isDark ? 'rgba(10,18,38,0.99)'     : '#ffffff'
  const megaBdr      = isDark ? 'rgba(255,255,255,0.08)'  : 'rgba(0,0,0,0.08)'
  const leftActiveBg = isDark ? 'rgba(59,130,246,0.14)'   : 'rgba(59,130,246,0.08)'

  const menusWithSubs = navMenus.filter((m) => m.subMenus && m.subMenus.length > 0)
  const hasMegaMenus  = menusWithSubs.length > 0
  const activeMenu    = navMenus.find((m) => m.id === activeMenuId) ?? null

  const openMega = useCallback((menuId: number) => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setMegaOpen(true)
    setActiveMenuId(menuId)
  }, [])

  const scheduleMegaClose = useCallback(() => {
    closeTimer.current = setTimeout(() => {
      setMegaOpen(false)
      setActiveMenuId(null)
    }, 150)
  }, [])

  const cancelClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
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
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group" onClick={() => setMegaOpen(false)}>
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)' }}
            >
              <Zap size={15} className="text-white" />
            </div>
            <span
              className="text-[15px] tracking-tight"
              style={{ color: textPrimary, fontFamily: "'Inter', sans-serif", letterSpacing: '-0.02em' }}
            >
              <span style={{ fontWeight: 400 }}>Applied</span>
              <span style={{ fontWeight: 800, background: 'linear-gradient(90deg, #3b82f6 0%, #06b6d4 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Agentic</span>
              <span style={{ fontWeight: 300, opacity: 0.55 }}> AI</span>
            </span>
          </Link>

          {/* ── Desktop Nav ── */}
          <nav className="hidden lg:flex items-center gap-0.5 flex-1 justify-center">
            {navMenus.map((menu) => {
              const hasChildren = menu.subMenus && menu.subMenus.length > 0
              const isActive    = activeMenuId === menu.id && megaOpen
              if (!hasChildren) {
                return (
                  <Link
                    key={menu.id}
                    href={`/${menu.slug}`}
                    onMouseEnter={() => { cancelClose(); setMegaOpen(false); setActiveMenuId(null) }}
                    onClick={() => setMegaOpen(false)}
                    className={`flex items-center h-9 px-4 rounded-lg transition-all ${hoverBg}`}
                    style={{ color: textSecond, fontSize: '13.5px', fontWeight: 500, letterSpacing: '0.01em', fontFamily: "'Inter', sans-serif" }}
                  >
                    {menu.title}
                  </Link>
                )
              }
              return (
                <button
                  key={menu.id}
                  onMouseEnter={() => openMega(menu.id)}
                  onMouseLeave={scheduleMegaClose}
                  onClick={() => (isActive ? setMegaOpen(false) : openMega(menu.id))}
                  className={`flex items-center gap-1 h-9 px-4 rounded-lg transition-all ${hoverBg}`}
                  style={{ color: isActive ? '#3b82f6' : textSecond, fontSize: '13.5px', fontWeight: isActive ? 600 : 500, letterSpacing: '0.01em', fontFamily: "'Inter', sans-serif", background: isActive ? leftActiveBg : 'transparent', border: 'none', cursor: 'pointer' }}
                >
                  {menu.title}
                  <ChevronRight size={11} className={`ml-0.5 transition-transform duration-200 ${isActive ? 'rotate-90' : ''}`} />
                </button>
              )
            })}
            <Link
              href="/search"
              onMouseEnter={() => { cancelClose(); setMegaOpen(false); setActiveMenuId(null) }}
              onClick={() => setMegaOpen(false)}
              className={`flex items-center gap-1.5 h-9 px-4 rounded-lg transition-all ${hoverBg}`}
              style={{ color: textSecond, fontSize: '13.5px', fontWeight: 500, letterSpacing: '0.01em', fontFamily: "'Inter', sans-serif" }}
            >
              <Search size={13} className="opacity-60" />
              Search
            </Link>
          </nav>

          {/* ── Right Actions ── */}
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/search" aria-label="Search" className={`lg:hidden p-2.5 rounded-lg transition-colors ${hoverBg}`} style={{ color: textSecond }}>
              <Search size={20} />
            </Link>
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

      {/* ── Mega-Nav Dropdown: 2 columns — menus (left) + submenus (right) ── */}
      {hasMegaMenus && (
        <div
          className={`hidden lg:block fixed left-0 right-0 z-30 transition-all duration-200 origin-top ${megaOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'}`}
          style={{ top: 64, background: megaBg, borderBottom: `1px solid ${megaBdr}`, boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.5)' : '0 8px 40px rgba(0,0,0,0.08)' }}
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleMegaClose}
        >
          <div className="max-w-6xl mx-auto px-[3%] flex" style={{ minHeight: 280 }}>

            {/* LEFT: all menus */}
            <div className="w-56 shrink-0 py-5 pr-2" style={{ borderRight: `1px solid ${megaBdr}` }}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] px-3 mb-3" style={{ color: textMuted }}>Browse</p>
              <div className="space-y-0.5">
                {navMenus.map((menu) => {
                  const hasChildren  = menu.subMenus && menu.subMenus.length > 0
                  const isLeftActive = menu.id === activeMenuId
                  return (
                    <div
                      key={menu.id}
                      className="flex items-center gap-2 rounded-xl px-3 py-2.5 cursor-pointer transition-colors"
                      style={{ background: isLeftActive ? leftActiveBg : 'transparent', color: isLeftActive ? '#3b82f6' : textSecond }}
                      onMouseEnter={() => { cancelClose(); setActiveMenuId(hasChildren ? menu.id : null) }}
                    >
                      <Link
                        href={`/${menu.slug}`}
                        className="flex-1 text-sm font-medium leading-snug"
                        style={{ color: 'inherit', fontFamily: "'Inter', sans-serif" }}
                        onClick={() => setMegaOpen(false)}
                      >
                        {menu.title}
                      </Link>
                      {hasChildren && (
                        <ChevronRight size={13} className="shrink-0 opacity-50" style={{ color: isLeftActive ? '#3b82f6' : textMuted }} />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* RIGHT: submenus of active menu */}
            <div className="flex-1 py-5 pl-6 pr-2">
              {activeMenu?.subMenus && activeMenu.subMenus.length > 0 ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: textMuted }}>{activeMenu.title}</p>
                    <Link
                      href={`/${activeMenu.slug}`}
                      onClick={() => setMegaOpen(false)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold tracking-wide transition-opacity hover:opacity-70"
                      style={{ color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.06em' }}
                    >
                      View all <ArrowRight size={10} />
                    </Link>
                  </div>
                  <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${activeMenu.subMenus.length > 4 ? 3 : 2}, minmax(0,1fr))` }}>
                    {activeMenu.subMenus.map((sub) => (
                      <Link
                        key={sub.id}
                        href={`/${activeMenu.slug}/${sub.slug}`}
                        onClick={() => setMegaOpen(false)}
                        className="group/sub flex flex-col gap-0.5 rounded-xl px-3 py-2.5 transition-colors"
                        style={{ background: 'transparent' }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)')}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                      >
                        <p className="text-sm font-semibold leading-snug group-hover/sub:text-[#3b82f6] transition-colors" style={{ color: textPrimary, fontFamily: "'Inter', sans-serif", letterSpacing: '-0.01em' }}>{sub.title}</p>
                        {sub.description && (
                          <p className="text-[11.5px] line-clamp-1 leading-snug" style={{ color: textMuted }}>{sub.description}</p>
                        )}
                      </Link>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full opacity-40">
                  <p className="text-sm" style={{ color: textMuted }}>Hover a menu to explore</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {megaOpen && (
        <div
          className="hidden lg:block fixed inset-0 z-20"
          style={{ top: 64 }}
          onClick={() => { setMegaOpen(false); setActiveMenuId(null) }}
        />
      )}

      {/* ── Mobile Drawer ── */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-x-0 top-16 bottom-0 z-50 overflow-y-auto overscroll-contain"
          style={{ background: 'var(--bg-page)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderTop: `1px solid ${navBorder}` }}
        >
          <nav className="px-4 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] space-y-0.5">
            {navMenus.map((menu) => {
              const hasSubs    = menu.subMenus && menu.subMenus.length > 0
              const isExpanded = openMobileMenuId === menu.id
              return (
                <div key={menu.id}>
                  <div className="flex items-stretch rounded-xl overflow-hidden">
                    <Link
                      href={`/${menu.slug}`}
                      onClick={closeMobile}
                      className={`flex-1 flex items-center px-4 py-3 transition-colors ${hoverBg}`}
                      style={{ color: textPrimary, fontSize: '14px', fontWeight: 600, letterSpacing: '-0.01em', fontFamily: "'Inter', sans-serif" }}
                    >
                      {menu.title}
                    </Link>
                    {hasSubs && (
                      <button
                        onClick={() => setOpenMobileMenuId(isExpanded ? null : menu.id)}
                        className={`px-4 transition-colors ${hoverBg} text-xl font-light leading-none select-none`}
                        style={{ color: textMuted, minWidth: '44px' }}
                        aria-label={isExpanded ? 'Collapse' : 'Expand'}
                      >
                        {isExpanded ? '−' : '+'}
                      </button>
                    )}
                  </div>
                  {hasSubs && isExpanded && (
                    <div className="ml-5 mt-1 mb-1 pl-4 space-y-0.5" style={{ borderLeft: `2px solid ${megaBdr}` }}>
                      {menu.subMenus!.map((sub, idx) => (
                        <div key={sub.id}>
                          <Link
                            href={`/${menu.slug}/${sub.slug}`}
                            onClick={closeMobile}
                            className={`flex flex-col gap-0.5 px-3 py-2.5 rounded-xl transition-colors ${hoverBg}`}
                          >
                            <span className="leading-snug" style={{ color: textPrimary, fontSize: '13.5px', fontWeight: 600, letterSpacing: '-0.01em', fontFamily: "'Inter', sans-serif" }}>{sub.title}</span>
                            {sub.description && (
                              <span className="text-xs leading-snug" style={{ color: textMuted }}>{sub.description}</span>
                            )}
                          </Link>
                          {idx < menu.subMenus!.length - 1 && (
                            <div style={{ height: '1px', background: megaBdr, margin: '2px 12px' }} />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
            <div className="mt-4 pt-4 space-y-1" style={{ borderTop: `1px solid ${navBorder}` }}>
              <Link
                href="/search"
                onClick={closeMobile}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${hoverBg}`}
                style={{ color: textSecond, fontSize: '13.5px', fontWeight: 500, letterSpacing: '0.01em', fontFamily: "'Inter', sans-serif" }}
              >
                <Search size={15} /> Search
              </Link>
            </div>
          </nav>
        </div>
      )}
    </>
  )
}
