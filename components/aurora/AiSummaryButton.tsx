'use client'
// components/aurora/AiSummaryButton.tsx — "Summarise" under the title (only when the AI flag is on)
import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import AiSummaryDialog from './AiSummaryDialog'
import { featureFlags } from '@/content/features'

export default function AiSummaryButton({ content, title }: { content: string; title: string }) {
  const [open, setOpen] = useState(false)
  if (!featureFlags.aiSummary) return null
  return (
    <>
      <button type="button" className="a-btn a-btn--quiet a-btn--sm" onClick={() => setOpen(true)}><Sparkles size={16} /> Summarise</button>
      <AiSummaryDialog open={open} onClose={() => setOpen(false)} title={title} subtitle="Essay summary" content={content} type="article" />
    </>
  )
}
