'use client'
// components/public/TableOfContents.tsx
import { useEffect, useState } from 'react'

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

  return (
    <aside className="hidden xl:block w-56 flex-shrink-0">
      <nav className="sticky top-24">
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
          On this page
        </p>
        <ul className="space-y-1">
          {headings.map((h) => (
            <li key={h.id}>
              <a
                href={`#${h.id}`}
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
      </nav>
    </aside>
  )
}
