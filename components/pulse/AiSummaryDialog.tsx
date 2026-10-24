'use client'
// components/pulse/AiSummaryDialog.tsx
// Fetches bullet-point summaries from /api/ai/summarize and shows them in a sheet.
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Loader2, X } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  title: string
  subtitle: string
  content: string
  type: 'article' | 'section'
}

type State = 'idle' | 'loading' | 'done' | 'error'

export default function AiSummaryDialog({ open, onClose, title, subtitle, content, type }: Props) {
  const [state, setState] = useState<State>('idle')
  const [bullets, setBullets] = useState<string[]>([])
  const [error, setError] = useState('')
  const loadedFor = useRef<string | null>(null)

  const load = async () => {
    setState('loading')
    setError('')
    try {
      const res = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, type, ...(type === 'section' ? { maxPoints: 7 } : {}) }),
      })
      const data = await res.json()
      if (!res.ok || !data.data?.bullets) throw new Error(data.message ?? 'The summary service did not respond.')
      setBullets(data.data.bullets)
      setState('done')
      loadedFor.current = content
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The summary service did not respond.')
      setState('error')
    }
  }

  useEffect(() => {
    if (open && loadedFor.current !== content && state !== 'loading') load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, content])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div className="p-overlay" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="p-sheet p-ai">
        <div className="p-sheet__grab" />
        <div className="p-ai__head">
          <div style={{ minWidth: 0 }}>
            <span className="p-label">{subtitle}</span>
            <h2>{title}</h2>
          </div>
          <button type="button" className="p-round p-round--sm" onClick={onClose} aria-label="Close summary"><X size={18} /></button>
        </div>
        {state === 'loading' && <div className="state"><Loader2 size={18} className="animate-spin" /> Summarising this stop…</div>}
        {state === 'error' && (
          <div className="state" style={{ flexWrap: 'wrap' }}>
            <span>{error} Try again in a moment.</span>
            <button type="button" className="p-btn p-btn--sm" onClick={load}>Retry</button>
          </div>
        )}
        {state === 'done' && (
          <ol>
            {bullets.map((b, i) => (
              <li key={`${i}-${b.slice(0, 12)}`} style={{ animationDelay: `${i * 50}ms` }}><b>{i + 1}</b><span>{b}</span></li>
            ))}
          </ol>
        )}
      </div>
    </div>,
    document.body,
  )
}
