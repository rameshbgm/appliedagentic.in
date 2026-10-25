'use client'
// components/aurora/AiSummaryDialog.tsx — bullet summary from /api/ai/summarize in a sheet
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

export default function AiSummaryDialog({ open, onClose, title, subtitle, content, type }: Props) {
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
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
    <>
      <div className="a-scrim" onClick={onClose} />
      <div className="a-sheet-wrap" role="dialog" aria-modal="true" aria-label={title}>
        <div className="a-sheet a-ai">
          <div className="a-sheet__grab" />
          <div className="a-sheet__head">
            <div style={{ minWidth: 0 }}>
              <span className="a-kicker a-kicker--accent">{subtitle}</span>
              <h2 className="a-display">{title}</h2>
            </div>
            <button type="button" className="a-icon" onClick={onClose} aria-label="Close summary"><X size={18} /></button>
          </div>
          {state === 'loading' && <div className="state"><Loader2 size={18} className="animate-spin" /> Reading it for you…</div>}
          {state === 'error' && (
            <div className="state" style={{ flexWrap: 'wrap' }}>
              <span>{error} Try again in a moment.</span>
              <button type="button" className="a-btn a-btn--sm" onClick={load}>Retry</button>
            </div>
          )}
          {state === 'done' && (
            <ol>
              {bullets.map((b, i) => <li key={`${i}-${b.slice(0, 12)}`} style={{ animationDelay: `${i * 60}ms` }}><b>{i + 1}</b><span>{b}</span></li>)}
            </ol>
          )}
        </div>
      </div>
    </>,
    document.body,
  )
}
