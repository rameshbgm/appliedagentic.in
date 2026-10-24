'use client'
// components/transit/QuickSearch.tsx
// Search dialog: matches lines and zones instantly, articles via /api/search.
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'
import type { ShellLine } from '@/lib/transit'

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
        lineHits.push({ key: `l${line.id}`, href: `/${line.slug}`, label: line.title, meta: `${line.zones.length} zones`, color: line.color, badge: String(line.number) })
      }
      for (const zone of line.zones) {
        if (term && zone.title.toLowerCase().includes(term)) {
          lineHits.push({ key: `z${zone.id}`, href: `/${line.slug}/${zone.slug}`, label: zone.title, meta: `${zone.stops} stops`, color: line.color, badge: String(line.number) })
        }
      }
    }
    const articleHits: Hit[] = articles.map((a) => ({
      key: `a${a.id}`, href: `/articles/${a.slug}`, label: a.title,
      meta: a.readingTimeMinutes ? `${a.readingTimeMinutes} min` : 'article', color: 'var(--ink)', badge: '●',
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
    <div className="tr-overlay tr-overlay--top" role="dialog" aria-modal="true" aria-label="Search" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="tr-dialog tr-qs">
        <form onSubmit={(e) => { e.preventDefault(); if (q.trim()) onSubmit(q.trim()) }}>
          <label htmlFor="tr-qs-input" className="sr-only">Search articles, lines and zones</label>
          <input
            id="tr-qs-input"
            ref={inputRef}
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search stops, e.g. MCP, RAG, voice agents"
            autoComplete="off"
          />
        </form>
        <ul>
          {hits.map((h, i) => (
            <li key={h.key}>
              <Link id={`qs-${h.key}`} href={h.href} onClick={onClose} data-active={navigated && i === active} onMouseEnter={() => setActive(i)}>
                <span className="tr-roundel" style={{ '--c': h.color, '--s': '22px' } as React.CSSProperties}>{h.badge}</span>
                <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.label}</span>
                <small>{h.meta}</small>
              </Link>
            </li>
          ))}
          {loading && (
            <li className="hint" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Loader2 size={14} className="animate-spin" /> Checking the timetable…
            </li>
          )}
          {!loading && q.trim().length >= 2 && hits.length === 0 && (
            <li className="hint">No stops match “{q}”. Press Enter to search the full archive.</li>
          )}
        </ul>
        {q.trim() && (
          <button type="button" className="tr-btn tr-btn--primary tr-btn--block" style={{ marginTop: 10 }} onClick={() => onSubmit(q.trim())}>
            See all results for “{q.trim()}”
          </button>
        )}
      </div>
    </div>
  )
}
