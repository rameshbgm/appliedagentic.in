'use client'
// components/folio/QuickSearch.tsx
// Search dialog: modules and chapters match instantly, essays via /api/search.
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Loader2, Search, X } from 'lucide-react'
import type { ShellLine } from '@/lib/catalog'
import { heroContent } from '@/content/home'

interface Props {
  lines: ShellLine[]
  onClose: () => void
  onSubmit: (q: string) => void
}

interface Hit { key: string; href: string; label: string; meta: string; color: string }
interface ApiArticle { id: number; title: string; slug: string; readingTimeMinutes: number | null }

export default function QuickSearch({ lines, onClose, onSubmit }: Props) {
  const [q, setQ] = useState('')
  const [articles, setArticles] = useState<ApiArticle[]>([])
  const [loading, setLoading] = useState(false)
  const [active, setActive] = useState(0)
  const [navigated, setNavigated] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  useEffect(() => {
    const term = q.trim()
    setActive(0)
    setNavigated(false)
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
    const catalog: Hit[] = []
    for (const l of lines) {
      if (!term || l.title.toLowerCase().includes(term)) catalog.push({ key: `l${l.id}`, href: `/${l.slug}`, label: l.title, meta: 'Module', color: l.color })
      for (const z of l.zones) {
        if (term && z.title.toLowerCase().includes(term)) catalog.push({ key: `z${z.id}`, href: `/${l.slug}/${z.slug}`, label: z.title, meta: 'Chapter', color: l.color })
      }
    }
    const essays: Hit[] = articles.map((a) => ({ key: `a${a.id}`, href: `/articles/${a.slug}`, label: a.title, meta: a.readingTimeMinutes ? `${a.readingTimeMinutes} min` : 'Essay', color: 'var(--accent)' }))
    return [...essays, ...catalog].slice(0, 14)
  }, [q, lines, articles])

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

  return createPortal(
    <>
      <div className="f-scrim" onClick={onClose} />
      <div className="f-dialog-wrap" role="dialog" aria-modal="true" aria-label="Search">
        <div className="f-dialog f-qs">
          <form className="f-qs__box" onSubmit={(e) => { e.preventDefault(); if (q.trim()) onSubmit(q.trim()) }}>
            <Search size={20} aria-hidden="true" />
            <label htmlFor="f-qs-input" className="sr-only">Search essays and modules</label>
            <input id="f-qs-input" ref={inputRef} type="search" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onKeyDown} placeholder="What would you like to read?" autoComplete="off" />
            <button type="button" className="f-icon" onClick={onClose} aria-label="Close search"><X size={18} /></button>
          </form>
          {!q.trim() && (
            <div className="f-qs__tags">
              {heroContent.typewriterTopics.map((t) => <button key={t} type="button" className="f-chip" onClick={() => setQ(t)}>{t}</button>)}
            </div>
          )}
          <ul>
            {hits.map((h, i) => (
              <li key={h.key} style={{ animation: `f-rise .35s var(--ease) both ${i * 25}ms` }}>
                <Link id={`qs-${h.key}`} href={h.href} onClick={onClose} data-active={navigated && i === active} onMouseEnter={() => setActive(i)}>
                  <span className="dot" style={{ '--c': h.color } as React.CSSProperties} />
                  <span className="lbl">{h.label}</span>
                  <small>{h.meta}</small>
                </Link>
              </li>
            ))}
            {loading && <li className="hint" style={{ display: 'flex', gap: 8, alignItems: 'center' }}><Loader2 size={15} className="animate-spin" /> Looking through the shelves…</li>}
            {!loading && q.trim().length >= 2 && hits.length === 0 && <li className="hint">Nothing matches “{q}”. Press Enter to search every essay.</li>}
          </ul>
          {q.trim() && (
            <button type="button" className="f-btn f-btn--ink f-btn--block" style={{ marginTop: 8 }} onClick={() => onSubmit(q.trim())}>
              See all results for “{q.trim()}”
            </button>
          )}
        </div>
      </div>
    </>,
    document.body,
  )
}
