'use client'
// components/pulse/QuickSearch.tsx
// Search dialog: matches lines and zones instantly, articles via /api/search.
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Loader2, Search, X } from 'lucide-react'
import type { ShellLine } from '@/lib/catalog'
import { heroContent } from '@/content/home'

interface Props {
  lines: ShellLine[]
  onClose: () => void
  onSubmit: (q: string) => void
}

interface Hit {
  key: string
  href: string
  label: string
  meta: string
  color: string
  fg: string
  badge: string
}

interface ApiArticle {
  id: number
  title: string
  slug: string
  readingTimeMinutes: number | null
}

export default function QuickSearch({ lines, onClose, onSubmit }: Props) {
  const [q, setQ] = useState('')
  const [articles, setArticles] = useState<ApiArticle[]>([])
  const [loading, setLoading] = useState(false)
  const [active, setActive] = useState(0)
  const [navigated, setNavigated] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  // Debounced article search
  useEffect(() => {
    const term = q.trim()
    if (term.length < 2) { setArticles([]); setLoading(false); return }
    setLoading(true)
    const ctrl = new AbortController()
    const t = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(term)}&limit=8`, { signal: ctrl.signal })
        .then((r) => r.json())
        .then((d) => setArticles(d?.data?.items ?? []))
        .catch(() => {})
        .finally(() => setLoading(false))
    }, 220)
    return () => { clearTimeout(t); ctrl.abort() }
  }, [q])

  const hits = useMemo<Hit[]>(() => {
    const term = q.trim().toLowerCase()
    const lineHits: Hit[] = []
    for (const line of lines) {
      if (!term || line.title.toLowerCase().includes(term)) {
        lineHits.push({ key: `l${line.id}`, href: `/${line.slug}`, label: line.title, meta: 'Module', color: line.color, fg: line.fg, badge: String(line.number) })
      }
      for (const zone of line.zones) {
        if (term && zone.title.toLowerCase().includes(term)) {
          lineHits.push({ key: `z${zone.id}`, href: `/${line.slug}/${zone.slug}`, label: zone.title, meta: `${zone.stops} lessons`, color: line.color, fg: line.fg, badge: String(line.number) })
        }
      }
    }
    const articleHits: Hit[] = articles.map((a) => ({
      key: `a${a.id}`, href: `/articles/${a.slug}`, label: a.title,
      meta: a.readingTimeMinutes ? `${a.readingTimeMinutes} min` : 'Lesson', color: 'var(--ink)', fg: 'var(--bg)', badge: '→',
    }))
    return [...articleHits, ...lineHits].slice(0, 14)
  }, [q, lines, articles])

  useEffect(() => { setActive(0); setNavigated(false) }, [q])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setNavigated(true); setActive((i) => Math.min(hits.length - 1, i + 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setNavigated(true); setActive((i) => Math.max(0, i - 1)) }
    if (e.key === 'Enter') {
      e.preventDefault()
      const hit = hits[active]
      if (hit && (navigated || !q.trim())) document.getElementById(`qs-${hit.key}`)?.click()
      else if (q.trim()) onSubmit(q.trim())
    }
  }

  return (
    <div className="p-overlay p-overlay--top" role="dialog" aria-modal="true" aria-label="Search" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="p-dialog p-qs">
        <form onSubmit={(e) => { e.preventDefault(); if (q.trim()) onSubmit(q.trim()) }} className="p-qs__box">
          <Search size={20} aria-hidden="true" />
          <label htmlFor="p-qs-input" className="sr-only">Search lessons and modules</label>
          <input
            id="p-qs-input"
            ref={inputRef}
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search lessons, e.g. MCP, RAG, voice"
            autoComplete="off"
          />
          <button type="button" className="p-round p-round--sm" onClick={onClose} aria-label="Close search"><X size={16} /></button>
        </form>
        {!q.trim() && (
          <div className="p-qs__tags">
            {heroContent.typewriterTopics.map((t) => (
              <button key={t} type="button" className="p-chip" onClick={() => setQ(t)}>{t}</button>
            ))}
          </div>
        )}
        <ul>
          {hits.map((h, i) => (
            <li key={h.key} style={{ animation: `p-rise .4s var(--ease-out) both ${i * 30}ms` }}>
              <Link id={`qs-${h.key}`} href={h.href} onClick={onClose} data-active={navigated && i === active} onMouseEnter={() => setActive(i)}>
                <span className="dot" style={{ '--c': h.color, '--fg': h.fg } as React.CSSProperties}>{h.badge}</span>
                <span className="lbl">{h.label}</span>
                <small>{h.meta}</small>
              </Link>
            </li>
          ))}
          {loading && (
            <li className="hint" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Loader2 size={15} className="animate-spin" /> Searching the library…
            </li>
          )}
          {!loading && q.trim().length >= 2 && hits.length === 0 && (
            <li className="hint">Nothing matches “{q}”. Press Enter to search every lesson.</li>
          )}
        </ul>
        {q.trim() && (
          <button type="button" className="p-btn p-btn--fill p-btn--block" style={{ marginTop: 10 }} onClick={() => onSubmit(q.trim())}>
            See all results for “{q.trim()}”
          </button>
        )}
      </div>
    </div>
  )
}
