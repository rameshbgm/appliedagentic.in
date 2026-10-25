'use client'
// components/aurora/SectionBlock.tsx
// One ArticleSection, set like a chapter section: "§ 2" numeral, title,
// collapse, narration and AI summary.
import { useState } from 'react'
import { ChevronDown, Loader2, Pause, Play, Sparkles, Volume2 } from 'lucide-react'
import ArticleContent from '@/components/public/ArticleContent'
import AiSummaryDialog from './AiSummaryDialog'
import { useArticleAudio } from '@/components/public/ArticleAudioContext'
import { featureFlags } from '@/content/features'

interface Section {
  id: number
  title: string
  content: string
  audioUrl?: string | null
}

export default function SectionBlock({ section, index, total }: { section: Section; index: number; total: number }) {
  const audio = useArticleAudio()
  const [collapsed, setCollapsed] = useState(false)
  const [summaryOpen, setSummaryOpen] = useState(false)
  const isThis = audio.currentSectionIdx === index
  const playState = isThis ? audio.playState : 'idle'
  const hasTitle = Boolean(section.title?.trim())

  const onAudio = () => {
    if (isThis && audio.playState === 'playing') audio.pause()
    else if (isThis && audio.playState === 'paused') audio.togglePlayPause()
    else audio.playSectionAudio(index)
  }

  return (
    <section className={`a-section${index === 0 ? ' is-first' : ''}`} id={`section-${index + 1}`} aria-labelledby={hasTitle ? `section-${section.id}` : undefined}>
      {hasTitle && (
        <div className="a-section__head" id={`section-${section.id}`} data-ride-stop={section.title}>
          <button type="button" className="a-section__toggle" aria-expanded={!collapsed} aria-controls={`section-body-${section.id}`} onClick={() => setCollapsed((c) => !c)}>
            <span className="a-section__num" aria-hidden="true">§ {index + 1}</span>
            <span className="a-section__title">{section.title}</span>
          </button>
          <span className="a-section__tools">
            {featureFlags.aiSummary && total > 1 && (
              <button type="button" className="a-icon" onClick={() => setSummaryOpen(true)} aria-label="Summarise this section" title="Summarise this section"><Sparkles size={17} /></button>
            )}
            {section.audioUrl && (
              <button type="button" className="a-icon" data-playing={playState === 'playing' ? 'true' : undefined} onClick={onAudio} aria-label={playState === 'playing' ? 'Pause section audio' : 'Play section audio'}>
                {playState === 'loading' && <Loader2 size={17} className="animate-spin" />}
                {playState === 'idle' && <Volume2 size={17} />}
                {playState === 'playing' && <Pause size={17} />}
                {playState === 'paused' && <Play size={17} />}
              </button>
            )}
            <button type="button" className="a-icon" onClick={() => setCollapsed((c) => !c)} aria-label={collapsed ? 'Expand section' : 'Collapse section'}>
              <ChevronDown size={18} style={{ transform: collapsed ? 'rotate(-90deg)' : undefined, transition: 'transform .35s var(--ease)' }} />
            </button>
          </span>
        </div>
      )}
      {section.content && (
        <div id={`section-body-${section.id}`} className="a-section__body" hidden={collapsed}>
          <ArticleContent content={section.content} standalone />
        </div>
      )}
      {featureFlags.aiSummary && total > 1 && (
        <AiSummaryDialog open={summaryOpen} onClose={() => setSummaryOpen(false)} title={section.title || `Section ${index + 1}`} subtitle="Section summary" content={section.content} type="section" />
      )}
    </section>
  )
}
