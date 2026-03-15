'use client'
// components/public/TableOfContents.tsx
import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronDown, List } from 'lucide-react'

// Must stay in sync with SECTION_COLORS in SectionCard.tsx
const TOC_SECTION_COLORS = [
  '#7C3AED',
  '#059669',
  '#D97706',
  '#DB2777',
  '#0891B2',
  '#EA580C',
  '#4F46E5',
  '#BE185D',
]

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
  onSelect?: () => void
}

const toSlug = (text: string) =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

function parseMarkdownHeadings(mdContent: string): Heading[] {
  const headings: Heading[] = []
  let inCodeBlock = false
  for (const line of mdContent.split('\n')) {
    // Toggle fenced code-block state (``` or ~~~, optionally followed by a language tag)
    if (/^(`{3,}|~{3,})/.test(line)) {
      inCodeBlock = !inCodeBlock
      continue
    }
    // Skip everything inside a code block
    if (inCodeBlock) continue
    // Skip blockquote lines — a leading > is not a heading
    if (/^\s*>/.test(line)) continue
    // Skip indented code blocks (4-space or tab indent)
    if (/^(    |\t)/.test(line)) continue
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

  // Track seen IDs globally so that duplicate headings across sections get
  // unique suffixes: "conclusion", "conclusion-2", "conclusion-3" …
  const seenIds = new Map<string, number>()
  const dedupeId = (base: string): string => {
    const count = seenIds.get(base) ?? 0
    seenIds.set(base, count + 1)
    return count === 0 ? base : `${base}-${count + 1}`
  }

  const parsed: Heading[] = []
  for (const section of effectiveSections) {
    // Treat non-empty section titles as H1 entries.
    // Use "section-{dbId}" so it always matches the DOM id set by SectionCard
    // even when two sections share the same title text.
    if (section.title?.trim()) {
      const sectionAnchor = section.id > 0 ? `section-${section.id}` : dedupeId(toSlug(section.title))
      parsed.push({ id: sectionAnchor, text: section.title.trim(), level: 1 })
      // Register the anchor in seenIds so that an identical H2/H3 text inside
      // this section's content doesn't accidentally shadow the H1.
      seenIds.set(sectionAnchor, (seenIds.get(sectionAnchor) ?? 0) + 1)
    }
    for (const h of parseMarkdownHeadings(section.content ?? '')) {
      parsed.push({ ...h, id: dedupeId(h.id) })
    }
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
      // Append index to make key unique even when two H1s share the same text/slug
      const idx = groups.length
      current = { h1: h, children: [], key: `${h.id}-${idx}` }
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

export default function TableOfContents({ sections, content, mobileFlat = false, onSelect }: Props) {
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
    onSelect?.()
  }, [onSelect])

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

  // ── Auto-expand collapsed group when scroll brings a heading into view ────
  useEffect(() => {
    if (!activeId || headings.length === 0) return
    const groups = groupUnderH1(headings)
    for (const group of groups) {
      const containsActive =
        group.h1.id === activeId ||
        group.children.some((h) => h.id === activeId)
      if (containsActive) {
        setCollapsed((prev) => {
          if (!prev.has(group.key)) return prev // already expanded — no re-render
          const next = new Set(prev)
          next.delete(group.key)
          return next
        })
        break
      }
    }
  }, [activeId, headings])

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

  const listEl = (() => {
    // Color index advances ONLY when we hit a real DB‑section group (id="section-N").
    // Markdown H1 groups inside a section inherit the current DB section color.
    let dbColorIdx = -1
    return (
    <nav className="toc-nav" aria-label="Table of contents">
      {groups.map((group) => {
        const isCollapsed = collapsed.has(group.key)
        const hasChildren = group.children.length > 0
        const isH1Active  = activeId === group.h1.id
        const showH1Title = group.h1.id !== '__orphans__' && group.h1.text

        // Advance color only for a new DB section
        if (/^section-\d+$/.test(group.h1.id)) dbColorIdx++
        const colorIdx = Math.max(0, dbColorIdx)
        const sectionColor = showH1Title
          ? TOC_SECTION_COLORS[colorIdx % TOC_SECTION_COLORS.length]
          : undefined

        return (
          <div
            key={group.key}
            className="toc-group"
            style={sectionColor ? { '--toc-h1-color': sectionColor } as React.CSSProperties : undefined}
          >
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
  })()

  return (
    <>
      {/* Desktop: Card sidebar */}
      <div className="toc-card hidden lg:flex flex-col flex-1 min-h-0 rounded-2xl overflow-hidden">
        <div className="toc-card-header">
          <List size={13} style={{ color: 'var(--text-muted)' }} />
          <p className="toc-card-title">Contents</p>
        </div>
        <div ref={desktopScrollRef} className="toc-scroll no-scrollbar">
          {listEl}
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
          <div ref={mobileScrollRef} className="toc-mobile-body">
            {listEl}
          </div>
        </div>
      )}
    </>
  )
}
