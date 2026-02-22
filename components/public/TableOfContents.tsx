'use client'
// components/public/TableOfContents.tsx
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ChevronDown, Zap } from 'lucide-react'

interface Heading {
  id: string
  text: string
  level: number
  num: string // e.g. "1", "1.1", "2"
}

interface Props {
  content: string
}

export default function TableOfContents({ content }: Props) {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeId, setActiveId] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)

  // Refs for the scrollable TOC containers (desktop sidebar + mobile drawer)
  const desktopScrollRef = useRef<HTMLDivElement>(null)
  const mobileScrollRef  = useRef<HTMLDivElement>(null)

  // When the active heading changes, scroll that item into view inside the TOC
  useEffect(() => {
    if (!activeId) return
    const scrollIntoToc = (container: HTMLDivElement | null) => {
      if (!container) return
      const link = container.querySelector<HTMLElement>(`[href="#${CSS.escape(activeId)}"]`)
      if (link) link.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
    scrollIntoToc(desktopScrollRef.current)
    scrollIntoToc(mobileScrollRef.current)
  }, [activeId])

  useEffect(() => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(content, 'text/html')
    const els = doc.querySelectorAll('h2, h3')
    let h2Counter = 0
    let h3Counter = 0
    const parsed: Heading[] = Array.from(els).map((el) => {
      const lvl = Number(el.tagName[1])
      if (lvl === 2) {
        h2Counter++
        h3Counter = 0
        return {
          id: el.textContent?.toLowerCase().replace(/[^a-z0-9]+/g, '-') ?? '',
          text: el.textContent ?? '',
          level: 2,
          num: String(h2Counter),
        }
      } else {
        h3Counter++
        return {
          id: el.textContent?.toLowerCase().replace(/[^a-z0-9]+/g, '-') ?? '',
          text: el.textContent ?? '',
          level: 3,
          num: `${h2Counter}.${h3Counter}`,
        }
      }
    })
    setHeadings(parsed)
  }, [content])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveId(e.target.id)
        })
      },
      { rootMargin: '-80px 0px -65% 0px' }
    )
    headings.forEach((h) => {
      const el = document.getElementById(h.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [headings])

  if (headings.length === 0) return null

  const TocList = () => (
    <ul className="space-y-0.5">
      {headings.map((h) => (
        <li key={h.id}>
          <a
            href={`#${h.id}`}
            onClick={() => setMobileOpen(false)}
            className={`flex items-start gap-2.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
              activeId === h.id ? 'font-semibold' : 'hover:bg-white/5'
            } ${h.level === 3 ? 'ml-4' : ''}`}
            style={{
              color: activeId === h.id ? 'var(--text-primary)' : 'var(--text-secondary)',
              background: activeId === h.id ? 'var(--bg-elevated)' : undefined,
            }}
          >
            <span
              className="shrink-0 mt-0.5 text-[11px] font-mono w-6 text-right leading-5"
              style={{ color: activeId === h.id ? 'var(--green)' : 'var(--text-muted)' }}
            >
              {h.num}
            </span>
            <span className="leading-5">{h.text}</span>
          </a>
        </li>
      ))}
    </ul>
  )

  return (
    <>
      {/* Desktop: Card sidebar */}
      <div
        className="hidden lg:flex flex-col rounded-2xl overflow-hidden"
        style={{ border: '1px solid var(--bg-border)', background: 'var(--bg-surface)' }}
      >
        <div className="px-4 pt-4 pb-3" style={{ borderBottom: '1px solid var(--bg-border)' }}>
          <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
            Table of Contents
          </p>
        </div>
        <div ref={desktopScrollRef} className="py-3 px-1 overflow-y-auto max-h-[calc(100vh-14rem)]">
          <TocList />
        </div>
        {/* CTA button */}
        <div className="px-4 pb-4 pt-2">
          <Link
            href="/modules"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
            style={{ background: 'var(--green)', color: '#000' }}
          >
            <Zap size={13} />
            Explore all Modules
          </Link>
        </div>
      </div>

      {/* Mobile: sticky collapsible TOC */}
      <div className="lg:hidden mb-6">
        <div
          className="sticky top-16 z-30 rounded-2xl overflow-hidden"
          style={{ border: '1px solid var(--bg-border)', background: 'var(--bg-surface)' }}
        >
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="flex items-center justify-between w-full px-4 py-3 text-sm font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            Table of Contents
            <ChevronDown
              size={14}
              className={`transition-transform ${mobileOpen ? 'rotate-180' : ''}`}
              style={{ color: 'var(--text-muted)' }}
            />
          </button>
          {mobileOpen && (
            <div ref={mobileScrollRef} className="pb-3 pt-1 px-1 max-h-[60vh] overflow-y-auto" style={{ borderTop: '1px solid var(--bg-border)' }}>
              <TocList />
            </div>
          )}
        </div>
      </div>
    </>
  )
}
