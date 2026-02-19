'use client'
// components/admin/Sidebar.tsx
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { signOut, useSession } from 'next-auth/react'
import {
  LayoutDashboard,
  BookOpen,
  Layers,
  FileText,
  Image as ImageIcon,
  Settings,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Zap,
  X,
} from 'lucide-react'

const navItems = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/modules', icon: Layers, label: 'Modules' },
  { href: '/admin/topics', icon: BookOpen, label: 'Topics' },
  { href: '/admin/articles', icon: FileText, label: 'Articles' },
  { href: '/admin/media', icon: ImageIcon, label: 'Media' },
  { href: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
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

  const handleLinkClick = () => {
    onMobileClose?.()
  }

  const SidebarInner = () => (
    <aside
      className={`flex flex-col h-full border-r transition-all duration-300 ${
        collapsed ? 'w-[68px]' : 'w-[240px]'
      }`}
      style={{ background: 'var(--bg-elevated)', borderColor: 'var(--bg-border)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b" style={{ borderColor: 'var(--bg-border)' }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #6C3DFF, #00D4FF)' }}>
          <Zap size={18} className="text-white" />
        </div>
        {!collapsed && (
          <span className="font-display font-bold text-sm leading-tight" style={{ color: 'var(--text-primary)' }}>
            Applied<br />Agentic
          </span>
        )}
        {onMobileClose && !collapsed && (
          <button
            onClick={onMobileClose}
            className="ml-auto p-1 rounded-lg hover:bg-white/10 lg:hidden"
            style={{ color: 'var(--text-muted)' }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              onClick={handleLinkClick}
              className={`admin-sidebar-link flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active ? 'active' : ''
              }`}
              title={collapsed ? label : undefined}
            >
              <Icon size={18} className="flex-shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* User + Logout */}
      <div className="p-3 border-t" style={{ borderColor: 'var(--bg-border)' }}>
        {!collapsed && session?.user && (
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #6C3DFF, #00D4FF)' }}>
              {session.user.name?.[0]?.toUpperCase() ?? 'A'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                {session.user.name}
              </p>
              <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                {session.user.email}
              </p>
            </div>
          </div>
        )}
        <button
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          className="admin-sidebar-link flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium w-full transition-all"
          title={collapsed ? 'Logout' : undefined}
          style={{ color: 'var(--text-muted)' }}
        >
          <LogOut size={18} className="flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      {/* Collapse toggle — desktop only */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="absolute top-1/2 -right-3 z-10 w-6 h-6 rounded-full hidden lg:flex items-center justify-center shadow-lg"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--bg-border)' }}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex relative h-screen sticky top-0">
        <SidebarInner />
      </div>

      {/* Mobile sidebar drawer */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            onClick={onMobileClose}
          />
          <div className="fixed inset-y-0 left-0 z-50 flex lg:hidden">
            <SidebarInner />
          </div>
        </>
      )}
    </>
  )
}
