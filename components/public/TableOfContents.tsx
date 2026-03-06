'use client'
// components/public/TableOfContents.tsx
import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ChevronDown, List, Zap } from 'lucide-react'

interface Heading {
  id: string
  text: string
  /** 0 = section title (root), 1 = H1, 2 = H2, 3 = H3 */
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
  /** When true, the mobile version renders flat (no card, no outer margin, no sticky)
   *  – use this when the parent controls the container/sticky */
  mobileFlat?: boolean
}

// Shared slug logic — must match ArticleContent and SectionCard
const toSlug = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

function parseMarkdownHeadings(mdContent: string): Heading[] {
  const headings: Heading[] = []
  const lines = mdContent.split('\n')
  for (const line of lines) {
    const m = line.match(/^(#{1,3})\s+(.+)$/)
    if (m) {
      const level = m[1].length // 1, 2, or 3
      const text = m[2].trim()
      headings.push({ id: toSlug(text), text, level, isSectionTitle: false })
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

export default function TableOfContents({ sections, content, mobileFlat = false }: Props) {
  const [activeId, setActiveId]   = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  // Start empty on both server and client — populated in useEffect (client-only)
  // This prevents the hydration mismatch caused by DOMParser being unavailable on the server.
  const [headings, setHeadings] = useState<Heading[]>([])

  const desktopScrollRef = useRef<HTMLDivElement>(null)
  const mobileScrollRef  = useRef<HTMLDivElement>(null)

  // Populate headings on the client after mount
  useEffect(() => {
    setHeadings(parseHeadings(sections, content))
  }, [sections, content])

  // ── Scroll page to heading ─────────────────────────────────────────────────
  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id)
    if (!el) return

    const navH = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue('--nav-h')
    ) || 64
    const top = el.getBoundingClientRect().top + window.scrollY - navH - 20
    window.scrollTo({ top, behavior: 'smooth' })
    setActiveId(id)
    setMobileOpen(false)
  }, [])

  // ── Sync active TOC item into view when it changes ─────────────────────────
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

  // ── IntersectionObserver — wait for child useEffects to set heading IDs ───
  useEffect(() => {
    if (headings.length === 0) return

    let observer: IntersectionObserver | null = null

    const setup = () => {
      observer?.disconnect()
      observer = new IntersectionObserver(
        (entries) => {
          // Pick topmost visible heading
          const visible = entries
            .filter((e) => e.isIntersecting)
            .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
          if (visible.length > 0) setActiveId(visible[0].target.id)
        },
        { rootMargin: '-72px 0px -60% 0px', threshold: 0 }
      )
      let found = 0
      headings.forEach((h) => {
        const el = document.getElementById(h.id)
        if (el) { observer!.observe(el); found++ }
      })
      return found
    }

    // Retry at increasing intervals — heading IDs are set by ArticleContent useEffect
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

  // ── TOC list (stable; not a nested component) ──────────────────────────────
  const listEl = (
    <ul className="space-y-0.5">
      {headings.map((h, i) => {
        const indent =
          h.level === 0 ? '' :
          h.level === 1 ? 'pl-4' :
          h.level === 2 ? 'pl-8' : 'pl-11'
        const isActive = activeId === h.id
        return (
          <li key={`${h.id}-${i}`}>
            <button
              type="button"
              data-toc-id={h.id}
              onClick={() => scrollTo(h.id)}
              className={`w-full flex items-start gap-2 px-3 py-1.5 text-sm text-left transition-colors ${indent}`}
              style={{
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                background: 'transparent',
              }}
            >
              {h.isSectionTitle && (
                <span className="shrink-0 mt-0.5 text-[11px] font-bold leading-5" style={{ color: 'var(--color-violet, #7C3AED)' }}>
                  §
                </span>
              )}
              <span
                className={`leading-5 ${h.level === 0 ? 'font-semibold' : h.level === 1 ? 'font-medium' : 'text-xs'}`}
                style={isActive ? {
                  textDecoration: 'underline',
                  textDecorationColor: 'rgba(30,41,59,0.25)',
                  textUnderlineOffset: '3px',
                  textDecorationThickness: '1px',
                  fontWeight: 600,
                } : undefined}
              >
                {h.text}
              </span>
            </button>
          </li>
        )
      })}
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
          <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Table of Contents</p>
        </div>
        <div ref={desktopScrollRef} className="py-3 px-1 overflow-y-auto no-scrollbar" style={{ maxHeight: 'calc(100dvh - 14rem)' }}>
          {listEl}
        </div>
        <div className="px-4 pb-4 pt-2">
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

      {/* Mobile: sticky collapsible — standard (with card + sticky) */}
      {!mobileFlat && (
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
              <span className="flex items-center gap-2">
                <List size={14} style={{ color: 'var(--text-muted)' }} />
                Table of Contents
              </span>
              <ChevronDown
                size={14}
                className={`transition-transform ${mobileOpen ? 'rotate-180' : ''}`}
                style={{ color: 'var(--text-muted)' }}
              />
            </button>
            {mobileOpen && (
              <div ref={mobileScrollRef} className="pb-3 pt-1 px-1 max-h-[60vh] overflow-y-auto no-scrollbar" style={{ borderTop: '1px solid var(--bg-border)' }}>
                {listEl}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile: flat mode — parent controls container / toggle */}
      {mobileFlat && (
        <div className="lg:hidden">
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="flex items-center justify-between w-full px-4 py-3 text-sm font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            <span className="flex items-center gap-2">
              <List size={14} style={{ color: 'var(--text-muted)' }} />
              Table of Contents
            </span>
            <ChevronDown
              size={14}
              className={`transition-transform ${mobileOpen ? 'rotate-180' : ''}`}
              style={{ color: 'var(--text-muted)' }}
            />
          </button>
          {mobileOpen && (
            <div ref={mobileScrollRef} className="pb-3 pt-1 px-1 max-h-[50vh] overflow-y-auto" style={{ borderTop: '1px solid var(--bg-border)' }}>
              {listEl}
            </div>
          )}
        </div>
      )}
    </>
  )
}
