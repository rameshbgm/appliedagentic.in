'use client'
// components/public/SearchPageClient.tsx — the full timetable search
import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Search, X } from 'lucide-react'
import LessonList, { type Lesson } from '@/components/pulse/LessonList'
import { heroContent } from '@/content/home'
import { swatch } from '@/lib/catalog'

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
    <div style={{ '--c': 'var(--violet)', '--fg': 'var(--on-dark)' } as React.CSSProperties}>
      <header className="p-cover">
        <span className="p-cover__ghost" aria-hidden="true">?</span>
        <div className="p-wrap p-cover__inner">
          <span className="p-label">Library</span>
          <h1 className="p-display">Find a lesson</h1>
          <form className="p-searchbox" role="search" onSubmit={(e) => { e.preventDefault(); run(query) }}>
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
              <button type="button" className="p-round p-round--sm" onClick={() => { setQuery(''); inputRef.current?.focus() }} aria-label="Clear search">
                <X size={16} />
              </button>
            )}
            <button type="submit" className="p-btn p-btn--fill p-btn--sm p-desktop-only">Search</button>
          </form>
        </div>
      </header>

      <div className="p-wrap" style={{ paddingBottom: 48, maxWidth: 900 }}>
        {loading && (
          <p className="p-results-meta" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Loader2 size={14} className="animate-spin" /> Searching the library…
          </p>
        )}
        {error && <p className="p-results-meta" style={{ color: 'var(--danger)' }}>{error}</p>}

        {!loading && !error && searched && (
          <p className="p-results-meta" aria-live="polite">
            {total === 0 ? `No lessons match “${searched}”.` : `${total} ${total === 1 ? 'lesson matches' : 'lessons match'} “${searched}”`}
          </p>
        )}

        {results.length > 0 && <LessonList lessons={results} />}

        {!loading && (!searched || total === 0) && (
          <section aria-labelledby="suggest-title" style={{ paddingTop: 28 }}>
            <h2 id="suggest-title" className="p-label" style={{ margin: 0 }}>{searched ? 'Try one of these instead' : 'Popular destinations'}</h2>
            <div className="p-cloud" style={{ marginTop: 14 }}>
              {heroContent.typewriterTopics.map((t, i) => (
                <a key={t} href={`/search?q=${encodeURIComponent(t)}`} onClick={(e) => { e.preventDefault(); setQuery(t) }} style={{ '--c': swatch(i).color, '--fg': swatch(i).fg } as React.CSSProperties}>{t}</a>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
