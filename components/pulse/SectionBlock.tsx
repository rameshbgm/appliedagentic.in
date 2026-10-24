'use client'
// components/pulse/SectionBlock.tsx
// One ArticleSection: numbered stop header (collapsible), audio + AI summary, body.
import { useState } from 'react'
import { ChevronDown, Loader2, Pause, Play, Sparkles, Volume2 } from 'lucide-react'
import ArticleContent from '@/components/public/ArticleContent'
import AiSummaryDialog from './AiSummaryDialog'
import { useArticleAudio } from '@/components/public/ArticleAudioContext'
import { featureFlags } from '@/content/features'
import { swatch } from '@/lib/catalog'

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
}

export default function SectionBlock({ section, index, total }: Props) {
  const audio = useArticleAudio()
  const [collapsed, setCollapsed] = useState(false)
  const [summaryOpen, setSummaryOpen] = useState(false)
  const isThis = audio.currentSectionIdx === index
  const playState = isThis ? audio.playState : 'idle'
  const hasTitle = Boolean(section.title?.trim())
  // Every section gets its own colour from the palette, offset from the module colour
  const sw = swatch(index + 1)

  const onAudio = () => {
    if (isThis && audio.playState === 'playing') audio.pause()
    else if (isThis && audio.playState === 'paused') audio.togglePlayPause()
    else audio.playSectionAudio(index)
  }

  return (
    <section
      className={`p-section${index === 0 ? ' p-first' : ''}`}
      id={`section-${index + 1}`}
      aria-labelledby={hasTitle ? `section-${section.id}` : undefined}
      style={{ '--sc': sw.color, '--sfg': sw.fg } as React.CSSProperties}
    >
      {hasTitle && (
        <div className="p-section__head" id={`section-${section.id}`} data-ride-stop={section.title}>
          <button
            type="button"
            className="p-section__toggle"
            aria-expanded={!collapsed}
            aria-controls={`section-body-${section.id}`}
            onClick={() => setCollapsed((c) => !c)}
          >
            <span className="p-section__num" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
            <span className="p-section__title">{section.title}</span>
            <ChevronDown size={18} className="p-section__chev" aria-hidden="true" />
          </button>
          <span className="p-section__tools">
            {featureFlags.aiSummary && total > 1 && (
              <button type="button" className="p-round p-round--sm" onClick={() => setSummaryOpen(true)} aria-label="Summarise this section" title="Summarise this section">
                <Sparkles size={16} />
              </button>
            )}
            {section.audioUrl && (
              <button
                type="button"
                className="p-round p-round--sm"
                data-playing={playState === 'playing' ? 'true' : undefined}
                onClick={onAudio}
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
        <div id={`section-body-${section.id}`} className="p-section__body" hidden={collapsed}>
          <ArticleContent content={section.content} standalone />
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
