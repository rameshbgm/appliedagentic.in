'use client'
// components/admin/AdminHeader.tsx
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ExternalLink, Menu } from 'lucide-react'

const labels: Record<string, string> = {
  dashboard: 'Dashboard',
  modules: 'Modules',
  topics: 'Topics',
  articles: 'Essays',
  media: 'Media',
  settings: 'Settings',
  analytics: 'Analytics',
  new: 'New',
  edit: 'Edit',
  login: 'Login',
  menus: 'Chapters',
  submenus: 'Sections',
}

interface Props {
  onMobileMenuToggle?: () => void
}

export default function AdminHeader({ onMobileMenuToggle }: Props) {
  const pathname = usePathname()
  const segments = pathname.replace(/^\/admin\/?/, '').split('/').filter(Boolean)
  const crumbs = segments.map((seg, i) => {
    const isNumeric = /^\d+$/.test(seg)
    return {
      label: isNumeric ? `#${seg}` : (labels[seg.toLowerCase()] ?? seg.charAt(0).toUpperCase() + seg.slice(1)),
      href: '/admin/' + segments.slice(0, i + 1).join('/'),
      isLast: i === segments.length - 1,
      isLinked: i !== segments.length - 1 && !isNumeric,
    }
  })

  return (
    <header className="adm-top">
      <button type="button" onClick={onMobileMenuToggle} className="a-icon lg:hidden" aria-label="Open menu">
        <Menu size={18} />
      </button>
      <nav aria-label="Breadcrumb">
        <Link href="/admin/dashboard">Admin</Link>
        {crumbs.map((c) => (
          <span key={c.href} style={{ display: 'inline-flex', gap: 6 }}>
            <span aria-hidden="true">/</span>
            {c.isLast ? <b>{c.label}</b> : c.isLinked ? <Link href={c.href}>{c.label}</Link> : <span>{c.label}</span>}
          </span>
        ))}
      </nav>
      <a href="/" target="_blank" rel="noopener noreferrer" className="a-btn a-btn--quiet a-btn--sm adm-top__site">
        <ExternalLink size={14} /> <span className="hidden sm:inline">View site</span>
      </a>
    </header>
  )
}
