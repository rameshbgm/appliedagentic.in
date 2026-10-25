'use client'
// components/public/SearchPageClient.tsx — the full timetable search
import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Search, X } from 'lucide-react'
import LessonList, { type Lesson } from '@/components/aurora/LessonList'
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
  const [results, setResults] = useState<Lesson[]>([])
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
    <div>
      <header className="a-wrap a-narrow a-opener" style={{ paddingBottom: 10 }}>
        <span className="a-kicker a-kicker--accent">The archive</span>
        <h1 className="a-display">Search the essays</h1>
        <form className="a-searchbox" role="search" onSubmit={(e) => { e.preventDefault(); run(query) }} style={{ width: '100%' }}>
          <Search size={22} aria-hidden="true" />
          <label htmlFor="search-page-input" className="sr-only">Search essays</label>
          <input
            id="search-page-input"
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="RAG, guardrails, voice agents…"
            autoComplete="off"
          />
          {query && (
            <button type="button" className="a-icon" onClick={() => { setQuery(''); inputRef.current?.focus() }} aria-label="Clear search"><X size={18} /></button>
          )}
        </form>
      </header>

      <div className="a-wrap a-narrow" style={{ paddingBottom: 48 }}>
        {loading && <p className="a-results-meta"><Loader2 size={15} className="animate-spin" /> Looking through the shelves…</p>}
        {error && <p className="a-results-meta" style={{ color: 'var(--danger)' }}>{error}</p>}
        {!loading && !error && searched && (
          <p className="a-results-meta" aria-live="polite">
            {total === 0 ? `Nothing matches “${searched}”.` : `${total} ${total === 1 ? 'essay mentions' : 'essays mention'} “${searched}”.`}
          </p>
        )}
        {results.length > 0 && <LessonList lessons={results} />}
        {!loading && (!searched || total === 0) && (
          <section aria-labelledby="suggest-title" style={{ paddingTop: 28 }}>
            <h2 id="suggest-title" className="a-kicker" style={{ margin: '0 0 12px' }}>{searched ? 'Try one of these instead' : 'Readers often look for'}</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {heroContent.typewriterTopics.map((t) => (
                <button key={t} type="button" className="a-chip" onClick={() => setQuery(t)}>{t}</button>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
