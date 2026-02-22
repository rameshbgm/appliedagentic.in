'use client'
// components/public/TableOfContents.tsx
import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ChevronDown, Zap } from 'lucide-react'

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
}

// Shared slug logic — must match ArticleContent and SectionCard
const toSlug = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

function parseHeadings(sections?: SectionLike[], content?: string): Heading[] {
  const effectiveSections: SectionLike[] =
    sections && sections.length > 0
      ? sections
      : content
      ? [{ id: 0, title: '', content, order: 0 }]
      : []

  const parsed: Heading[] = []
  // DOMParser is only available in browsers; called only from useEffect
  const parser = new DOMParser()

  for (const section of effectiveSections) {
    if (section.title?.trim()) {
      parsed.push({ id: toSlug(section.title), text: section.title.trim(), level: 0, isSectionTitle: true })
    }
    const doc = parser.parseFromString(section.content ?? '', 'text/html')
    doc.querySelectorAll('h1, h2, h3').forEach((el) => {
      const text = el.textContent?.trim() ?? ''
      if (!text) return
      parsed.push({ id: toSlug(text), text, level: Number(el.tagName[1]), isSectionTitle: false })
    })
  }
  return parsed
}

export default function TableOfContents({ sections, content }: Props) {
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

    // Force-reveal the parent section card so its CSS transform is cleared
    // before we measure position. Without this, getBoundingClientRect() returns
    // the visually-displaced (transformed) position, causing the scroll to land ~28px off.
    const card = el.closest('.section-optional')
    if (card) card.classList.add('section-visible')

    // Also clear any reveal-hidden on the element itself
    el.classList.remove('reveal-hidden')
    el.classList.add('reveal-visible')
    el.style.transitionDelay = ''

    // Double rAF: first frame schedules a layout recalc,
    // second frame reads the updated getBoundingClientRect
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const navH = parseFloat(
          getComputedStyle(document.documentElement).getPropertyValue('--nav-h')
        ) || 64
        const top = el.getBoundingClientRect().top + window.scrollY - navH - 16
        window.scrollTo({ top, behavior: 'smooth' })
        setActiveId(id)
        setMobileOpen(false)
      })
    })
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
              className={`w-full flex items-start gap-2 px-3 py-1.5 rounded-lg text-sm text-left transition-all ${indent} ${
                isActive ? 'font-semibold' : 'hover:bg-white/5'
              }`}
              style={{
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                background: isActive ? 'var(--bg-elevated)' : undefined,
              }}
            >
              {h.isSectionTitle && (
                <span className="shrink-0 mt-0.5 text-[11px] font-bold leading-5" style={{ color: 'var(--color-violet, #7C3AED)' }}>
                  §
                </span>
              )}
              <span className={`leading-5 ${h.level === 0 ? 'font-semibold' : h.level === 1 ? 'font-medium' : 'text-xs'}`}>
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
        <div ref={desktopScrollRef} className="py-3 px-1 overflow-y-auto" style={{ maxHeight: 'calc(100dvh - 14rem)' }}>
          {listEl}
        </div>
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

      {/* Mobile: sticky collapsible */}
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
              {listEl}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
