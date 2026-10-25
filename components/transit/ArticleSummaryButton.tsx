'use client'

import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { featureFlags } from '@/content/features'
import AiSummaryDialog from './AiSummaryDialog'

interface Props {
  content: string
  title: string
}

export default function ArticleSummaryButton({ content, title }: Props) {
  const [open, setOpen] = useState(false)
  if (!featureFlags.aiSummary) return null

  return (
    <>
      <button type="button" className="tr-btn tr-btn--ghost" onClick={() => setOpen(true)} aria-haspopup="dialog">
        <Sparkles size={17} /> AI Summary
      </button>
      <AiSummaryDialog open={open} onClose={() => setOpen(false)} title={title} subtitle="Article summary" content={content} type="article" />
    </>
  )
}
