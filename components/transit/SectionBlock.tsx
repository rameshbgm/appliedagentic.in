'use client'
// components/transit/SectionBlock.tsx
// One ArticleSection: numbered stop header (collapsible), audio + AI summary, body.
import { useEffect, useRef, useState } from 'react'
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

interface Props {
  section: Section
  index: number
  total: number
  showImages?: boolean
}

export default function SectionBlock({ section, index, total, showImages = true }: Props) {
  const audio = useArticleAudio()
  const [collapsed, setCollapsed] = useState(false)
  const [summaryOpen, setSummaryOpen] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  useEffect(() => {
    const section = sectionRef.current
    const reveal = () => setCollapsed(false)
    section?.addEventListener('aa-reveal-section', reveal)
    return () => section?.removeEventListener('aa-reveal-section', reveal)
  }, [])
  const isThis = audio.currentSectionIdx === index
  const playState = isThis ? audio.playState : 'idle'
  const hasTitle = Boolean(section.title?.trim())

  const onAudio = () => {
    if (isThis && audio.playState === 'playing') audio.pause()
    else if (isThis && audio.playState === 'paused') audio.togglePlayPause()
    else audio.playSectionAudio(index)
  }

  return (
    <section ref={sectionRef} className="tr-section" id={`section-${index + 1}`} aria-labelledby={hasTitle ? `section-${section.id}` : undefined}>
      {hasTitle && (
        <div className="tr-section__head" id={`section-${section.id}`} data-ride-stop={section.title}>
          <button
            type="button"
            className="tr-section__toggle"
            aria-expanded={!collapsed}
            aria-controls={`section-body-${section.id}`}
            onClick={() => setCollapsed((c) => !c)}
          >
            <span className="tr-section__num" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
            <span className="tr-section__title">{section.title}</span>
            <ChevronDown size={18} className="tr-section__chev" aria-hidden="true" />
          </button>
          <span className="tr-section__tools">
            {featureFlags.aiSummary && total > 1 && (
              <button type="button" className="tr-icon-btn" onClick={() => setSummaryOpen(true)} aria-label="Summarise this section" title="Summarise this section">
                <Sparkles size={16} />
              </button>
            )}
            {section.audioUrl && (
              <button
                type="button"
                className="tr-icon-btn"
                data-playing={playState === 'playing' ? 'true' : undefined}
                onClick={onAudio}
                disabled={playState === 'loading'}
                aria-label={playState === 'playing' ? 'Pause section audio' : 'Play section audio'}
                title={playState === 'playing' ? 'Pause' : 'Listen to this section'}
              >
                {playState === 'loading' && <Loader2 size={16} className="animate-spin" />}
                {playState === 'idle' && <Volume2 size={16} />}
                {playState === 'playing' && <Pause size={16} />}
                {playState === 'paused' && <Play size={16} />}
              </button>
            )}
          </span>
        </div>
      )}

      {section.content && (
        <div id={`section-body-${section.id}`} hidden={collapsed}>
          <ArticleContent content={section.content} standalone showImages={showImages} />
        </div>
      )}

      {featureFlags.aiSummary && total > 1 && (
        <AiSummaryDialog
          open={summaryOpen}
          onClose={() => setSummaryOpen(false)}
          title={section.title || `Section ${index + 1}`}
          subtitle="Section summary"
          content={section.content}
          type="section"
        />
      )}
    </section>
  )
}
