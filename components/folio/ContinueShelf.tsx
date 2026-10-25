'use client'
// components/folio/ContinueShelf.tsx
// "Continue reading" — the essays this reader has started, newest first.
// Renders nothing for first-time visitors.
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { getInProgress, weeklySummary, LIBRARY_EVENT, type ProgressEntry } from '@/lib/library'

export default function ContinueShelf() {
  const [items, setItems] = useState<ProgressEntry[]>([])
  const [week, setWeek] = useState({ articles: 0, finished: 0 })

  useEffect(() => {
    const sync = () => { setItems(getInProgress(8)); setWeek(weeklySummary()) }
    sync()
    window.addEventListener(LIBRARY_EVENT, sync)
    return () => window.removeEventListener(LIBRARY_EVENT, sync)
  }, [])

  if (items.length === 0) return null
  return (
    <section className="f-wrap f-sec" aria-labelledby="continue-title" style={{ paddingTop: 48 }}>
      <div className="f-sec-head f-sec-head--row">
        <div style={{ display: 'grid', gap: 8 }}>
          <span className="f-kicker f-kicker--accent">Welcome back</span>
          <h2 id="continue-title" className="f-display">Continue reading</h2>
        </div>
        <Link href="/library" className="f-btn f-btn--quiet f-btn--sm">Your library <ArrowRight size={16} /></Link>
      </div>
      {week.articles > 0 && (
        <p className="f-stats-line">
          This week you opened {week.articles} {week.articles === 1 ? 'essay' : 'essays'}{week.finished > 0 ? ` and finished ${week.finished}` : ''}.
        </p>
      )}
      <div className="f-shelf">
        {items.map((p) => (
          <Link key={p.slug} href={`/articles/${p.slug}`} className="f-shelf__card" style={{ '--c': p.color } as React.CSSProperties}>
            {p.module && <span className="f-kicker">{p.module}</span>}
            <b>{p.title}</b>
            <div className="f-meter" aria-hidden="true"><span style={{ width: `${Math.round(p.pct * 100)}%` }} /></div>
            <span className="f-meta"><span>{Math.round(p.pct * 100)}% read</span><span>Pick up where you left off</span></span>
          </Link>
        ))}
      </div>
    </section>
  )
}
