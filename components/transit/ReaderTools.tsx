'use client'
// components/transit/ReaderTools.tsx
// Text size control (remembered per device) and the whole-article AI summary.
import { useCallback, useEffect, useState } from 'react'
import { Minus, Plus, Sparkles } from 'lucide-react'
import AiSummaryDialog from './AiSummaryDialog'
import { featureFlags } from '@/content/features'

interface Props {
  content: string
  title: string
}

const DEFAULT = 17
const MIN = 14
const MAX = 24
const KEY = 'aa-article-font-size'

export default function ReaderTools({ content, title }: Props) {
  const [size, setSize] = useState(DEFAULT)
  const [aiOpen, setAiOpen] = useState(false)

  useEffect(() => {
    let v = DEFAULT
    try { v = parseInt(localStorage.getItem(KEY) ?? '', 10) || DEFAULT } catch { /* storage unavailable */ }
    v = Math.min(MAX, Math.max(MIN, v))
    setSize(v)
    document.documentElement.style.setProperty('--article-font-size', `${v}px`)
  }, [])

  const adjust = useCallback((d: number) => {
    setSize((prev) => {
      const next = Math.min(MAX, Math.max(MIN, prev + d))
      document.documentElement.style.setProperty('--article-font-size', `${next}px`)
      try { localStorage.setItem(KEY, String(next)) } catch { /* storage unavailable */ }
      return next
    })
  }, [])

  return (
    <div className="tr-tools">
      <div className="tr-tools__size" role="group" aria-label="Text size">
        <button type="button" onClick={() => adjust(-1)} disabled={size <= MIN} aria-label="Smaller text"><Minus size={15} /></button>
        <span aria-live="polite">{size}px</span>
        <button type="button" onClick={() => adjust(1)} disabled={size >= MAX} aria-label="Larger text"><Plus size={15} /></button>
      </div>
      {featureFlags.aiSummary && (
        <>
          <button type="button" className="tr-btn tr-btn--ghost tr-btn--sm" onClick={() => setAiOpen(true)}>
            <Sparkles size={15} /> AI summary
          </button>
          <AiSummaryDialog open={aiOpen} onClose={() => setAiOpen(false)} title={title} subtitle="Article summary" content={content} type="article" />
        </>
      )}
    </div>
  )
}
