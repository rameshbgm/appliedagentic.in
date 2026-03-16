'use client'
// components/public/Navbar.tsx — 3-column mega-nav: Menu → SubMenu → Articles
import Link from 'next/link'
import { useState, useRef, useCallback, useEffect } from 'react'
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

interface PreviewArticle {
  id: number
  title: string
  slug: string
  summary?: string | null
  coverImage?: { url: string } | null
}

interface Props {
  navMenus?: NavMenuData[]
}

const FONT = "'Space Grotesk', system-ui, sans-serif"

export default function Navbar({ navMenus = [] }: Props) {
  const [mobileOpen, setMobileOpen]             = useState(false)
  const [openMobileMenuId, setOpenMobileMenuId] = useState<number | null>(null)
  const [openMobileSubId, setOpenMobileSubId]   = useState<number | null>(null)
  const [megaOpen, setMegaOpen]               = useState(false)
  const [activeMenuId, setActiveMenuId]       = useState<number | null>(null)
  const [activeSubId, setActiveSubId]         = useState<number | null>(null)
  // Cache: subMenuId → articles
  const [articleCache, setArticleCache]       = useState<Record<number, PreviewArticle[]>>({})
  const [loadingSubId, setLoadingSubId]       = useState<number | null>(null)

  const { theme }       = useTheme()
  const closeTimer      = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isDark          = theme === 'dark'
  const { showLoading } = useArticleLoading()

  const ACCENTS = ['#3b82f6', '#06b6d4', '#8b5cf6', '#f59e0b', '#10b981', '#ec4899']

  const navBg        = isDark ? 'rgba(8,14,30,0.96)'     : 'rgba(255,255,255,0.95)'
  const navBorder    = isDark ? 'rgba(255,255,255,0.07)'  : 'rgba(0,0,0,0.08)'
  const textPrimary  = isDark ? 'rgba(255,255,255,0.92)'  : '#111827'
  const textSecond   = isDark ? 'rgba(255,255,255,0.65)'  : '#374151'
  const textMuted    = isDark ? 'rgba(255,255,255,0.35)'  : '#9CA3AF'
  const hoverBg      = isDark ? 'hover:bg-white/8'        : 'hover:bg-black/5'
  const megaBg       = isDark ? 'rgba(10,18,38,0.99)'     : '#ffffff'
  const megaBdr      = isDark ? 'rgba(255,255,255,0.08)'  : 'rgba(0,0,0,0.08)'
  const activeBg     = isDark ? 'rgba(59,130,246,0.14)'   : 'rgba(59,130,246,0.07)'

  const hasMegaMenus = navMenus.some((m) => m.subMenus && m.subMenus.length > 0)
  const activeMenu   = navMenus.find((m) => m.id === activeMenuId) ?? null
  const activeSub    = activeMenu?.subMenus?.find((s) => s.id === activeSubId) ?? null

  const openMega = useCallback((menuId: number) => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setMegaOpen(true)
    setActiveMenuId(menuId)
    // auto-activate first sub-menu
    const menu = navMenus.find((m) => m.id === menuId)
    const firstSub = menu?.subMenus?.[0]
    if (firstSub) activateSub(firstSub.id)
    else setActiveSubId(null)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navMenus])

  const activateSub = useCallback((subId: number) => {
    setActiveSubId(subId)
    if (articleCache[subId] !== undefined) return // already cached
    setLoadingSubId(subId)
    fetch(`/api/submenus/${subId}/articles`)
      .then((r) => r.json())
      .then((data) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const articles: PreviewArticle[] = (data.data ?? []).map((item: any) => ({
          id: item.article.id,
          title: item.article.title,
          slug: item.article.slug,
          summary: item.article.summary ?? null,
          coverImage: item.article.coverImage ?? null,
        }))
        setArticleCache((prev) => ({ ...prev, [subId]: articles }))
      })
      .catch(() => setArticleCache((prev) => ({ ...prev, [subId]: [] })))
      .finally(() => setLoadingSubId(null))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articleCache])

  // Pre-fetch all sub-menu articles in the background on mount
  useEffect(() => {
    const allSubIds = navMenus.flatMap((m) => m.subMenus?.map((s) => s.id) ?? [])
    allSubIds.forEach((subId, i) => {
      // stagger requests slightly to avoid hammering the server
      setTimeout(() => {
        fetch(`/api/submenus/${subId}/articles`)
          .then((r) => r.json())
          .then((data) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const articles: PreviewArticle[] = (data.data ?? []).map((item: any) => ({
              id: item.article.id,
              title: item.article.title,
              slug: item.article.slug,
              summary: item.article.summary ?? null,
              coverImage: item.article.coverImage ?? null,
            }))
            setArticleCache((prev) => ({ ...prev, [subId]: articles }))
          })
          .catch(() => setArticleCache((prev) => ({ ...prev, [subId]: [] })))
      }, i * 120)
    })
  // run once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const scheduleMegaClose = useCallback(() => {
    closeTimer.current = setTimeout(() => {
      setMegaOpen(false)
      setActiveMenuId(null)
      setActiveSubId(null)
    }, 160)
  }, [])

  const cancelClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
  }, [])

  const closeMega = () => { setMegaOpen(false); setActiveMenuId(null); setActiveSubId(null) }
  const closeMobile = () => { setMobileOpen(false); setOpenMobileMenuId(null); setOpenMobileSubId(null) }

  const articles = activeSubId !== null ? (articleCache[activeSubId] ?? null) : null

  return (
    <>
      {/* ── Top Nav Bar ── */}
      <header
        className="fixed top-0 left-0 right-0 z-40"
        style={{ background: navBg, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderBottom: `1px solid ${navBorder}` }}
      >
        <div className="w-full px-[3%] h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group" onClick={() => { closeMega(); showLoading('/') }}>
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)' }}
            >
              <Zap size={15} className="text-white" />
            </div>
            <span className="text-[15px] tracking-tight" style={{ color: textPrimary, fontFamily: FONT, letterSpacing: '-0.02em' }}>
              <span style={{ fontWeight: 400 }}>Applied</span>
              <span style={{ fontWeight: 800, background: 'linear-gradient(90deg, #3b82f6 0%, #06b6d4 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Agentic</span>
              <span style={{ fontWeight: 300, opacity: 0.55 }}> AI</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-0.5 flex-1 justify-center">
            {navMenus.map((menu) => {
              const hasChildren = menu.subMenus && menu.subMenus.length > 0
              const isActive    = activeMenuId === menu.id && megaOpen
              if (!hasChildren) {
                return (
                  <Link
                    key={menu.id}
                    href={`/${menu.slug}`}
                    onMouseEnter={() => { cancelClose(); closeMega() }}
                    onClick={() => { closeMega(); showLoading(`/${menu.slug}`) }}
                    className={`flex items-center h-9 px-4 rounded-lg transition-all ${hoverBg}`}
                    style={{ color: textSecond, fontSize: '13.5px', fontWeight: 500, fontFamily: FONT }}
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
                  onClick={() => (isActive ? closeMega() : openMega(menu.id))}
                  className={`flex items-center gap-1 h-9 px-4 rounded-lg transition-all ${hoverBg}`}
                  style={{ color: isActive ? '#3b82f6' : textSecond, fontSize: '13.5px', fontWeight: isActive ? 600 : 500, fontFamily: FONT, background: isActive ? activeBg : 'transparent', border: 'none', cursor: 'pointer' }}
                >
                  {menu.title}
                  <ChevronDown size={12} className={`ml-0.5 transition-transform duration-200 ${isActive ? 'rotate-180' : ''}`} />
                </button>
              )
            })}
            <Link
              href="/search"
              onMouseEnter={() => { cancelClose(); closeMega() }}
              onClick={() => { closeMega(); showLoading('/search') }}
              className={`flex items-center gap-1.5 h-9 px-4 rounded-lg transition-all ${hoverBg}`}
              style={{ color: textSecond, fontSize: '13.5px', fontWeight: 500, fontFamily: FONT }}
            >
              <Search size={13} className="opacity-60" /> Search
            </Link>
          </nav>

          {/* Mobile icons */}
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

      {/* ── 3-column Mega-Nav ── */}
      {hasMegaMenus && (
        <div
          className={`hidden lg:flex fixed left-0 right-0 z-30 transition-all duration-200 origin-top ${megaOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'}`}
          style={{ top: 64, background: megaBg, borderBottom: `1px solid ${megaBdr}`, boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.5)' : '0 8px 40px rgba(0,0,0,0.1)' }}
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleMegaClose}
        >
          <div className="w-full flex" style={{ maxHeight: 460 }}>

            {/* ── Col 1: Top-level menus ── */}
            <div
              className="shrink-0 overflow-y-auto mega-col-scroll py-3 flex flex-col"
              style={{ width: 190, borderRight: `1px solid ${megaBdr}` }}
            >
              <div className="flex-1">
                {navMenus.map((menu, i) => {
                  const hasChildren = menu.subMenus && menu.subMenus.length > 0
                  const isActive    = menu.id === activeMenuId
                  const accent      = ACCENTS[i % ACCENTS.length]
                  return (
                    <div
                      key={menu.id}
                      className="flex items-center cursor-pointer transition-all duration-100"
                      style={{ color: isActive ? accent : textSecond }}
                      onMouseEnter={() => {
                        cancelClose()
                        setActiveMenuId(menu.id)
                        const firstSub = menu.subMenus?.[0]
                        if (firstSub) activateSub(firstSub.id)
                        else setActiveSubId(null)
                      }}
                    >
                      <span
                        className="shrink-0 self-stretch transition-all duration-150 rounded-r-sm"
                        style={{ width: 3, background: isActive ? accent : 'transparent', minHeight: 36 }}
                      />
                      <Link
                        href={`/${menu.slug}`}
                        className="flex-1 flex items-center justify-between px-4 py-2.5 text-[13px]"
                        style={{ color: 'inherit', fontFamily: FONT, fontWeight: isActive ? 600 : 500 }}
                        onClick={() => { closeMega(); showLoading(`/${menu.slug}`) }}
                      >
                        <span className="leading-snug">{menu.title}</span>
                        {hasChildren && (
                          <ChevronRight size={12} className="shrink-0 ml-1" style={{ color: isActive ? accent : textMuted, opacity: isActive ? 1 : 0.4 }} />
                        )}
                      </Link>
                    </div>
                  )
                })}
              </div>
              {/* View all link for active menu */}
              {activeMenu && (
                <div className="px-4 py-3 mt-1" style={{ borderTop: `1px solid ${megaBdr}` }}>
                  <Link
                    href={`/${activeMenu.slug}`}
                    onClick={() => { closeMega(); showLoading(`/${activeMenu.slug}`) }}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold transition-all hover:gap-1.5"
                    style={{ color: ACCENTS[navMenus.findIndex(m => m.id === activeMenu.id) % ACCENTS.length], fontFamily: FONT }}
                  >
                    View all <ArrowRight size={10} />
                  </Link>
                </div>
              )}
            </div>

            {/* ── Col 2: Sub-menus (200px) ── */}
            <div
              className="shrink-0 overflow-y-auto mega-col-scroll py-3"
              style={{ width: 210, borderRight: `1px solid ${megaBdr}` }}
            >
              {activeMenu?.subMenus && activeMenu.subMenus.length > 0 ? (
                activeMenu.subMenus.map((sub, i) => {
                  const isActive = sub.id === activeSubId
                  const accent   = ACCENTS[i % ACCENTS.length]
                  return (
                    <div
                      key={sub.id}
                      className="flex items-center cursor-pointer transition-all duration-100"
                      style={{ color: isActive ? accent : textSecond }}
                      onMouseEnter={() => { cancelClose(); activateSub(sub.id) }}
                    >
                      <span
                        className="shrink-0 self-stretch transition-all duration-150 rounded-r-sm"
                        style={{ width: 3, background: isActive ? accent : 'transparent', minHeight: 40 }}
                      />
                      <div className="flex-1 flex items-center justify-between px-4 py-2.5 gap-2 min-w-0">
                        <span className="flex-1 text-[13px] leading-snug truncate" style={{ fontFamily: FONT, fontWeight: isActive ? 600 : 500 }}>
                          {sub.title}
                        </span>
                        <Link
                          href={`/${activeMenu.slug}/${sub.slug}`}
                          onClick={() => { closeMega(); showLoading(`/${activeMenu.slug}/${sub.slug}`) }}
                          className="shrink-0 inline-flex items-center gap-0.5 text-[10px] font-semibold transition-all hover:gap-1 whitespace-nowrap"
                          style={{ color: isActive ? accent : textMuted, fontFamily: FONT, opacity: isActive ? 1 : 0.6 }}
                        >
                          View all <ArrowRight size={9} />
                        </Link>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="flex items-center justify-center h-full" style={{ opacity: 0.3 }}>
                  <p className="text-xs" style={{ color: textMuted, fontFamily: FONT }}>Select a topic</p>
                </div>
              )}
            </div>

            {/* ── Col 3: Articles (flex-1) ── */}
            <div className="flex-1 min-w-0 overflow-y-auto mega-col-scroll py-3 px-4">
              {activeSub ? (
                <>
                  {/* Header */}
                  <div className="flex items-center justify-end mb-3 pb-2 sticky top-0" style={{ background: megaBg, borderBottom: `1px solid ${megaBdr}` }}>
                    <Link
                      href={activeMenu ? `/${activeMenu.slug}/${activeSub.slug}` : '#'}
                      onClick={() => { closeMega(); if (activeMenu) showLoading(`/${activeMenu.slug}/${activeSub.slug}`) }}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold transition-all hover:gap-1.5"
                      style={{ color: ACCENTS[(activeMenu?.subMenus?.findIndex(s => s.id === activeSub.id) ?? 0) % ACCENTS.length], fontFamily: FONT, letterSpacing: '0.04em', textTransform: 'uppercase' }}
                    >
                      View all <ArrowRight size={10} />
                    </Link>
                  </div>

                  {/* Articles grid */}
                  {loadingSubId === activeSubId ? (
                    <div className="flex items-center justify-center py-10" style={{ opacity: 0.4 }}>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" style={{ color: '#3b82f6' }} />
                    </div>
                  ) : articles && articles.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {articles.slice(0, 6).map((article) => (
                        <Link
                          key={article.id}
                          href={`/articles/${article.slug}`}
                          onClick={() => { closeMega(); showLoading(`/articles/${article.slug}`) }}
                          className="group/art rounded-xl px-3 py-2.5 transition-all duration-150"
                          style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', border: `1px solid ${megaBdr}` }}
                          onMouseEnter={(e) => {
                            const el = e.currentTarget as HTMLElement
                            el.style.background = isDark ? 'rgba(59,130,246,0.12)' : 'rgba(59,130,246,0.06)'
                            el.style.borderColor = 'rgba(59,130,246,0.25)'
                          }}
                          onMouseLeave={(e) => {
                            const el = e.currentTarget as HTMLElement
                            el.style.background = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'
                            el.style.borderColor = megaBdr
                          }}
                        >
                          <p className="text-[12.5px] font-semibold leading-snug line-clamp-2 group-hover/art:text-[#3b82f6] transition-colors mb-1" style={{ color: textPrimary, fontFamily: FONT }}>
                            {article.title}
                          </p>
                          {article.summary && (
                            <p className="text-[11px] leading-snug line-clamp-2" style={{ color: textMuted, fontFamily: FONT }}>
                              {article.summary}
                            </p>
                          )}
                        </Link>
                      ))}
                    </div>
                  ) : articles !== null ? (
                    <div className="flex items-center justify-center py-10" style={{ opacity: 0.4 }}>
                      <p className="text-xs" style={{ color: textMuted, fontFamily: FONT }}>No articles yet</p>
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="flex items-center justify-center h-full" style={{ opacity: 0.3 }}>
                  <p className="text-xs" style={{ color: textMuted, fontFamily: FONT }}>Hover a topic to see articles</p>
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
          onClick={closeMega}
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
                    style={{ color: textPrimary, fontSize: '14.5px', fontWeight: 600, fontFamily: FONT }}
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
                  <div className="mt-1 mb-2 space-y-0.5" style={{ borderLeft: '3px solid #3b82f6', marginLeft: 16, paddingLeft: 12 }}>
                    {menu.subMenus!.map((sub) => {
                      const subExpanded = openMobileSubId === sub.id
                      const subArticles = articleCache[sub.id] ?? null
                      return (
                        <div key={sub.id}>
                          {/* Sub-menu row */}
                          <div className="flex items-stretch rounded-xl overflow-hidden" style={{ minHeight: 44 }}>
                            <Link
                              href={`/${menu.slug}/${sub.slug}`}
                              onClick={() => { closeMobile(); showLoading(`/${menu.slug}/${sub.slug}`) }}
                              className={`flex-1 flex flex-col justify-center px-3 py-2.5 transition-colors ${hoverBg}`}
                            >
                              <span className="leading-snug" style={{ color: textPrimary, fontSize: '13.5px', fontWeight: 600, fontFamily: FONT }}>{sub.title}</span>
                              {sub.description && (
                                <span className="text-xs leading-snug mt-0.5" style={{ color: textMuted, fontFamily: FONT }}>{sub.description}</span>
                              )}
                            </Link>
                            <button
                              type="button"
                              className={`flex items-center justify-center px-3 transition-colors ${hoverBg}`}
                              style={{ color: subExpanded ? '#3b82f6' : textMuted, minWidth: 40, WebkitTapHighlightColor: 'transparent' } as React.CSSProperties}
                              aria-label={subExpanded ? 'Collapse articles' : 'Show articles'}
                              onClick={() => {
                                const next = subExpanded ? null : sub.id
                                setOpenMobileSubId(next)
                                if (next !== null) activateSub(next)
                              }}
                            >
                              <ChevronDown
                                size={15}
                                className="transition-transform duration-200"
                                style={{ transform: subExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                              />
                            </button>
                          </div>

                          {/* Articles grid under this sub-menu */}
                          {subExpanded && (
                            <div className="px-2 pt-1 pb-2">
                              {loadingSubId === sub.id ? (
                                <div className="flex justify-center py-4">
                                  <div className="w-4 h-4 border-2 border-[#3b82f6] border-t-transparent rounded-full animate-spin" />
                                </div>
                              ) : subArticles && subArticles.length > 0 ? (
                                <div className="grid grid-cols-2 gap-1.5">
                                  {subArticles.slice(0, 6).map((article) => (
                                    <Link
                                      key={article.id}
                                      href={`/articles/${article.slug}`}
                                      onClick={() => { closeMobile(); showLoading(`/articles/${article.slug}`) }}
                                      className={`rounded-xl px-3 py-2.5 transition-colors ${hoverBg}`}
                                      style={{ border: `1px solid ${megaBdr}` }}
                                    >
                                      <p className="text-[12px] font-semibold leading-snug line-clamp-2" style={{ color: textPrimary, fontFamily: FONT }}>
                                        {article.title}
                                      </p>
                                      {article.summary && (
                                        <p className="text-[11px] leading-snug line-clamp-2 mt-0.5" style={{ color: textMuted, fontFamily: FONT }}>
                                          {article.summary}
                                        </p>
                                      )}
                                    </Link>
                                  ))}
                                </div>
                              ) : subArticles !== null ? (
                                <p className="text-xs text-center py-3" style={{ color: textMuted, fontFamily: FONT }}>No articles yet</p>
                              ) : null}
                              <Link
                                href={`/${menu.slug}/${sub.slug}`}
                                onClick={() => { closeMobile(); showLoading(`/${menu.slug}/${sub.slug}`) }}
                                className="mt-2 flex items-center justify-end gap-1 text-[11px] font-semibold"
                                style={{ color: '#3b82f6', fontFamily: FONT }}
                              >
                                View all <ArrowRight size={10} />
                              </Link>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
          <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${navBorder}` }}>
            <Link
              href="/search"
              onClick={closeMobile}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${hoverBg}`}
              style={{ color: textSecond, fontSize: '13.5px', fontWeight: 500, fontFamily: FONT, minHeight: 48 }}
            >
              <Search size={15} /> Search
            </Link>
          </div>
        </nav>
      </div>
    </>
  )
}
