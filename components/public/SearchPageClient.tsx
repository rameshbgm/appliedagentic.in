'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Search, X } from 'lucide-react'
import StopList, { type Stop } from '@/components/transit/StopList'
import { heroContent } from '@/content/home'

interface Props { initialQuery: string; initialPage?: number; showArticleImages?: boolean }
interface ApiItem {
  id: number; title: string; slug: string; summary: string | null
  readingTimeMinutes: number | null; publishedAt: string | null
  coverImage?: { url: string } | null
  articleTags: { tag: { name: string } }[]
}
const LIMIT = 20

export default function SearchPageClient({ initialQuery, initialPage = 1, showArticleImages = true }: Props) {
  const router = useRouter()
  const [query, setQuery] = useState(initialQuery)
  const [page, setPage] = useState(initialPage)
  const [results, setResults] = useState<Stop[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(Boolean(initialQuery))
  const [searched, setSearched] = useState('')
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // Back/Forward and searches from the header can reuse this component.
  useEffect(() => { setQuery(initialQuery); setPage(initialPage) }, [initialQuery, initialPage])

  useEffect(() => {
    const term = query.trim()
    const ctrl = new AbortController()
    if (!term) {
      setResults([]); setTotal(0); setSearched(''); setError(''); setLoading(false)
      return () => ctrl.abort()
    }
    setLoading(true)
    setError('')
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}&limit=${LIMIT}&page=${page}`, { signal: ctrl.signal })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Search could not load. Please try again.')
        if (ctrl.signal.aborted) return
        const items: ApiItem[] = data.data.items
        setResults(items.map((a) => ({
          id: a.id, slug: a.slug, title: a.title, summary: a.summary, minutes: a.readingTimeMinutes,
          publishedAt: a.publishedAt, imageUrl: a.coverImage?.url, tags: a.articleTags.map((t) => t.tag.name),
        })))
        setTotal(data.data.total)
        setSearched(term)
      } catch (err) {
        if (!ctrl.signal.aborted) { setResults([]); setError(err instanceof Error ? err.message : 'Search could not connect. Please try again.') }
      } finally { if (!ctrl.signal.aborted) setLoading(false) }
    }, term === initialQuery ? 0 : 300)
    return () => { clearTimeout(timer); ctrl.abort() }
  }, [query, page, initialQuery, retry])

  const navigate = (term: string, nextPage = 1, replace = false) => {
    const params = new URLSearchParams()
    if (term.trim()) params.set('q', term.trim())
    if (nextPage > 1) params.set('page', String(nextPage))
    const url = `/search${params.size ? `?${params}` : ''}`
    if (replace) router.replace(url, { scroll: false })
    else router.push(url, { scroll: false })
  }

  useEffect(() => {
    if (query.trim() === initialQuery && page === initialPage) return
    const timer = setTimeout(() => navigate(query, page, true), 350)
    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, page])

  useEffect(() => { if (!initialQuery) inputRef.current?.focus() }, [initialQuery])
  const pages = Math.ceil(total / LIMIT)

  return <div style={{ '--c': 'var(--l2)' } as React.CSSProperties}>
    <header className="tr-band tr-band--soft"><div className="tr-wrap tr-band__inner">
      <h1 className="tr-display">Find your stop</h1>
      <form className="tr-search-box" role="search" onSubmit={(e) => { e.preventDefault(); navigate(query); setRetry((v) => v + 1) }} style={{ maxWidth: 720 }}>
        <Search size={20} aria-hidden="true" />
        <label htmlFor="search-page-input" className="sr-only">Search articles</label>
        <input id="search-page-input" ref={inputRef} type="search" maxLength={200} value={query} onChange={(e) => { setQuery(e.target.value); setPage(1) }} placeholder="Search articles, e.g. RAG, guardrails, voice" autoComplete="off" />
        {query && <button type="button" className="tr-icon-btn" onClick={() => { setQuery(''); setPage(1); navigate(''); inputRef.current?.focus() }} aria-label="Clear search"><X size={16} /></button>}
        <button type="submit" className="tr-btn tr-btn--primary tr-btn--sm tr-desktop-only">Search</button>
      </form>
    </div></header>
    <div className="tr-wrap tr-wrap--narrow" style={{ paddingBottom: 48 }} aria-busy={loading}>
      {loading && <p className="tr-results-meta" role="status"><Loader2 size={14} className="animate-spin inline" /> Searching articles…</p>}
      {error && <div className="tr-results-meta" role="alert"><p>{error}</p><button type="button" className="tr-btn tr-btn--sm" onClick={() => setRetry((v) => v + 1)}>Retry search</button></div>}
      {!loading && !error && searched && <p className="tr-results-meta" aria-live="polite">{total === 0 ? `No stops match “${searched}”.` : `${total} ${total === 1 ? 'stop matches' : 'stops match'} “${searched}”`}</p>}
      {!loading && !error && results.length > 0 && <StopList stops={results} showThumbs={showArticleImages} showRouteMarkers={false} />}
      {!loading && !error && pages > 1 && <nav aria-label="Search result pages" className="flex items-center justify-between gap-3 py-6">
        <button type="button" className="tr-btn tr-btn--sm" disabled={page <= 1} onClick={() => { setPage(page - 1); navigate(query, page - 1) }}>Previous</button>
        <span>Page {page} of {pages}</span>
        <button type="button" className="tr-btn tr-btn--sm" disabled={page >= pages} onClick={() => { setPage(page + 1); navigate(query, page + 1) }}>Next</button>
      </nav>}
      {!loading && !error && (!searched || total === 0) && <section className="tr-sec" aria-labelledby="suggest-title" style={{ paddingTop: 24 }}>
        <h2 id="suggest-title">{searched ? 'Try one of these instead' : 'Popular destinations'}</h2>
        <div className="tr-suggest">{heroContent.typewriterTopics.map((t) => <button key={t} type="button" className="tr-chip" onClick={() => { setQuery(t); setPage(1); navigate(t) }}>{t}</button>)}</div>
      </section>}
    </div>
  </div>
}
