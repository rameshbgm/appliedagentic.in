'use client'
// components/admin/AdminHeader.tsx
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Plus, Menu } from 'lucide-react'

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

interface Props {
  onMobileMenuToggle?: () => void
}

export default function AdminHeader({ onMobileMenuToggle }: Props) {
  const pathname = usePathname()

  const crumbs = breadcrumbMap[pathname] ??
    pathname.replace('/admin/', '').split('/').map((s) => s.charAt(0).toUpperCase() + s.slice(1))
  const action = quickActions[pathname]

  return (
    <header
      className="flex items-center justify-between px-4 sm:px-6 py-4 sticky top-0 z-20 border-b bg-white border-gray-200"
    >
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          onClick={onMobileMenuToggle}
          className="p-2 rounded-xl border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm" aria-label="breadcrumb">
          <Link href="/admin/dashboard" className="font-display font-semibold hidden sm:block text-violet-600">
            Admin
          </Link>
          {crumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-2">
              <span className="hidden sm:block text-gray-400">/</span>
              <span
                className={i === crumbs.length - 1 ? 'font-semibold text-gray-900' : 'hidden sm:block text-gray-500'}
              >
                {crumb}
              </span>
            </span>
          ))}
        </nav>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {action && (
          <Link
            href={action.href}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-black font-semibold transition-transform hover:scale-105"
            style={{ background: '#AAFF00' }}
          >
            <Plus size={14} />
            <span className="hidden sm:inline">{action.label}</span>
            <span className="sm:hidden">New</span>
          </Link>
        )}

      </div>
    </header>
  )
}
