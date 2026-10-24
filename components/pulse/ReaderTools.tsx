'use client'
// components/pulse/ReaderTools.tsx
// Text size and typeface (sans / serif) for comfortable reading, remembered per
// device, plus the whole-article AI summary when that feature flag is on.
import { useCallback, useEffect, useState } from 'react'
import { Minus, Plus, Sparkles } from 'lucide-react'
import AiSummaryDialog from './AiSummaryDialog'
import { featureFlags } from '@/content/features'

interface Props {
  content: string
  title: string
}

const DEFAULT = 18
const MIN = 15
const MAX = 24
const SIZE_KEY = 'aa-article-font-size'
const FACE_KEY = 'aa-article-face'
const FACES = {
  sans: 'var(--body)',
  serif: 'Charter, "Iowan Old Style", "Palatino Linotype", Georgia, serif',
} as const

type Face = keyof typeof FACES

export default function ReaderTools({ content, title }: Props) {
  const [size, setSize] = useState(DEFAULT)
  const [face, setFace] = useState<Face>('sans')
  const [aiOpen, setAiOpen] = useState(false)

  useEffect(() => {
    let v = DEFAULT
    let f: Face = 'sans'
    try {
      v = parseInt(localStorage.getItem(SIZE_KEY) ?? '', 10) || DEFAULT
      f = localStorage.getItem(FACE_KEY) === 'serif' ? 'serif' : 'sans'
    } catch { /* storage unavailable */ }
    v = Math.min(MAX, Math.max(MIN, v))
    setSize(v)
    setFace(f)
    document.documentElement.style.setProperty('--article-font-size', `${v}px`)
    document.documentElement.style.setProperty('--body-font', FACES[f])
  }, [])

  const adjust = useCallback((d: number) => {
    setSize((prev) => {
      const next = Math.min(MAX, Math.max(MIN, prev + d))
      document.documentElement.style.setProperty('--article-font-size', `${next}px`)
      try { localStorage.setItem(SIZE_KEY, String(next)) } catch { /* storage unavailable */ }
      return next
    })
  }, [])

  const pickFace = (f: Face) => {
    setFace(f)
    document.documentElement.style.setProperty('--body-font', FACES[f])
    try { localStorage.setItem(FACE_KEY, f) } catch { /* storage unavailable */ }
  }

  return (
    <div className="p-tools">
      <div className="p-size" role="group" aria-label="Text size">
        <button type="button" onClick={() => adjust(-1)} disabled={size <= MIN} aria-label="Smaller text"><Minus size={16} /></button>
        <span aria-live="polite">{size}px</span>
        <button type="button" onClick={() => adjust(1)} disabled={size >= MAX} aria-label="Larger text"><Plus size={16} /></button>
      </div>
      <div className="p-fontswap" role="group" aria-label="Typeface">
        <button type="button" aria-pressed={face === 'sans'} onClick={() => pickFace('sans')}>Sans</button>
        <button type="button" aria-pressed={face === 'serif'} onClick={() => pickFace('serif')} style={{ fontFamily: FACES.serif }}>Serif</button>
      </div>
      {featureFlags.aiSummary && (
        <>
          <button type="button" className="p-btn p-btn--sm p-btn--soft" onClick={() => setAiOpen(true)}>
            <Sparkles size={15} /> AI summary
          </button>
          <AiSummaryDialog open={aiOpen} onClose={() => setAiOpen(false)} title={title} subtitle="Article summary" content={content} type="article" />
        </>
      )}
    </div>
  )
}
