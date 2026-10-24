'use client'
// components/admin/Sidebar.tsx — admin navigation as a floating ink card with colour pills
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { ChevronLeft, ChevronRight, FileText, Image as ImageIcon, LayoutDashboard, LayoutGrid, ListTree, LogOut, Settings, X } from 'lucide-react'

const navItems = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard', c: 'var(--sun)', fg: 'var(--on-light)' },
  { href: '/admin/menus', icon: LayoutGrid, label: 'Modules (menus)', c: 'var(--cobalt)', fg: 'var(--on-dark)' },
  { href: '/admin/submenus', icon: ListTree, label: 'Chapters (sub-menus)', c: 'var(--mint)', fg: 'var(--on-light)' },
  { href: '/admin/articles', icon: FileText, label: 'Articles', c: 'var(--tomato)', fg: 'var(--on-dark)' },
  { href: '/admin/media', icon: ImageIcon, label: 'Media', c: 'var(--violet)', fg: 'var(--on-dark)' },
  { href: '/admin/settings', icon: Settings, label: 'Settings', c: 'var(--pink)', fg: 'var(--on-light)' },
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
      <aside className={`p-admin-side${small ? ' is-collapsed' : ''}`} aria-label="Admin navigation">
        <div className="p-admin-side__card">
          <div className="p-admin-side__brand">
            <span className="p-mark__dot" aria-hidden="true" />
            {!small && <b>Applied Agentic</b>}
            {isDrawer && (
              <button type="button" onClick={onMobileClose} className="p-admin-side__btn" style={{ width: 40, marginLeft: 'auto', justifyContent: 'center', padding: 0 }} aria-label="Close menu">
                <X size={18} />
              </button>
            )}
          </div>
          <nav>
            {navItems.map(({ href, icon: Icon, label, c, fg }) => {
              const active = pathname.startsWith(href)
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => onMobileClose?.()}
                  aria-current={active ? 'page' : undefined}
                  title={small ? label : undefined}
                  style={{ '--c': c, '--fg': fg } as React.CSSProperties}
                >
                  {small ? <Icon size={19} /> : <><span className="sw" aria-hidden="true" /><span style={{ flex: 1 }}>{label}</span><Icon size={16} /></>}
                </Link>
              )
            })}
          </nav>
          <div className="p-admin-side__foot">
            {!small && session?.user && (
              <div className="p-admin-side__user">
                <i>{session.user.name?.[0]?.toUpperCase() ?? 'A'}</i>
                <div style={{ minWidth: 0 }}>
                  <b>{session.user.name}</b>
                  <small>{session.user.email}</small>
                </div>
              </div>
            )}
            <button type="button" onClick={() => signOut({ callbackUrl: '/admin/login' })} className="p-admin-side__btn" title={small ? 'Sign out' : undefined}>
              <LogOut size={18} />{!small && 'Sign out'}
            </button>
          </div>
        </div>
        {!isDrawer && (
          <button type="button" onClick={() => setCollapsed((v) => !v)} className="p-admin-side__collapse" aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
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
          <div className="fixed inset-0 z-40 lg:hidden" style={{ background: 'color-mix(in srgb, #0D0D14 55%, transparent)', animation: 'p-fade .2s' }} onClick={onMobileClose} />
          <div className="fixed inset-y-0 left-0 z-50 flex lg:hidden" style={{ animation: 'p-rise .35s var(--ease-out)' }}>{inner(true)}</div>
        </>
      )}
    </>
  )
}
