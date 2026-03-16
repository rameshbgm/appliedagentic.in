'use client'
// components/public/Navbar.tsx — 2-column mega-nav
import Link from 'next/link'
import { useState, useRef, useCallback } from 'react'
import { Menu as MenuIcon, X, Search, Zap, ChevronRight, ChevronDown, ArrowRight } from 'lucide-react'
import { useTheme } from '@/components/shared/ThemeProvider'
import { useArticleLoading } from '@/components/shared/ArticleLoadingContext'

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

const FONT = "'Space Grotesk', system-ui, sans-serif"

export default function Navbar({ navMenus = [] }: Props) {
  const [mobileOpen, setMobileOpen]             = useState(false)
  const [openMobileMenuId, setOpenMobileMenuId] = useState<number | null>(null)
  const [megaOpen, setMegaOpen]                 = useState(false)
  const [activeMenuId, setActiveMenuId]         = useState<number | null>(null)
  const { theme }                               = useTheme()
  const closeTimer  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isDark      = theme === 'dark'
  const { showLoading } = useArticleLoading()

  const navBg        = isDark ? 'rgba(8,14,30,0.96)'     : 'rgba(255,255,255,0.95)'
  const navBorder    = isDark ? 'rgba(255,255,255,0.07)'  : 'rgba(0,0,0,0.08)'
  const textPrimary  = isDark ? 'rgba(255,255,255,0.92)'  : '#111827'
  const textSecond   = isDark ? 'rgba(255,255,255,0.65)'  : '#374151'
  const textMuted    = isDark ? 'rgba(255,255,255,0.35)'  : '#9CA3AF'
  const hoverBg      = isDark ? 'hover:bg-white/8'        : 'hover:bg-black/5'
  const megaBg       = isDark ? 'rgba(10,18,38,0.99)'     : '#ffffff'
  const megaBdr      = isDark ? 'rgba(255,255,255,0.08)'  : 'rgba(0,0,0,0.08)'
  const leftActiveBg = isDark ? 'rgba(59,130,246,0.14)'   : 'rgba(59,130,246,0.08)'
  const cardHoverBg  = isDark ? 'rgba(255,255,255,0.05)'  : 'rgba(59,130,246,0.04)'
  const cardHoverBdr = isDark ? 'rgba(255,255,255,0.1)'   : 'rgba(59,130,246,0.2)'

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
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group" onClick={() => { setMegaOpen(false); showLoading('/') }}>
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)' }}
            >
              <Zap size={15} className="text-white" />
            </div>
            <span
              className="text-[15px] tracking-tight"
              style={{ color: textPrimary, fontFamily: FONT, letterSpacing: '-0.02em' }}
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
                    onClick={() => { setMegaOpen(false); showLoading(`/${menu.slug}`) }}
                    className={`flex items-center h-9 px-4 rounded-lg transition-all ${hoverBg}`}
                    style={{ color: textSecond, fontSize: '13.5px', fontWeight: 500, letterSpacing: '0.01em', fontFamily: FONT }}
                  >
                    {menu.title}
                  </Link>
                )
              }
              return (
                <button
                  key={menu.id}
                  type="button"
                  onMouseEnter={() => openMega(menu.id)}
                  onMouseLeave={scheduleMegaClose}
                  onClick={() => (isActive ? setMegaOpen(false) : openMega(menu.id))}
                  className={`flex items-center gap-1 h-9 px-4 rounded-lg transition-all ${hoverBg}`}
                  style={{ color: isActive ? '#3b82f6' : textSecond, fontSize: '13.5px', fontWeight: isActive ? 600 : 500, letterSpacing: '0.01em', fontFamily: FONT, background: isActive ? leftActiveBg : 'transparent', border: 'none', cursor: 'pointer' }}
                >
                  {menu.title}
                  <ChevronDown size={12} className={`ml-0.5 transition-transform duration-200 ${isActive ? 'rotate-180' : ''}`} />
                </button>
              )
            })}
            <Link
              href="/search"
              onMouseEnter={() => { cancelClose(); setMegaOpen(false); setActiveMenuId(null) }}
              onClick={() => { setMegaOpen(false); showLoading('/search') }}
              className={`flex items-center gap-1.5 h-9 px-4 rounded-lg transition-all ${hoverBg}`}
              style={{ color: textSecond, fontSize: '13.5px', fontWeight: 500, letterSpacing: '0.01em', fontFamily: FONT }}
            >
              <Search size={13} className="opacity-60" />
              Search
            </Link>
          </nav>

          {/* ── Right Actions ── */}
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/search" aria-label="Search" onClick={() => showLoading('/search')} className={`lg:hidden p-2.5 rounded-lg transition-colors ${hoverBg}`} style={{ color: textSecond }}>
              <Search size={20} />
            </Link>
            <button
              type="button"
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

      {/* ── Mega-Nav Dropdown: 2 columns, auto-height ── */}
      {hasMegaMenus && (
        <div
          className={`hidden lg:block fixed left-0 right-0 z-30 transition-all duration-200 origin-top ${megaOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'}`}
          style={{ top: 64, background: megaBg, borderBottom: `1px solid ${megaBdr}`, boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.5)' : '0 8px 40px rgba(0,0,0,0.1)' }}
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleMegaClose}
        >
          <div className="max-w-6xl mx-auto px-[3%] flex" style={{ maxHeight: 420, minHeight: 160 }}>

            {/* ── LEFT column: all menus ── */}
            <div
              className="shrink-0 py-4 pr-2 overflow-y-auto mega-col-scroll"
              style={{ width: 220, borderRight: `1px solid ${megaBdr}` }}
            >
              <div className="space-y-px">
                {navMenus.map((menu) => {
                  const hasChildren  = menu.subMenus && menu.subMenus.length > 0
                  const isLeftActive = menu.id === activeMenuId
                  return (
                    <div
                      key={menu.id}
                      className="flex items-center cursor-pointer transition-all duration-150"
                      style={{ color: isLeftActive ? '#3b82f6' : textSecond }}
                      onMouseEnter={() => { cancelClose(); setActiveMenuId(hasChildren ? menu.id : null) }}
                    >
                      <span
                        className="shrink-0 self-stretch transition-all duration-150"
                        style={{ width: 3, background: isLeftActive ? '#3b82f6' : 'transparent', borderRadius: '0 2px 2px 0' }}
                      />
                      <Link
                        href={`/${menu.slug}`}
                        className="flex-1 flex items-center justify-between gap-2 px-4 py-2.5 text-[13.5px] leading-snug truncate"
                        style={{ color: 'inherit', fontFamily: FONT, fontWeight: isLeftActive ? 600 : 500 }}
                        onClick={() => { setMegaOpen(false); showLoading(`/${menu.slug}`) }}
                      >
                        {menu.title}
                        {hasChildren && (
                          <ChevronRight
                            size={13}
                            className="shrink-0 transition-transform duration-150"
                            style={{ color: isLeftActive ? '#3b82f6' : textMuted, opacity: isLeftActive ? 1 : 0.5, transform: isLeftActive ? 'translateX(2px)' : 'none' }}
                          />
                        )}
                      </Link>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* ── RIGHT column: submenus of active menu ── */}
            <div className="flex-1 min-w-0 py-5 pl-5 pr-3 overflow-y-auto mega-col-scroll">
              {activeMenu?.subMenus && activeMenu.subMenus.length > 0 ? (
                <>
                  <div
                    className="flex items-center justify-between mb-4 pb-2.5 sticky top-0"
                    style={{ background: megaBg, borderBottom: `1px solid ${megaBdr}` }}
                  >
                    <p
                      className="text-[10px] font-bold uppercase tracking-[0.14em]"
                      style={{ color: textMuted, fontFamily: FONT }}
                    >
                      {activeMenu.title}
                    </p>
                    <Link
                      href={`/${activeMenu.slug}`}
                      onClick={() => { setMegaOpen(false); showLoading(`/${activeMenu.slug}`) }}
                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold transition-all hover:gap-2"
                      style={{ color: '#3b82f6', letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: FONT }}
                    >
                      View all <ArrowRight size={10} />
                    </Link>
                  </div>

                  {/* 3-column grid of sub-menu cards */}
                  <div className="grid grid-cols-3 gap-2">
                    {activeMenu.subMenus.map((sub) => (
                      <Link
                        key={sub.id}
                        href={`/${activeMenu.slug}/${sub.slug}`}
                        onClick={() => { setMegaOpen(false); showLoading(`/${activeMenu.slug}/${sub.slug}`) }}
                        className="group/sub flex flex-col gap-1 rounded-xl px-3.5 py-3 transition-all duration-150"
                        style={{ background: 'transparent', border: `1px solid transparent` }}
                        onMouseEnter={(e) => {
                          const el = e.currentTarget as HTMLElement
                          el.style.background = cardHoverBg
                          el.style.borderColor = cardHoverBdr
                        }}
                        onMouseLeave={(e) => {
                          const el = e.currentTarget as HTMLElement
                          el.style.background = 'transparent'
                          el.style.borderColor = 'transparent'
                        }}
                      >
                        <p
                          className="text-[13px] font-semibold leading-snug group-hover/sub:text-[#3b82f6] transition-colors"
                          style={{ color: textPrimary, fontFamily: FONT, letterSpacing: '-0.01em' }}
                        >
                          {sub.title}
                        </p>
                        {sub.description && (
                          <p className="text-[11px] line-clamp-2 leading-snug" style={{ color: textMuted, fontFamily: FONT }}>
                            {sub.description}
                          </p>
                        )}
                      </Link>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full" style={{ opacity: 0.35 }}>
                  <p className="text-sm" style={{ color: textMuted, fontFamily: FONT }}>Hover a topic to explore</p>
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
      <div
        className={`lg:hidden fixed inset-x-0 top-16 bottom-0 z-50 overflow-y-auto overscroll-contain transition-all duration-200 ${mobileOpen ? 'opacity-100 pointer-events-auto translate-y-0' : 'opacity-0 pointer-events-none -translate-y-2'}`}
        style={{ background: 'var(--bg-page)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderTop: `1px solid ${navBorder}` }}
      >
        <nav className="px-4 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] space-y-0.5">
          {navMenus.map((menu) => {
            const hasSubs    = menu.subMenus && menu.subMenus.length > 0
            const isExpanded = openMobileMenuId === menu.id
            return (
              <div key={menu.id}>
                <div className="flex items-stretch rounded-xl overflow-hidden" style={{ minHeight: 48 }}>
                  <Link
                    href={`/${menu.slug}`}
                    onClick={() => { closeMobile(); showLoading(`/${menu.slug}`) }}
                    className={`flex-1 flex items-center px-4 py-3 transition-colors ${hoverBg}`}
                    style={{ color: textPrimary, fontSize: '14.5px', fontWeight: 600, letterSpacing: '-0.01em', fontFamily: FONT }}
                  >
                    {menu.title}
                  </Link>
                  {hasSubs && (
                    <button
                      type="button"
                      onClick={() => setOpenMobileMenuId(isExpanded ? null : menu.id)}
                      className={`flex items-center justify-center transition-colors ${hoverBg}`}
                      style={{ color: textMuted, minWidth: 48, WebkitTapHighlightColor: 'transparent' } as React.CSSProperties}
                      aria-label={isExpanded ? 'Collapse' : 'Expand'}
                    >
                      <ChevronDown
                        size={18}
                        className="transition-transform duration-200"
                        style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', color: isExpanded ? '#3b82f6' : textMuted }}
                      />
                    </button>
                  )}
                </div>
                {hasSubs && isExpanded && (
                  <div className="ml-4 mt-1 mb-2 pl-4 space-y-0.5" style={{ borderLeft: `3px solid #3b82f6`, borderImage: 'linear-gradient(to bottom, #3b82f6, #06b6d4) 1' }}>
                    {menu.subMenus!.map((sub, idx) => (
                      <div key={sub.id}>
                        <Link
                          href={`/${menu.slug}/${sub.slug}`}
                          onClick={() => { closeMobile(); showLoading(`/${menu.slug}/${sub.slug}`) }}
                          className={`flex flex-col gap-0.5 px-3 py-3 rounded-xl transition-colors ${hoverBg}`}
                          style={{ minHeight: 44 } as React.CSSProperties}
                        >
                          <span className="leading-snug" style={{ color: textPrimary, fontSize: '13.5px', fontWeight: 600, letterSpacing: '-0.01em', fontFamily: FONT }}>{sub.title}</span>
                          {sub.description && (
                            <span className="text-xs leading-snug" style={{ color: textMuted, fontFamily: FONT }}>{sub.description}</span>
                          )}
                        </Link>
                        {idx < menu.subMenus!.length - 1 && (
                          <div style={{ height: '1px', background: megaBdr, margin: '1px 12px' }} />
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
              style={{ color: textSecond, fontSize: '13.5px', fontWeight: 500, letterSpacing: '0.01em', fontFamily: FONT, minHeight: 48 }}
            >
              <Search size={15} /> Search
            </Link>
          </div>
        </nav>
      </div>
    </>
  )
}
