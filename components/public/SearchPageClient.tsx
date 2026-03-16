'use client'
// components/public/SearchPageClient.tsx
// Search-on-submit client component for the /search page

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Loader2, X, Clock, Eye, ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'

const RESULT_COLORS = [
  { gradient: 'linear-gradient(135deg, #34d399, #38bdf8)', accent: '#34d399' },
  { gradient: 'linear-gradient(135deg, #818cf8, #ec4899)', accent: '#818cf8' },
  { gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)', accent: '#f59e0b' },
  { gradient: 'linear-gradient(135deg, #38bdf8, #818cf8)', accent: '#38bdf8' },
  { gradient: 'linear-gradient(135deg, #f472b6, #fb923c)', accent: '#f472b6' },
  { gradient: 'linear-gradient(135deg, #4ade80, #38bdf8)', accent: '#4ade80' },
]

export default function SearchPageClient({ initialQuery = '' }: { initialQuery?: string }) {
  const router = useRouter()
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); setLoading(false); setSearched(false); return }
    setLoading(true)
    setSearched(true)
    router.replace(`/search?q=${encodeURIComponent(q.trim())}`, { scroll: false })
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=24`)
      const data = await res.json()
      if (data.success) setResults(data.data?.items ?? [])
      else setResults([])
    } catch { setResults([]) }
    finally { setLoading(false) }
  }, [router])

  // Run initial query on mount (when navigating to /search?q=...)
  useEffect(() => {
    if (initialQuery) doSearch(initialQuery)
  }, [initialQuery, doSearch])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    doSearch(query)
  }

  const handleClear = () => {
    setQuery('')
    setResults([])
    setSearched(false)
    router.replace('/search', { scroll: false })
    inputRef.current?.focus()
  }

  return (
    <div className="min-h-screen">

      {/* ── Hero / search bar ── */}
      <div className="relative overflow-hidden pt-20 pb-12 px-4" style={{ borderBottom: '1px solid var(--bg-border)' }}>
        {/* Decorative blobs */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }} aria-hidden>
          <div style={{ position: 'absolute', top: '-30%', right: '5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(129,140,248,0.13) 0%, transparent 70%)' }} />
          <div style={{ position: 'absolute', bottom: '-30%', left: '-5%', width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(circle, rgba(52,211,153,0.1) 0%, transparent 70%)' }} />
          <div style={{ position: 'absolute', top: '10%', left: '30%', width: 260, height: 260, borderRadius: '50%', background: 'radial-gradient(circle, rgba(244,114,182,0.07) 0%, transparent 70%)' }} />
        </div>

        <div className="max-w-2xl mx-auto relative">
          <div className="text-center mb-10">
            <div
              className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] px-3 py-1 rounded-full mb-6"
              style={{ background: 'rgba(129,140,248,0.1)', color: '#818cf8', border: '1px solid rgba(129,140,248,0.2)' }}
            >
              <Sparkles size={10} /> Knowledge Search
            </div>
            <h1 className="font-black leading-[1.08] tracking-tight" style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', color: 'var(--text-primary)' }}>
              Find{' '}
              <span style={{ background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 45%, #38bdf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                anything.
              </span>
            </h1>
            <p className="mt-3 text-[0.97rem]" style={{ color: 'var(--text-muted)', fontFamily: "'Lora', Georgia, serif", fontStyle: 'italic', lineHeight: 1.65 }}>
              Articles, topics &amp; learning modules — press Enter or click Search.
            </p>
          </div>

          {/* ── Search bar ── */}
          <form onSubmit={handleSubmit} role="search">
            {/* Outer glow ring */}
            <div style={{ padding: 1.5, borderRadius: 20, background: 'linear-gradient(135deg, rgba(99,102,241,0.5), rgba(56,189,248,0.35), rgba(129,140,248,0.5))', boxShadow: '0 0 0 5px rgba(99,102,241,0.07), 0 8px 32px rgba(99,102,241,0.12)' }}>
              <div
                className="flex items-center gap-3 pl-5 pr-3 py-3"
                style={{ borderRadius: 18.5, background: 'var(--bg-elevated)' }}
              >
                <Search size={17} className="shrink-0 opacity-50" style={{ color: '#818cf8' }} />
                <input
                  ref={inputRef}
                  type="search"
                  value={query}
                  autoFocus
                  autoComplete="off"
                  placeholder="Search articles, topics, modules..."
                  className="flex-1 bg-transparent outline-none text-[0.95rem] min-w-0"
                  style={{ color: 'var(--text-primary)', fontFamily: "'Space Grotesk', system-ui, sans-serif", letterSpacing: '-0.01em' }}
                  onChange={(e) => setQuery(e.target.value)}
                  suppressHydrationWarning
                />
                {query && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full transition-all hover:scale-110"
                    style={{ background: 'var(--bg-border)', color: 'var(--text-muted)' }}
                    aria-label="Clear search"
                  >
                    <X size={12} />
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading || !query.trim()}
                  className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[13px] font-bold tracking-wide transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] disabled:opacity-35 disabled:pointer-events-none"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)', color: '#fff', boxShadow: '0 2px 10px rgba(99,102,241,0.35)', fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
                >
                  {loading
                    ? <Loader2 size={14} className="animate-spin" />
                    : <Search size={14} />
                  }
                  Search
                </button>
              </div>
            </div>
          </form>

          {searched && !loading && (
            <p className="text-xs text-center mt-4 font-medium" style={{ color: results.length > 0 ? '#818cf8' : 'var(--text-muted)' }}>
              {results.length > 0
                ? `${results.length} result${results.length !== 1 ? 's' : ''} found`
                : `No results for "${query}"`}
            </p>
          )}
        </div>
      </div>

      {/* ── Results ── */}
      <div className="max-w-4xl mx-auto px-4 py-10">

        {/* Loading spinner */}
        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 size={32} className="animate-spin" style={{ color: '#818cf8' }} />
          </div>
        )}

        {/* Results grid */}
        {!loading && results.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((a, idx) => {
              const color = RESULT_COLORS[idx % RESULT_COLORS.length]
              const href = a.type === 'topic'
                ? `/topics/${a.slug}`
                : a.type === 'module'
                  ? `/modules/${a.slug}`
                  : `/articles/${a.slug}`
              const tags: string[] = a.articleTags?.map((at: any) => at.tag.name) ?? a.tags ?? []
              const moduleName: string | undefined = a.topicArticles?.[0]?.topic?.module?.name ?? a.module?.name
              const moduleColor: string = a.topicArticles?.[0]?.topic?.module?.color ?? a.module?.color ?? color.accent

              return (
                <Link
                  key={a.id || a.slug}
                  href={href}
                  className="group relative flex flex-col rounded-2xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl overflow-hidden"
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-border)', padding: '1rem 1.1rem 1rem' }}
                >
                  {/* Colored top accent */}
                  <div
                    className="absolute top-0 left-0 right-0 h-[2px]"
                    style={{ background: color.gradient }}
                  />

                  {moduleName && (
                    <span
                      className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full mb-2.5 self-start"
                      style={{ background: `${moduleColor}18`, color: moduleColor, border: `1px solid ${moduleColor}30` }}
                    >
                      {moduleName}
                    </span>
                  )}

                  <h3
                    className="font-bold text-[0.9rem] leading-snug mb-2 line-clamp-2 pr-2"
                    style={{ background: color.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontFamily: "'Inter', sans-serif" }}
                  >
                    {a.title}
                  </h3>

                  {(a.summary ?? a.description) && (
                    <p
                      className="text-[0.72rem] leading-relaxed line-clamp-2 mb-2.5"
                      style={{ color: 'var(--text-muted)', fontFamily: "'Lora', Georgia, serif", fontStyle: 'italic' }}
                    >
                      {a.summary ?? a.description}
                    </p>
                  )}

                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2.5">
                      {tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-1.5 py-0.5 rounded-full"
                          style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--bg-border)' }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div
                    className="flex items-center gap-3 text-[11px] mt-auto pt-2"
                    style={{ color: 'var(--text-muted)', borderTop: '1px solid var(--bg-border)' }}
                  >
                    {a.readingTimeMinutes && (
                      <span className="flex items-center gap-1">
                        <Clock size={10} /> {a.readingTimeMinutes} min
                      </span>
                    )}
                    {a.viewCount > 0 && (
                      <span className="flex items-center gap-1">
                        <Eye size={10} /> {a.viewCount}
                      </span>
                    )}
                    <span
                      className="ml-auto flex items-center gap-1 font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: color.accent }}
                    >
                      Read <ArrowRight size={11} />
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* No results */}
        {!loading && searched && results.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-5">🔍</div>
            <p className="font-bold text-xl mb-2" style={{ color: 'var(--text-primary)' }}>
              No results for &ldquo;{query}&rdquo;
            </p>
            <p
              className="text-sm mb-8"
              style={{ color: 'var(--text-muted)', fontFamily: "'Lora', Georgia, serif", fontStyle: 'italic' }}
            >
              Try different keywords or browse the topics below
            </p>
            <Link
              href="/#topics"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #818cf8, #ec4899)' }}
            >
              Browse Topics <ArrowRight size={14} />
            </Link>
          </div>
        )}

        {/* Empty state */}
        {!loading && !searched && (
          <div className="text-center py-20">
            <div className="text-6xl mb-6">✨</div>
            <p className="font-bold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>
              Start typing to search
            </p>
            <p
              className="text-sm"
              style={{ color: 'var(--text-muted)', fontFamily: "'Lora', Georgia, serif", fontStyle: 'italic' }}
            >
              Results appear instantly as you type
            </p>
          </div>
        )}

      </div>
    </div>
  )
}
