'use client'
// components/public/SearchBar.tsx
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Loader2, X, BookOpen, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const FONT = "'Space Grotesk', system-ui, sans-serif"

interface SearchResult {
  id: string
  type: 'article' | 'topic' | 'module'
  title: string
  slug: string
  description?: string
  tags?: string[]
  module?: { name: string; color: string }
}

interface Props {
  placeholder?: string
  autoFocus?: boolean
  fullPage?: boolean
}

export default function SearchBar({ placeholder = 'Search articles, topics...', autoFocus, fullPage }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const router = useRouter()

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); setLoading(false); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=8`)
      const data = await res.json()
      if (data.success) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mapped: SearchResult[] = (data.data?.items ?? []).map((item: any) => ({
          id: String(item.id),
          type: (item.type ?? 'article') as SearchResult['type'],
          title: item.title,
          slug: item.slug,
          description: item.description ?? item.summary ?? undefined,
          tags: item.articleTags
            ? item.articleTags.map((at: { tag: { name: string } }) => at.tag.name)
            : (item.tags ?? undefined),
          module: item.module ?? (
            item.topicArticles?.[0]?.topic
              ? { name: item.topicArticles[0].topic.name, color: item.topicArticles[0].topic.color ?? '#6366f1' }
              : undefined
          ),
        }))
        setResults(mapped)
      }
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (query.trim()) {
      debounceRef.current = setTimeout(() => search(query), 300)
    } else {
      setResults([])
    }
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query, search])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      setOpen(false)
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  const getTypeLabel = (type: string) => {
    if (type === 'module') return { label: 'Module', icon: '🧩' }
    if (type === 'topic') return { label: 'Topic', icon: null, comp: <BookOpen size={11} /> }
    return null
  }

  const getHref = (r: SearchResult) => {
    if (r.type === 'module') return `/modules/${r.slug}`
    if (r.type === 'topic') return `/topics/${r.slug}`
    return `/articles/${r.slug}`
  }

  return (
    <div ref={containerRef} className={`relative w-full ${fullPage ? 'max-w-2xl mx-auto' : 'max-w-sm'}`}>
      <form onSubmit={handleSubmit}>
        <div
          className="flex items-center gap-3 px-4 rounded-xl transition-all duration-150"
          style={{
            background: 'var(--bg-elevated)',
            border: `1px solid ${open ? 'rgba(59,130,246,0.5)' : 'var(--bg-border)'}`,
            height: fullPage ? '54px' : '40px',
            boxShadow: open ? '0 0 0 3px rgba(59,130,246,0.1)' : 'none',
            fontFamily: FONT,
          }}
        >
          {loading
            ? <Loader2 size={15} className="animate-spin shrink-0" style={{ color: 'var(--text-muted)' }} />
            : <Search size={15} className="shrink-0" style={{ color: open ? '#3b82f6' : 'var(--text-muted)', transition: 'color 0.15s' }} />
          }
          <input
            ref={inputRef}
            type="text"
            value={query}
            autoFocus={autoFocus}
            placeholder={placeholder}
            className="flex-1 bg-transparent outline-none"
            style={{
              color: 'var(--text-primary)',
              fontFamily: FONT,
              fontSize: fullPage ? '15px' : '13.5px',
              fontWeight: 400,
            }}
            onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
            onFocus={() => setOpen(true)}
            suppressHydrationWarning
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(''); setResults([]); inputRef.current?.focus() }}
              className="p-0.5 rounded-full transition-colors hover:bg-black/10"
              aria-label="Clear search"
            >
              <X size={13} style={{ color: 'var(--text-muted)' }} />
            </button>
          )}
        </div>
      </form>

      {/* Dropdown results */}
      {open && (results.length > 0 || (query.trim() && !loading)) && (
        <div
          className="absolute top-full left-0 right-0 mt-1.5 rounded-xl overflow-hidden z-50"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--bg-border)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            fontFamily: FONT,
          }}
        >
          {results.length === 0 && query.trim() && !loading && (
            <div className="px-4 py-6 text-center">
              <p className="text-sm" style={{ color: 'var(--text-muted)', fontFamily: FONT }}>
                No results for <strong style={{ color: 'var(--text-primary)' }}>"{query}"</strong>
              </p>
            </div>
          )}

          {results.map((r, idx) => {
            const typeInfo = getTypeLabel(r.type)
            return (
              <Link
                key={r.id}
                href={getHref(r)}
                onClick={() => { setOpen(false); setQuery('') }}
                className="flex items-start gap-3 px-4 py-3 transition-colors"
                style={{
                  borderBottom: idx < results.length - 1 ? '1px solid var(--bg-border)' : 'none',
                  background: 'transparent',
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'rgba(59,130,246,0.04)')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-[13.5px] font-semibold truncate" style={{ color: 'var(--text-primary)', fontFamily: FONT }}>
                      {r.title}
                    </p>
                    {typeInfo && (
                      <span
                        className="shrink-0 inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                        style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}
                      >
                        {typeInfo.icon ?? (typeInfo as { comp?: React.ReactNode }).comp}
                        {typeInfo.label}
                      </span>
                    )}
                  </div>
                  {r.description && (
                    <p className="text-xs truncate" style={{ color: 'var(--text-muted)', fontFamily: FONT }}>
                      {r.description}
                    </p>
                  )}
                  {r.type === 'article' && r.tags && r.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {r.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-1.5 py-0.5 rounded-full"
                          style={{ background: 'var(--bg-border)', color: 'var(--text-muted)' }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {r.module && (
                  <span
                    className="text-[11px] px-2 py-0.5 rounded-full shrink-0 mt-0.5 font-medium"
                    style={{ background: r.module.color + '18', color: r.module.color, fontFamily: FONT }}
                  >
                    {r.module.name}
                  </span>
                )}
              </Link>
            )
          })}

          {results.length > 0 && (
            <div className="px-4 py-2.5 flex items-center justify-between" style={{ borderTop: '1px solid var(--bg-border)', background: 'rgba(59,130,246,0.02)' }}>
              <span className="text-[11px]" style={{ color: 'var(--text-muted)', fontFamily: FONT }}>
                {results.length} quick results
              </span>
              <button
                type="button"
                className="inline-flex items-center gap-1 text-[12px] font-semibold transition-opacity hover:opacity-70"
                style={{ color: '#3b82f6', fontFamily: FONT }}
                onClick={() => { setOpen(false); router.push(`/search?q=${encodeURIComponent(query)}`) }}
              >
                See all results <ArrowRight size={11} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

