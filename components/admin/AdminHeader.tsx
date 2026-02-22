'use client'
// components/admin/AdminHeader.tsx
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Menu } from 'lucide-react'

const breadcrumbMap: Record<string, string> = {
  'dashboard':  'Dashboard',
  'modules':    'Modules',
  'topics':     'Topics',
  'articles':   'Articles',
  'media':      'Media',
  'settings':   'Settings',
  'analytics':  'Analytics',
  'new':        'New',
  'edit':       'Edit',
  'login':      'Login',
  'menus':      'Menus',
  'submenus':   'Sub Menus',
}

interface Props {
  onMobileMenuToggle?: () => void
}

export default function AdminHeader({ onMobileMenuToggle }: Props) {
  const pathname = usePathname()

  // Build crumbs from path segments after /admin
  const segments = pathname.replace(/^\/admin\/?/, '').split('/').filter(Boolean)
  const crumbs = segments.map((seg, i) => {
    const isNumeric = /^\d+$/.test(seg)
    const label = isNumeric ? `#${seg}` : (breadcrumbMap[seg.toLowerCase()] ?? (seg.charAt(0).toUpperCase() + seg.slice(1)))
    const href = '/admin/' + segments.slice(0, i + 1).join('/')
    const isLast = i === segments.length - 1
    // Don't link numeric IDs — those are intermediate paths that have no page
    const isLinked = !isLast && !isNumeric
    return { label, href, isLast, isLinked }
  })

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
          {crumbs.map((crumb) => (
            <span key={crumb.href} className="flex items-center gap-2">
              <span className="hidden sm:block text-gray-400">/</span>
              {crumb.isLast ? (
                <span className="font-semibold text-gray-900">{crumb.label}</span>
              ) : crumb.isLinked ? (
                <Link
                  href={crumb.href}
                  className="hidden sm:block text-gray-500 hover:text-violet-600 transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="hidden sm:block text-gray-400">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      </div>
    </header>
  )
}
