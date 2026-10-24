'use client'
// components/public/SearchPageClient.tsx — the full timetable search
import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Search, X } from 'lucide-react'
import StopList, { type Stop } from '@/components/transit/StopList'
import { heroContent } from '@/content/home'

interface Props {
  initialQuery: string
}

interface ApiItem {
  id: number
  title: string
  slug: string
  summary: string | null
  readingTimeMinutes: number | null
  articleTags: { tag: { name: string } }[]
}

export default function SearchPageClient({ initialQuery }: Props) {
  const router = useRouter()
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<Stop[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState('')
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const run = useCallback(async (q: string) => {
    const term = q.trim()
    if (!term) { setResults([]); setTotal(0); setSearched(''); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(term)}&limit=30`)
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message ?? 'Search failed')
      const items: ApiItem[] = data?.data?.items ?? []
      setResults(items.map((a) => ({
        id: a.id, slug: a.slug, title: a.title, summary: a.summary, minutes: a.readingTimeMinutes,
        tags: a.articleTags?.map((t) => t.tag.name) ?? [],
      })))
      setTotal(data?.data?.total ?? items.length)
      setSearched(term)
    } catch {
      setError('Search is not responding right now. Try again in a moment.')
    } finally {
      setLoading(false)
    }
  }, [])

  // Run on load and whenever the query changes (debounced), keep the URL in sync
  useEffect(() => {
    const t = setTimeout(() => {
      run(query)
      const url = query.trim() ? `/search?q=${encodeURIComponent(query.trim())}` : '/search'
      router.replace(url, { scroll: false })
    }, query === initialQuery ? 0 : 300)
    return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  useEffect(() => { if (!initialQuery) inputRef.current?.focus() }, [initialQuery])

  return (
    <div style={{ '--c': 'var(--l2)' } as React.CSSProperties}>
      <header className="tr-band tr-band--soft">
        <div className="tr-wrap tr-band__inner">
          <span className="tr-eyebrow">Timetable</span>
          <h1 className="tr-display">Find your stop</h1>
          <form className="tr-search-box" role="search" onSubmit={(e) => { e.preventDefault(); run(query) }} style={{ maxWidth: 720 }}>
            <Search size={20} aria-hidden="true" />
            <label htmlFor="search-page-input" className="sr-only">Search articles</label>
            <input
              id="search-page-input"
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search articles, e.g. RAG, guardrails, voice"
              autoComplete="off"
            />
            {query && (
              <button type="button" className="tr-icon-btn" onClick={() => { setQuery(''); inputRef.current?.focus() }} aria-label="Clear search" style={{ width: 38, height: 38 }}>
                <X size={16} />
              </button>
            )}
            <button type="submit" className="tr-btn tr-btn--primary tr-btn--sm tr-desktop-only">Search</button>
          </form>
        </div>
      </header>

      <div className="tr-wrap tr-wrap--narrow" style={{ paddingBottom: 48 }}>
        {loading && (
          <p className="tr-results-meta" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Loader2 size={14} className="animate-spin" /> Checking the timetable…
          </p>
        )}
        {error && <p className="tr-results-meta" style={{ color: 'var(--danger)' }}>{error}</p>}

        {!loading && !error && searched && (
          <p className="tr-results-meta" aria-live="polite">
            {total === 0 ? `No stops match “${searched}”.` : `${total} ${total === 1 ? 'stop matches' : 'stops match'} “${searched}”`}
          </p>
        )}

        {results.length > 0 && <StopList stops={results} />}

        {!loading && (!searched || total === 0) && (
          <section className="tr-sec" aria-labelledby="suggest-title" style={{ paddingTop: 24 }}>
            <h2 id="suggest-title" className="tr-eyebrow">{searched ? 'Try one of these instead' : 'Popular destinations'}</h2>
            <div className="tr-suggest">
              {heroContent.typewriterTopics.map((t) => (
                <button key={t} type="button" className="tr-chip" onClick={() => setQuery(t)}>{t}</button>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
