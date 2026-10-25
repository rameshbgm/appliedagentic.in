'use client'
// components/aurora/LibraryClient.tsx — saved essays, highlights and reading history
import Link from 'next/link'
import { StarMark } from './Sky'
import { useEffect, useState } from 'react'
import { BookmarkX, Check, Copy, X } from 'lucide-react'
import { toast } from 'sonner'
import {
  getBookmarks, getHighlights, getHistory, LIBRARY_EVENT, removeHighlight, toggleBookmark,
  type Bookmark, type Highlight, type ProgressEntry,
} from '@/lib/library'

type Tab = 'saved' | 'highlights' | 'history'

export default function LibraryClient() {
  const [tab, setTab] = useState<Tab>('saved')
  const [saved, setSaved] = useState<Bookmark[]>([])
  const [notes, setNotes] = useState<Highlight[]>([])
  const [history, setHistory] = useState<ProgressEntry[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const sync = () => { setSaved(getBookmarks()); setNotes(getHighlights().sort((a, b) => b.added - a.added)); setHistory(getHistory()) }
    sync()
    setReady(true)
    window.addEventListener(LIBRARY_EVENT, sync)
    return () => window.removeEventListener(LIBRARY_EVENT, sync)
  }, [])

  const counts = { saved: saved.length, highlights: notes.length, history: history.length }

  return (
    <div>
      <header className="a-wrap a-narrow a-opener">
        <span className="a-kicker a-kicker--accent">Kept on this device</span>
        <h1 className="a-display">Your library</h1>
        <p className="a-dek">Essays you saved, passages you highlighted, and everything you have opened. Nothing here leaves your browser.</p>
        <div className="a-seg" role="tablist" aria-label="Library sections">
          {(['saved', 'highlights', 'history'] as Tab[]).map((t) => (
            <button key={t} type="button" role="tab" aria-selected={tab === t} aria-pressed={tab === t} onClick={() => setTab(t)}>
              {t === 'saved' ? 'Saved' : t === 'highlights' ? 'Highlights' : 'History'} {ready ? `(${counts[t]})` : ''}
            </button>
          ))}
        </div>
      </header>

      <div className="a-wrap a-narrow" style={{ paddingBottom: 48 }}>
        {tab === 'saved' && (saved.length === 0 ? (
          <Empty text="Tap the bookmark beside any essay's progress orb to keep it here." />
        ) : (
          <ol className="a-lessons">
            {saved.map((b) => (
              <li key={b.slug} style={{ '--c': b.color } as React.CSSProperties}>
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', gap: 12, alignItems: 'center', padding: '20px 0' }}>
                  <Link href={`/articles/${b.slug}`} style={{ display: 'grid', gap: 4 }}>
                    {b.module && <span className="a-kicker" style={{ color: 'var(--c)' }}>{b.module}</span>}
                    <h3>{b.title}</h3>
                    <span className="a-meta">Saved {new Date(b.added).toLocaleDateString()}</span>
                  </Link>
                  <button type="button" className="a-icon" onClick={() => { toggleBookmark(b); toast.success('Removed from your library') }} aria-label={`Remove ${b.title}`}><BookmarkX size={18} /></button>
                </div>
              </li>
            ))}
          </ol>
        ))}

        {tab === 'highlights' && (notes.length === 0 ? (
          <Empty text="Select any sentence while reading and choose Highlight. Your passages collect here." />
        ) : (
          <div style={{ display: 'grid', gap: 14 }}>
            {notes.map((h) => (
              <figure key={h.id} className="a-note" style={{ margin: 0, padding: '16px 18px 14px 20px' }}>
                <blockquote style={{ margin: 0, fontSize: '1.05rem', lineHeight: 1.6, color: 'var(--ink)' }}>“{h.text}”</blockquote>
                <figcaption className="a-meta" style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Link href={`/articles/${h.slug}`} style={{ textDecoration: 'underline', textUnderlineOffset: 3 }}>{h.title}</Link>
                  <span style={{ display: 'flex', gap: 2 }}>
                    <button type="button" className="a-icon" style={{ opacity: 1, position: 'static', width: 34, height: 34 }} onClick={async () => { try { await navigator.clipboard.writeText(`“${h.text}” — ${h.title}`); toast.success('Quote copied') } catch { toast.error('Copy failed') } }} aria-label="Copy quote"><Copy size={15} /></button>
                    <button type="button" className="a-icon" style={{ opacity: 1, position: 'static', width: 34, height: 34 }} onClick={() => removeHighlight(h.id)} aria-label="Delete highlight"><X size={15} /></button>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        ))}

        {tab === 'history' && (history.length === 0 ? (
          <Empty text="Essays you open will appear here with how far you got." />
        ) : (
          <ol className="a-lessons">
            {history.map((p) => (
              <li key={p.slug} style={{ '--c': p.color } as React.CSSProperties}>
                <Link href={`/articles/${p.slug}`} style={{ gridTemplateColumns: 'minmax(0,1fr)' }}>
                  <h3>{p.title}</h3>
                  <span className="row" style={{ alignItems: 'center' }}>
                    {p.pct >= 0.97 ? <span className="a-read-mark"><Check size={14} /> Finished</span> : <span>{Math.round(p.pct * 100)}% read</span>}
                    <span>{new Date(p.updated).toLocaleDateString()}</span>
                  </span>
                  <span className="a-meter" style={{ marginTop: 8 }}><span style={{ width: `${Math.round(p.pct * 100)}%` }} /></span>
                </Link>
              </li>
            ))}
          </ol>
        ))}
      </div>
    </div>
  )
}

function Empty({ text }: { text: string }) {
  return (
    <div className="a-empty" style={{ justifyItems: 'center', textAlign: 'center' }}>
      <span style={{ color: 'var(--accent)', filter: 'drop-shadow(0 0 12px var(--accent))' }} aria-hidden="true"><StarMark size={34} /></span>
      <p>{text}</p>
      <Link href="/#paths" className="a-btn a-btn--accent a-btn--sm">Explore the paths</Link>
    </div>
  )
}
