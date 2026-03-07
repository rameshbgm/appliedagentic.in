'use client'
// components/public/TableOfContents.tsx
import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronDown, List, Zap } from 'lucide-react'
import Link from 'next/link'

interface Heading {
  id: string
  text: string
  /** 1 = H1, 2 = H2, 3 = H3 */
  level: 1 | 2 | 3
}

interface SectionLike {
  id: number
  title: string
  content: string
  order: number
}

interface Props {
  sections?: SectionLike[]
  content?: string
  mobileFlat?: boolean
}

const toSlug = (text: string) =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

function parseMarkdownHeadings(mdContent: string): Heading[] {
  const headings: Heading[] = []
  for (const line of mdContent.split('\n')) {
    const m = line.match(/^(#{1,3})\s+(.+)$/)
    if (m) {
      headings.push({
        id: toSlug(m[2].trim()),
        text: m[2].trim(),
        level: m[1].length as 1 | 2 | 3,
      })
    }
  }
  return headings
}

function parseHeadings(sections?: SectionLike[], content?: string): Heading[] {
  const effectiveSections: SectionLike[] =
    sections && sections.length > 0
      ? sections
      : content
      ? [{ id: 0, title: '', content, order: 0 }]
      : []

  const parsed: Heading[] = []
  for (const section of effectiveSections) {
    // Treat non-empty section titles as H1 entries
    if (section.title?.trim()) {
      parsed.push({ id: toSlug(section.title), text: section.title.trim(), level: 1 })
    }
    parsed.push(...parseMarkdownHeadings(section.content ?? ''))
  }
  return parsed
}

/** Group H2/H3 under their nearest H1 parent for collapsible trees */
interface HeadingGroup {
  h1: Heading
  children: Heading[]
  /** id used as collapse key */
  key: string
}

function groupUnderH1(headings: Heading[]): HeadingGroup[] {
  const groups: HeadingGroup[] = []
  let current: HeadingGroup | null = null

  for (const h of headings) {
    if (h.level === 1) {
      if (current) groups.push(current)
      current = { h1: h, children: [], key: h.id }
    } else if (current) {
      current.children.push(h)
    } else {
      // H2/H3 before any H1 — create an implicit group with no title
      // (rare; just show them ungrouped at top)
      if (!groups.find((g) => g.key === '__orphans__')) {
        groups.push({ h1: { id: '__orphans__', text: '', level: 1 }, children: [], key: '__orphans__' })
      }
      groups[groups.findIndex((g) => g.key === '__orphans__')].children.push(h)
    }
  }
  if (current) groups.push(current)
  return groups
}

export default function TableOfContents({ sections, content, mobileFlat = false }: Props) {
  const [activeId, setActiveId] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [headings, setHeadings] = useState<Heading[]>([])
  // Collapsed state: set of H1 keys that are collapsed
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())

  const desktopScrollRef = useRef<HTMLDivElement>(null)
  const mobileScrollRef  = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setHeadings(parseHeadings(sections, content))
  }, [sections, content])

  // ── Scroll to heading — extra offset to clear the sticky section header ───
  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id)
    if (!el) return

    const navH = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue('--nav-h')
    ) || 64
    // 72px extra: 40px sticky section header + 32px breathing room
    const offset = navH + 72
    const top = el.getBoundingClientRect().top + window.scrollY - offset
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
    setActiveId(id)
    setMobileOpen(false)
  }, [])

  // ── Sync active item into view inside the TOC scroll container ────────────
  useEffect(() => {
    if (!activeId) return
    const sync = (container: HTMLDivElement | null) => {
      if (!container) return
      const btn = container.querySelector<HTMLElement>(`[data-toc-id="${CSS.escape(activeId)}"]`)
      btn?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
    sync(desktopScrollRef.current)
    sync(mobileScrollRef.current)
  }, [activeId])

  // ── IntersectionObserver to track active heading ─────────────────────────
  useEffect(() => {
    if (headings.length === 0) return
    let observer: IntersectionObserver | null = null

    const setup = () => {
      observer?.disconnect()
      observer = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((e) => e.isIntersecting)
            .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
          if (visible.length > 0) setActiveId(visible[0].target.id)
        },
        { rootMargin: '-80px 0px -55% 0px', threshold: 0 }
      )
      let found = 0
      headings.forEach((h) => {
        const el = document.getElementById(h.id)
        if (el) { observer!.observe(el); found++ }
      })
      return found
    }

    const found = setup()
    const timers: ReturnType<typeof setTimeout>[] = []
    if (found < headings.length) {
      timers.push(setTimeout(setup, 150))
      timers.push(setTimeout(setup, 500))
      timers.push(setTimeout(setup, 1200))
      timers.push(setTimeout(setup, 2500))
    }
    return () => { timers.forEach(clearTimeout); observer?.disconnect() }
  }, [headings])

  if (headings.length === 0) return null

  const groups = groupUnderH1(headings)

  const toggleCollapse = (key: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const listEl = (
    <nav className="toc-nav" aria-label="Table of contents">
      {groups.map((group) => {
        const isCollapsed = collapsed.has(group.key)
        const hasChildren = group.children.length > 0
        const isH1Active  = activeId === group.h1.id
        const showH1Title = group.h1.id !== '__orphans__' && group.h1.text

        return (
          <div key={group.key} className="toc-group">
            {/* H1 row */}
            {showH1Title && (
              <div className="toc-h1-row">
                <button
                  type="button"
                  data-toc-id={group.h1.id}
                  onClick={() => scrollTo(group.h1.id)}
                  className={`toc-h1-label${isH1Active ? ' toc-active' : ''}`}
                >
                  {group.h1.text}
                </button>
                {hasChildren && (
                  <button
                    type="button"
                    onClick={() => toggleCollapse(group.key)}
                    className="toc-collapse-btn"
                    aria-label={isCollapsed ? 'Expand section' : 'Collapse section'}
                  >
                    <ChevronDown
                      size={12}
                      className={`toc-chevron${isCollapsed ? ' toc-chevron-collapsed' : ''}`}
                    />
                  </button>
                )}
              </div>
            )}

            {/* H2 / H3 children */}
            {!isCollapsed && hasChildren && (
              <ul className="toc-children">
                {group.children.map((h, i) => {
                  const isActive = activeId === h.id
                  return (
                    <li key={`${h.id}-${i}`}>
                      <button
                        type="button"
                        data-toc-id={h.id}
                        onClick={() => scrollTo(h.id)}
                        className={`toc-child-btn toc-level-${h.level}${isActive ? ' toc-active' : ''}`}
                      >
                        {h.level === 3 && <span className="toc-h3-marker" />}
                        <span className="toc-child-text">{h.text}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        )
      })}
    </nav>
  )

  return (
    <>
      {/* Desktop: Card sidebar */}
      <div className="toc-card hidden lg:flex flex-col rounded-2xl overflow-hidden">
        <div className="toc-card-header">
          <List size={13} style={{ color: 'var(--text-muted)' }} />
          <p className="toc-card-title">Contents</p>
        </div>
        <div ref={desktopScrollRef} className="toc-scroll no-scrollbar">
          {listEl}
        </div>
        <div className="toc-card-footer">
          <Link
            href="/modules"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
            style={{ background: 'var(--green)', color: '#fff' }}
          >
            <Zap size={13} />
            Explore all Modules
          </Link>
        </div>
      </div>

      {/* Mobile: sticky collapsible */}
      {!mobileFlat && (
        <div className="lg:hidden mb-4">
          <div className="toc-mobile-card sticky z-30" style={{ top: 'var(--nav-h, 64px)' }}>
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="toc-mobile-toggle"
            >
              <span className="flex items-center gap-2">
                <List size={13} style={{ color: 'var(--text-muted)' }} />
                Contents
              </span>
              <ChevronDown
                size={13}
                className={`transition-transform duration-200 ${mobileOpen ? 'rotate-180' : ''}`}
                style={{ color: 'var(--text-muted)' }}
              />
            </button>
            {mobileOpen && (
              <div ref={mobileScrollRef} className="toc-mobile-body">
                {listEl}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile: flat mode (inside slide-in panel) */}
      {mobileFlat && (
        <div className="lg:hidden">
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="toc-mobile-toggle"
          >
            <span className="flex items-center gap-2">
              <List size={13} style={{ color: 'var(--text-muted)' }} />
              Contents
            </span>
            <ChevronDown
              size={13}
              className={`transition-transform duration-200 ${mobileOpen ? 'rotate-180' : ''}`}
              style={{ color: 'var(--text-muted)' }}
            />
          </button>
          {mobileOpen && (
            <div ref={mobileScrollRef} className="toc-mobile-body">
              {listEl}
            </div>
          )}
        </div>
      )}
    </>
  )
}
