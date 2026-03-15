'use client'
// components/public/SectionCard.tsx

import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, Volume2, Loader2, Pause, Play } from 'lucide-react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import ArticleContent from './ArticleContent'
import { featureFlags } from '@/content/features'
import { useArticleAudio } from './ArticleAudioContext'

// 10 entrance variants — cycled per section index
const ENTRANCES = [
  { initial: { opacity: 0, rotateX: 10, y: 18 },      animate: { opacity: 1, rotateX: 0, y: 0 },      transition: { duration: 0.76, ease: [0.22, 1, 0.36, 1] } },
  { initial: { opacity: 0, filter: 'blur(6px)', y: 8 }, animate: { opacity: 1, filter: 'blur(0px)', y: 0 }, transition: { duration: 0.82, ease: [0.22, 1, 0.36, 1] } },
  { initial: { opacity: 0, scale: 0.96, y: 10 },       animate: { opacity: 1, scale: 1, y: 0 },           transition: { duration: 0.60, ease: [0.34, 1.12, 0.64, 1] } },
  { initial: { opacity: 0, x: -26 },                   animate: { opacity: 1, x: 0 },                     transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
  { initial: { opacity: 0, y: 36 },                    animate: { opacity: 1, y: 0 },                     transition: { duration: 0.92, ease: [0.22, 1, 0.36, 1] } },
  { initial: { opacity: 0, x: 26 },                    animate: { opacity: 1, x: 0 },                     transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
  { initial: { opacity: 0, y: 14, scale: 0.984 },      animate: { opacity: 1, y: 0, scale: 1 },           transition: { duration: 0.56, ease: [0.22, 1, 0.36, 1] } },
  { initial: { opacity: 0, scale: 1.04, filter: 'blur(4px)' }, animate: { opacity: 1, scale: 1, filter: 'blur(0px)' }, transition: { duration: 0.72, ease: [0.22, 1, 0.36, 1] } },
  { initial: { opacity: 0, y: -14 },                   animate: { opacity: 1, y: 0 },                     transition: { duration: 0.60, ease: [0.22, 1, 0.36, 1] } },
  { initial: { opacity: 0, y: 22 },                    animate: { opacity: 1, y: 0 },                     transition: { duration: 0.68, ease: [0.22, 1, 0.36, 1] } },
] as const

const BOT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>`

// Curated gradient pairs — applied to section title text (not background)
const SECTION_GRADIENTS = [
  'linear-gradient(90deg, #7C3AED, #3B82F6)',
  'linear-gradient(90deg, #059669, #0EA5E9)',
  'linear-gradient(90deg, #D97706, #EF4444)',
  'linear-gradient(90deg, #DB2777, #7C3AED)',
  'linear-gradient(90deg, #0891B2, #059669)',
  'linear-gradient(90deg, #EA580C, #D97706)',
  'linear-gradient(90deg, #4F46E5, #06B6D4)',
  'linear-gradient(90deg, #BE185D, #F59E0B)',
]

// Solid accent colour (start of each gradient) — used for border, badge, header tint
const SECTION_COLORS = [
  '#7C3AED',
  '#059669',
  '#D97706',
  '#DB2777',
  '#0891B2',
  '#EA580C',
  '#4F46E5',
  '#BE185D',
]

interface Section {
  id: number
  title: string
  content: string
  audioUrl?: string | null
  order: number
}

interface Props {
  section: Section
  index: number
  gradientIndex: number
  totalSections?: number
}

type SummaryState = 'idle' | 'loading' | 'done' | 'error'

export default function SectionCard({ section, index, gradientIndex, totalSections = 1 }: Props) {
  const audio = useArticleAudio()
  const isThisSection = audio.currentSectionIdx === index
  const sectionPlayState = isThisSection ? audio.playState : 'idle'

  const hasTitle = Boolean(section.title?.trim())
  // Use the section's DB id for the anchor so that duplicate title text across
  // sections (e.g. two "Conclusion" sections) never collides.
  const titleId = `section-${section.id}`

  const gradient = SECTION_GRADIENTS[gradientIndex % SECTION_GRADIENTS.length]
  const accentColor = SECTION_COLORS[gradientIndex % SECTION_COLORS.length]

  // ── Collapse state
  const [collapsed, setCollapsed] = useState(false)

  // ── Section AI summary — managed per-card (fixes re-generation bug) ────────
  const [summaryOpen, setSummaryOpen] = useState(false)
  const [summaryState, setSummaryState] = useState<SummaryState>('idle')
  const [bullets, setBullets] = useState<string[]>([])
  const cache = useRef<string[] | null>(null)

  const openSummary = async () => {
    setSummaryOpen(true)
    if (cache.current) {
      // Already fetched — show cached result immediately, no new fetch
      setBullets(cache.current)
      setSummaryState('done')
      return
    }
    if (summaryState === 'loading') return
    setSummaryState('loading')
    try {
      const res = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: section.content, maxPoints: 7, type: 'section' }),
      })
      const data = await res.json()
      if (!res.ok || !data.data?.bullets) throw new Error(data.message ?? 'Failed')
      cache.current = data.data.bullets
      setBullets(data.data.bullets)
      setSummaryState('done')
    } catch (err) {
      setSummaryState('error')
      toast.error(err instanceof Error ? err.message : 'Section summary failed')
    }
  }

  const closeSummary = () => setSummaryOpen(false)

  const entrance = ENTRANCES[gradientIndex % ENTRANCES.length]

  return (
    <motion.div
      className="section-optional"
      id={`section-${index + 1}`}
      style={{
        // @ts-expect-error CSS custom properties
        '--section-color': accentColor,
        '--section-gradient-v': gradient.replace('90deg', 'to bottom'),
      }}
      initial={entrance.initial}
      whileInView={entrance.animate}
      viewport={{ once: true, margin: '-60px 0px' }}
      transition={{ ...entrance.transition, delay: Math.min(index * 0.05, 0.2) }}
    >

      {hasTitle && (
        <div id={titleId} className="section-optional-header" style={{ userSelect: 'none' }}>
          {/* Collapse trigger wraps badge + title + chevron only */}
          <button
            type="button"
            className="section-optional-header-toggle"
            aria-controls={`section-body-${section.id}`}
            onClick={() => setCollapsed((c) => !c)}
            style={{ display: 'contents' }}
          >
            <span className="section-optional-badge">{index + 1}</span>

            <span
              className="section-optional-title section-title-gradient"
              style={{ backgroundImage: gradient, flex: 1 }}
            >
              {section.title}
            </span>

            <ChevronDown
              size={15}
              className="shrink-0 transition-transform duration-250"
              style={{
                opacity: 0.5,
                transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                transitionDuration: '250ms',
              }}
              aria-hidden
            />
          </button>

          {/* AI summarize — separate from toggle, no nesting issue */}
          {featureFlags.aiSummary && totalSections > 1 && (
            <button
              type="button"
              className="section-ai-btn section-ai-header-btn"
              title="AI summary of this section"
              onClick={openSummary}
              dangerouslySetInnerHTML={{ __html: BOT_SVG }}
            />
          )}

          {/* Section audio speaker icon */}
          {section.audioUrl && (
            <button
              type="button"
              className="section-ai-btn section-audio-header-btn"
              data-playing={sectionPlayState === 'playing' ? 'true' : undefined}
              title={sectionPlayState === 'playing' ? 'Pause audio' : 'Play section audio'}
              onClick={(e) => {
                e.stopPropagation()
                if (isThisSection && audio.playState === 'playing') {
                  audio.pause()
                } else if (isThisSection && audio.playState === 'paused') {
                  audio.togglePlayPause()
                } else {
                  audio.playSectionAudio(index)
                }
              }}
            >
              {sectionPlayState === 'loading' && <Loader2 size={13} className="animate-spin" />}
              {sectionPlayState === 'idle' && <Volume2 size={13} />}
              {sectionPlayState === 'playing' && <Pause size={13} />}
              {sectionPlayState === 'paused' && <Play size={13} />}
            </button>
          )}
        </div>
      )}

      {section.content && (
        <div
          id={`section-body-${section.id}`}
          className="section-optional-body"
          hidden={collapsed}
        >
          <ArticleContent
            content={section.content}
            standalone
          />
        </div>
      )}

      {/* ── Section AI Summary Modal (portal, per-card) ────────────────────── */}
      {featureFlags.aiSummary && totalSections > 1 && summaryOpen && typeof document !== 'undefined' && createPortal(
        <div
          className="ai-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Section AI Summary"
          onClick={(e) => { if (e.target === e.currentTarget) closeSummary() }}
        >
          <div className="ai-modal-container">
            <div className="ai-modal-header">
              <span className="ai-modal-title">
                <span dangerouslySetInnerHTML={{ __html: BOT_SVG.replace('stroke="currentColor"', 'stroke="var(--green)"') }} />
                <span className="ai-modal-title-text">
                  <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>Section summary</span>
                  <span
                    className="truncate max-w-65 block"
                    style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 600 }}
                    title={section.title}
                  >
                    {section.title}
                  </span>
                </span>
              </span>
              <button
                type="button"
                className="ai-modal-close"
                onClick={closeSummary}
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="ai-modal-body">
              {summaryState === 'loading' && (
                <div className="ai-modal-loading">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" className="animate-spin">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                  <span>Summarizing section...</span>
                </div>
              )}
              {summaryState === 'error' && (
                <div className="ai-modal-error">
                  <p>Could not generate summary.</p>
                  <button
                    type="button"
                    onClick={() => { cache.current = null; setSummaryState('idle'); openSummary() }}
                    className="ai-modal-retry-btn"
                  >
                    Retry
                  </button>
                </div>
              )}
              {summaryState === 'done' && bullets.map((b, i) => (
                <div key={`${b}-${i}`} className="ai-bullet anim-fade-up" style={{ animationDelay: `${i * 55}ms` }}>
                  <span className="ai-bullet-num">{i + 1}</span>
                  <span className="ai-bullet-text">{b}</span>
                </div>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}
    </motion.div>
  )
}
