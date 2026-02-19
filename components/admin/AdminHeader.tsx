'use client'
// components/admin/AdminHeader.tsx
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Bell, Sun, Moon, Plus } from 'lucide-react'
import { useTheme } from '@/components/shared/ThemeProvider'

const breadcrumbMap: Record<string, string[]> = {
  '/admin/dashboard': ['Dashboard'],
  '/admin/modules': ['Modules'],
  '/admin/modules/new': ['Modules', 'New'],
  '/admin/topics': ['Topics'],
  '/admin/topics/new': ['Topics', 'New'],
  '/admin/articles': ['Articles'],
  '/admin/articles/new': ['Articles', 'New'],
  '/admin/media': ['Media'],
  '/admin/settings': ['Settings'],
  '/admin/analytics': ['Analytics'],
}

const quickActions: Record<string, { label: string; href: string }> = {
  '/admin/modules': { label: 'New Module', href: '/admin/modules/new' },
  '/admin/topics': { label: 'New Topic', href: '/admin/topics/new' },
  '/admin/articles': { label: 'New Article', href: '/admin/articles/new' },
}

export default function AdminHeader() {
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()

  const crumbs = breadcrumbMap[pathname] ??
    pathname.replace('/admin/', '').split('/').map((s) => s.charAt(0).toUpperCase() + s.slice(1))
  const action = quickActions[pathname]

  return (
    <header
      className="flex items-center justify-between px-6 py-4 sticky top-0 z-20 border-b"
      style={{ background: 'var(--bg-primary)', borderColor: 'var(--bg-border)' }}
    >
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm" aria-label="breadcrumb">
        <Link href="/admin/dashboard" className="font-display font-semibold" style={{ color: 'var(--color-violet)' }}>
          Admin
        </Link>
        {crumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-2">
            <span style={{ color: 'var(--text-muted)' }}>/</span>
            <span
              className={i === crumbs.length - 1 ? 'font-semibold' : ''}
              style={{ color: i === crumbs.length - 1 ? 'var(--text-primary)' : 'var(--text-secondary)' }}
            >
              {crumb}
            </span>
          </span>
        ))}
      </nav>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {action && (
          <Link
            href={action.href}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-transform hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #6C3DFF, #00D4FF)' }}
          >
            <Plus size={16} />
            {action.label}
          </Link>
        )}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl border transition-colors hover:bg-white/5"
          style={{ borderColor: 'var(--bg-border)', color: 'var(--text-secondary)' }}
          title="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button
          className="p-2 rounded-xl border transition-colors hover:bg-white/5"
          style={{ borderColor: 'var(--bg-border)', color: 'var(--text-secondary)' }}
          title="Notifications"
        >
          <Bell size={18} />
        </button>
      </div>
    </header>
  )
}
