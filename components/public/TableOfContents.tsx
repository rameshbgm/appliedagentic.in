'use client'
// components/public/TableOfContents.tsx
import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronRight, List, Zap } from 'lucide-react'

interface Heading {
  id: string
  text: string
  /** 0 = section title, 1 = H1, 2 = H2, 3 = H3 */
  level: number
  isSectionTitle?: boolean
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
      headings.push({ id: toSlug(m[2].trim()), text: m[2].trim(), level: m[1].length })
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
    if (section.title?.trim()) {
      parsed.push({ id: toSlug(section.title), text: section.title.trim(), level: 0, isSectionTitle: true })
    }
    parsed.push(...parseMarkdownHeadings(section.content ?? ''))
  }
  return parsed
}

/** Group headings into collapsible section trees */
interface SectionGroup {
  title: Heading | null
  children: Heading[]
}

function groupIntoSections(headings: Heading[]): SectionGroup[] {
  const groups: SectionGroup[] = []
  let current: SectionGroup = { title: null, children: [] }

  for (const h of headings) {
    if (h.isSectionTitle || h.level === 0) {
      if (current.title || current.children.length > 0) groups.push(current)
      current = { title: h, children: [] }
    } else {
      current.children.push(h)
    }
  }
  if (current.title || current.children.length > 0) groups.push(current)
  return groups
}

export default function TableOfContents({ sections, content, mobileFlat = false }: Props) {
  const [activeId, setActiveId] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [headings, setHeadings] = useState<Heading[]>([])
  // Track which section groups are collapsed (by section title id)
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())

  const desktopScrollRef = useRef<HTMLDivElement>(null)
  const mobileScrollRef  = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setHeadings(parseHeadings(sections, content))
  }, [sections, content])

  // ── Scroll to heading — extra offset to clear sticky section header ─────────
  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id)
    if (!el) return

    const navH = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue('--nav-h')
    ) || 64
    // Extra 56px to clear the sticky section header bar
    const offset = navH + 64
    const top = el.getBoundingClientRect().top + window.scrollY - offset
    window.scrollTo({ top, behavior: 'smooth' })
    setActiveId(id)
    setMobileOpen(false)
  }, [])

  // ── Sync active item into view ─────────────────────────────────────────────
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

  // ── IntersectionObserver ───────────────────────────────────────────────────
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

  const groups = groupIntoSections(headings)

  const toggleCollapse = (id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const renderChildren = (children: Heading[]) => (
    <ul className="toc-children">
      {children.map((h, i) => {
        const isActive = activeId === h.id
        const indent = h.level === 1 ? 'toc-h1' : h.level === 2 ? 'toc-h2' : 'toc-h3'
        return (
          <li key={`${h.id}-${i}`}>
            <button
              type="button"
              data-toc-id={h.id}
              onClick={() => scrollTo(h.id)}
              className={`toc-item ${indent}${isActive ? ' toc-item-active' : ''}`}
            >
              {h.level === 3 && <span className="toc-h3-dot" />}
              <span className="toc-item-text">{h.text}</span>
            </button>
          </li>
        )
      })}
    </ul>
  )

  const listEl = (
    <div className="toc-list">
      {groups.map((group, gi) => {
        const sectionId = group.title?.id ?? `group-${gi}`
        const isCollapsed = collapsed.has(sectionId)
        const hasChildren = group.children.length > 0

        return (
          <div key={sectionId} className="toc-group">
            {group.title && (
              <button
                type="button"
                data-toc-id={group.title.id}
                onClick={() => {
                  if (hasChildren) toggleCollapse(sectionId)
                  scrollTo(group.title!.id)
                }}
                className={`toc-section-btn${activeId === group.title.id ? ' toc-item-active' : ''}`}
              >
                <span className="toc-section-icon">
                  {hasChildren
                    ? isCollapsed
                      ? <ChevronRight size={11} />
                      : <ChevronDown size={11} />
                    : <span className="toc-section-dot" />}
                </span>
                <span className="toc-section-text">{group.title.text}</span>
              </button>
            )}
            {!isCollapsed && hasChildren && renderChildren(group.children)}
          </div>
        )
      })}
    </div>
  )

  return (
    <>
      {/* Desktop: Card sidebar */}
      <div className="toc-card hidden lg:flex flex-col rounded-2xl overflow-hidden">
        <div className="toc-card-header">
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

      {/* Mobile: flat mode */}
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
