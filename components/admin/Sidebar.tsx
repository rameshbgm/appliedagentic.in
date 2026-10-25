'use client'
// components/admin/Sidebar.tsx — the editor's desk
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { BookOpen, ChevronLeft, ChevronRight, FileText, Image as ImageIcon, LayoutDashboard, ListTree, LogOut, Settings, X } from 'lucide-react'

const navItems = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/menus', icon: BookOpen, label: 'Chapters (menus)' },
  { href: '/admin/submenus', icon: ListTree, label: 'Sections (sub-menus)' },
  { href: '/admin/articles', icon: FileText, label: 'Essays' },
  { href: '/admin/media', icon: ImageIcon, label: 'Media' },
  { href: '/admin/settings', icon: Settings, label: 'Settings' },
]

interface Props {
  mobileOpen?: boolean
  onMobileClose?: () => void
}

export default function Sidebar({ mobileOpen = false, onMobileClose }: Props) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [collapsed, setCollapsed] = useState(false)

  const inner = (isDrawer: boolean) => {
    const small = collapsed && !isDrawer
    return (
      <aside className={`adm-side${small ? ' is-collapsed' : ''}`} aria-label="Admin navigation">
        <div className="adm-side__brand">
          <span className="adm-side__mono" aria-hidden="true">A</span>
          {!small && <div><b>Applied Agentic</b><small>Editor&apos;s desk</small></div>}
          {isDrawer && (
            <button type="button" onClick={onMobileClose} className="a-icon" style={{ marginLeft: 'auto' }} aria-label="Close menu"><X size={18} /></button>
          )}
        </div>
        <nav>
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = pathname.startsWith(href)
            return (
              <Link key={href} href={href} onClick={() => onMobileClose?.()} aria-current={active ? 'page' : undefined} title={small ? label : undefined}>
                <Icon size={18} />{!small && <span>{label}</span>}
              </Link>
            )
          })}
        </nav>
        <div className="adm-side__foot">
          {!small && session?.user && (
            <div className="adm-side__user">
              <i>{session.user.name?.[0]?.toUpperCase() ?? 'A'}</i>
              <div style={{ minWidth: 0 }}><b>{session.user.name}</b><small>{session.user.email}</small></div>
            </div>
          )}
          <button type="button" onClick={() => signOut({ callbackUrl: '/admin/login' })} className="adm-side__btn" title={small ? 'Sign out' : undefined}>
            <LogOut size={18} />{!small && 'Sign out'}
          </button>
        </div>
        {!isDrawer && (
          <button type="button" onClick={() => setCollapsed((v) => !v)} className="adm-side__collapse" aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        )}
      </aside>
    )
  }

  return (
    <>
      <div className="hidden lg:flex h-screen sticky top-0">{inner(false)}</div>
      {mobileOpen && (
        <>
          <div className="a-scrim lg:hidden" onClick={onMobileClose} />
          <div className="fixed inset-y-0 left-0 z-[61] flex lg:hidden" style={{ animation: 'a-drawer-in .45s var(--ease)' }}>{inner(true)}</div>
        </>
      )}
    </>
  )
}
