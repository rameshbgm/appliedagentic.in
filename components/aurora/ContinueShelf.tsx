'use client'
// components/aurora/ContinueShelf.tsx
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
    <section className="a-wrap a-sec" aria-labelledby="continue-title" style={{ paddingTop: 48 }}>
      <div className="a-sec-head a-sec-head--row">
        <div style={{ display: 'grid', gap: 8 }}>
          <span className="a-kicker a-kicker--accent">Welcome back</span>
          <h2 id="continue-title" className="a-display">Continue reading</h2>
        </div>
        <Link href="/library" className="a-btn a-btn--quiet a-btn--sm">Your library <ArrowRight size={16} /></Link>
      </div>
      {week.articles > 0 && (
        <p className="a-stats-line">
          This week you opened {week.articles} {week.articles === 1 ? 'essay' : 'essays'}{week.finished > 0 ? ` and finished ${week.finished}` : ''}.
        </p>
      )}
      <div className="a-shelf">
        {items.map((p) => (
          <Link key={p.slug} href={`/articles/${p.slug}`} className="a-shelf__card" style={{ '--c': p.color } as React.CSSProperties}>
            {p.module && <span className="a-kicker">{p.module}</span>}
            <b>{p.title}</b>
            <div className="a-meter" aria-hidden="true"><span style={{ width: `${Math.round(p.pct * 100)}%` }} /></div>
            <span className="a-meta"><span>{Math.round(p.pct * 100)}% read</span><span>Pick up where you left off</span></span>
          </Link>
        ))}
      </div>
    </section>
  )
}
