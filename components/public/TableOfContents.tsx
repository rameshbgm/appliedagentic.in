'use client'
// components/public/TableOfContents.tsx
import { useEffect, useState } from 'react'
import { List, ChevronDown } from 'lucide-react'

interface Heading {
  id: string
  text: string
  level: number
}

interface Props {
  content: string
}

export default function TableOfContents({ content }: Props) {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeId, setActiveId] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(content, 'text/html')
    const els = doc.querySelectorAll('h2, h3')
    const parsed: Heading[] = Array.from(els).map((el) => ({
      id: el.textContent?.toLowerCase().replace(/[^a-z0-9]+/g, '-') ?? '',
      text: el.textContent ?? '',
      level: Number(el.tagName[1]),
    }))
    setHeadings(parsed)
  }, [content])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveId(e.target.id)
        })
      },
      { rootMargin: '-80px 0px -70% 0px' }
    )
    headings.forEach((h) => {
      const el = document.getElementById(h.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [headings])

  if (headings.length === 0) return null

  const TocList = () => (
    <ul className="space-y-1">
      {headings.map((h) => (
        <li key={h.id}>
          <a
            href={`#${h.id}`}
            onClick={() => setMobileOpen(false)}
            className={`block text-xs py-1 transition-colors border-l-2 pl-3 ${
              activeId === h.id ? 'border-violet-500' : 'border-transparent'
            } ${h.level === 3 ? 'pl-6' : ''}`}
            style={{
              color: activeId === h.id ? '#A29BFE' : 'var(--text-muted)',
            }}
          >
            {h.text}
          </a>
        </li>
      ))}
    </ul>
  )

  return (
    <>
      {/* Desktop: Sidebar */}
      <div className="hidden lg:block">
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
          On this page
        </p>
        <TocList />
      </div>

      {/* Mobile: Collapsible panel */}
      <div className="lg:hidden mb-6 rounded-2xl overflow-hidden" style={{ border: '1px solid var(--bg-border)', background: 'var(--bg-surface)' }}>
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="flex items-center justify-between w-full px-4 py-3 text-sm font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          <span className="flex items-center gap-2">
            <List size={14} style={{ color: 'var(--text-muted)' }} />
            Table of Contents
          </span>
          <ChevronDown size={14} className={`transition-transform ${mobileOpen ? 'rotate-180' : ''}`} style={{ color: 'var(--text-muted)' }} />
        </button>
        {mobileOpen && (
          <div className="px-4 pb-4 pt-1" style={{ borderTop: '1px solid var(--bg-border)' }}>
            <TocList />
          </div>
        )}
      </div>
    </>
  )
}
