'use client'
import { useEffect, useRef, useState } from 'react'
import { Loader2, X } from 'lucide-react'
import Modal from './Modal'

interface Props {
  open: boolean; onClose: () => void; title: string; subtitle: string
  content: string; type: 'article' | 'section'
}

export default function AiSummaryDialog({ open, onClose, title, subtitle, content, type }: Props) {
  const [state, setState] = useState<'loading' | 'done' | 'error'>('loading')
  const [bullets, setBullets] = useState<string[]>([])
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const loadedFor = useRef<string | null>(null)

  useEffect(() => {
    if (!open || loadedFor.current === content) return
    const ctrl = new AbortController()
    setState('loading')
    setError('')
    fetch('/api/ai/summarize', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, type }), signal: ctrl.signal,
    }).then(async (res) => {
      const data = await res.json()
      if (!res.ok || !Array.isArray(data.data?.bullets)) throw new Error(data.error || 'The summary could not load.')
      if (ctrl.signal.aborted) return
      setBullets(data.data.bullets)
      loadedFor.current = content
      setState('done')
    }).catch((err) => {
      if (ctrl.signal.aborted) return
      setError(err instanceof Error ? err.message : 'The summary could not connect.')
      setState('error')
    })
    return () => ctrl.abort()
  }, [open, content, type, retry])

  if (!open) return null
  return <Modal label={title} onClose={onClose}>
    <div className="tr-sheet tr-ai">
      <div className="tr-sheet__grab" />
      <div className="tr-ai__head">
        <div style={{ minWidth: 0 }}><p>{subtitle}</p><h2>{title}</h2></div>
        <button type="button" className="tr-icon-btn" onClick={onClose} aria-label="Close summary"><X size={18} /></button>
      </div>
      {state === 'loading' && <div className="state" role="status"><Loader2 size={18} className="animate-spin" /> Summarising this stop…</div>}
      {state === 'error' && <div className="state" style={{ flexWrap: 'wrap' }} role="alert"><span>{error}</span><button type="button" className="tr-btn tr-btn--sm" onClick={() => setRetry((v) => v + 1)}>Retry</button></div>}
      {state === 'done' && <ol>{bullets.map((b, i) => <li key={`${i}-${b.slice(0, 12)}`}><b>{i + 1}</b><span>{b}</span></li>)}</ol>}
    </div>
  </Modal>
}
