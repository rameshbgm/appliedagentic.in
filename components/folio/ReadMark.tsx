'use client'
// components/folio/ReadMark.tsx — "Read" / "42% read" badge from the reader's local progress
import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'
import { getProgress, LIBRARY_EVENT } from '@/lib/library'

export default function ReadMark({ slug }: { slug: string }) {
  const [pct, setPct] = useState<number | null>(null)
  useEffect(() => {
    const sync = () => setPct(getProgress(slug)?.pct ?? null)
    sync()
    window.addEventListener(LIBRARY_EVENT, sync)
    return () => window.removeEventListener(LIBRARY_EVENT, sync)
  }, [slug])
  if (pct == null || pct < 0.03) return null
  if (pct >= 0.97) return <span className="f-read-mark"><Check size={14} /> Read</span>
  return <span className="f-read-mark partial">{Math.round(pct * 100)}% read</span>
}
