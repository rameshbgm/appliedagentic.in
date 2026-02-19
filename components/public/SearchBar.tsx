'use client'
// components/public/SearchBar.tsx
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Loader2, X, Clock, BookOpen } from 'lucide-react'
import Link from 'next/link'

interface SearchResult {
  id: string
  type: 'article' | 'topic' | 'module'
  title: string
  slug: string
  description?: string
  module?: { name: string; color: string }
}

interface Props {
  placeholder?: string
  autoFocus?: boolean
  fullPage?: boolean // larger layout when used on /search page
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
      if (data.success) setResults(data.data ?? [])
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

  // Close on outside click
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

  const getIcon = (type: string) => {
    if (type === 'module') return '🧩'
    if (type === 'topic') return <BookOpen size={13} />
    return '📄'
  }

  const getHref = (r: SearchResult) => {
    if (r.type === 'module') return `/modules/${r.slug}`
    if (r.type === 'topic') return `/topics/${r.slug}`
    return `/articles/${r.slug}`
  }

  return (
    <div ref={containerRef} className={`relative w-full ${fullPage ? 'max-w-2xl mx-auto' : 'max-w-md'}`}>
      <form onSubmit={handleSubmit}>
        <div
          className="flex items-center gap-3 px-4 rounded-2xl transition-all"
          style={{
            background: 'var(--bg-elevated)',
            border: `1px solid ${open ? 'rgba(108,61,255,0.5)' : 'var(--bg-border)'}`,
            height: fullPage ? '56px' : '44px',
            boxShadow: open ? '0 0 0 3px rgba(108,61,255,0.12)' : 'none',
          }}
        >
          {loading
            ? <Loader2 size={16} className="animate-spin flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
            : <Search size={16} className="flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
          }
          <input
            ref={inputRef}
            type="text"
            value={query}
            autoFocus={autoFocus}
            placeholder={placeholder}
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: 'var(--text-primary)' }}
            onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
            onFocus={() => setOpen(true)}
          />
          {query && (
            <button type="button" onClick={() => { setQuery(''); setResults([]); inputRef.current?.focus() }}>
              <X size={14} style={{ color: 'var(--text-muted)' }} />
            </button>
          )}
        </div>
      </form>

      {/* Dropdown */}
      {open && (results.length > 0 || (query.trim() && !loading)) && (
        <div
          className="absolute top-full left-0 right-0 mt-2 rounded-2xl overflow-hidden z-50 shadow-xl"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--bg-border)' }}
        >
          {results.length === 0 && query.trim() && !loading && (
            <p className="px-4 py-5 text-sm text-center" style={{ color: 'var(--text-muted)' }}>
              No results for "{query}"
            </p>
          )}
          {results.map((r) => (
            <Link
              key={r.id}
              href={getHref(r)}
              onClick={() => { setOpen(false); setQuery('') }}
              className="flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
            >
              <span className="text-sm mt-0.5 flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
                {getIcon(r.type)}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                  {r.title}
                </p>
                {r.description && (
                  <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {r.description}
                  </p>
                )}
              </div>
              {r.module && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{ background: r.module.color + '20', color: r.module.color }}
                >
                  {r.module.name}
                </span>
              )}
            </Link>
          ))}
          {results.length > 0 && (
            <div className="px-4 py-2.5" style={{ borderTop: '1px solid var(--bg-border)' }}>
              <button
                className="text-xs font-medium hover:underline"
                style={{ color: '#6C3DFF' }}
                onClick={() => { setOpen(false); router.push(`/search?q=${encodeURIComponent(query)}`) }}
              >
                View all results for "{query}" →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
