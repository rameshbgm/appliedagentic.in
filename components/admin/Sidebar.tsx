'use client'
// components/admin/Sidebar.tsx — admin navigation drawn as a dark line with stops
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { ChevronLeft, ChevronRight, FileText, Image as ImageIcon, LayoutDashboard, ListTree, LogOut, Route, Settings, X, Mail } from 'lucide-react'
import BrandMark from '@/components/transit/BrandMark'
import Modal from '@/components/transit/Modal'

const navItems = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard', c: 'var(--l1)' },
  { href: '/admin/menus', icon: Route, label: 'Lines (menus)', c: 'var(--l2)' },
  { href: '/admin/submenus', icon: ListTree, label: 'Zones (sub-menus)', c: 'var(--l3)' },
  { href: '/admin/articles', icon: FileText, label: 'Articles', c: 'var(--l4)' },
  { href: '/admin/media', icon: ImageIcon, label: 'Media', c: 'var(--l5)' },
  { href: '/admin/subscribers', icon: Mail, label: 'Subscribers', c: 'var(--l7)' },
  { href: '/admin/settings', icon: Settings, label: 'Settings', c: 'var(--l6)' },
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
      <aside className={`tr-admin-side${small ? ' is-collapsed' : ''}`} aria-label="Admin navigation">
        <div className="tr-admin-side__brand">
          <BrandMark size={30} />
          {!small && <div><b>Applied Agentic</b><span>CONTROL ROOM</span></div>}
          {isDrawer && (
            <button type="button" onClick={onMobileClose} className="tr-admin-side__btn" style={{ width: 40, marginLeft: 'auto', justifyContent: 'center', padding: 0 }} aria-label="Close menu">
              <X size={18} />
            </button>
          )}
        </div>

        <nav>
          {navItems.map(({ href, icon: Icon, label, c }) => {
            const active = pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                onClick={() => onMobileClose?.()}
                aria-current={active ? 'page' : undefined}
                title={small ? label : undefined}
                style={{ '--c': c } as React.CSSProperties}
              >
                {small ? <Icon size={18} /> : <><span className="stop" aria-hidden="true" /><span style={{ flex: 1 }}>{label}</span><Icon size={16} /></>}
              </Link>
            )
          })}
        </nav>

        <div className="tr-admin-side__foot">
          {!small && session?.user && (
            <div className="tr-admin-side__user">
              <i>{session.user.name?.[0]?.toUpperCase() ?? 'A'}</i>
              <div style={{ minWidth: 0 }}>
                <b>{session.user.name}</b>
                <small>{session.user.email}</small>
              </div>
            </div>
          )}
          <button type="button" onClick={() => signOut({ callbackUrl: '/login' })} className="tr-admin-side__btn" title={small ? 'Sign out' : undefined}>
            <LogOut size={18} />{!small && 'Sign out'}
          </button>
        </div>

        {!isDrawer && (
          <button type="button" onClick={() => setCollapsed((v) => !v)} className="tr-admin-side__collapse" aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
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
        <Modal label="Admin menu" className="tr-admin tr-admin-drawer" theme="light" onClose={() => onMobileClose?.()}>
          {inner(true)}
        </Modal>
      )}
    </>
  )
}
