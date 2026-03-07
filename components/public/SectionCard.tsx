'use client'
// components/public/SectionCard.tsx

import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { toast } from 'sonner'
import ArticleContent from './ArticleContent'

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

interface Section {
  id: number
  title: string
  content: string
  order: number
}

interface Props {
  section: Section
  index: number
  gradientIndex: number
}

type SummaryState = 'idle' | 'loading' | 'done' | 'error'

export default function SectionCard({ section, index, gradientIndex }: Props) {
  const hasTitle = Boolean(section.title?.trim())
  const titleId = hasTitle
    ? section.title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    : `section-${index + 1}`

  const gradient = SECTION_GRADIENTS[gradientIndex % SECTION_GRADIENTS.length]

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

  return (
    <div className="section-optional" id={`section-${index + 1}`}>

      {hasTitle && (
        <div id={titleId} className="section-optional-header">
          <span className="section-optional-badge">{index + 1}</span>

          {/* Gradient applied to text (font color), not background */}
          <span
            className="section-optional-title section-title-gradient"
            style={{ backgroundImage: gradient }}
          >
            {section.title}
          </span>

          {/* AI summarize — only on the section header */}
          <button
            type="button"
            className="section-ai-btn section-ai-header-btn"
            title="AI summary of this section"
            onClick={openSummary}
            dangerouslySetInnerHTML={{ __html: BOT_SVG }}
          />
        </div>
      )}

      {section.content && (
        <div className="section-optional-body">
          <ArticleContent
            content={section.content}
            standalone
          />
        </div>
      )}

      {/* ── Section AI Summary Modal (portal, per-card) ────────────────────── */}
      {summaryOpen && typeof document !== 'undefined' && createPortal(
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
                    className="truncate max-w-[260px] block"
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
    </div>
  )
}
