'use client'
// components/public/SectionCard.tsx

import ArticleContent from './ArticleContent'

const BOT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>`

// Curated gradient pairs — visually distinct, readable on light backgrounds
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

export default function SectionCard({ section, index, gradientIndex }: Props) {
  const hasTitle = Boolean(section.title?.trim())
  const titleId = hasTitle
    ? section.title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    : `section-${index + 1}`

  const gradient = SECTION_GRADIENTS[gradientIndex % SECTION_GRADIENTS.length]

  return (
    <div className="section-optional" id={`section-${index + 1}`}>

      {hasTitle && (
        <div id={titleId} className="section-optional-header">
          <span className="section-optional-badge">{index + 1}</span>

          <span
            className="section-optional-title section-title-gradient"
            style={{ backgroundImage: gradient }}
          >
            {section.title}
          </span>

          {/* AI summarize — only on the section header, not on H2/H3 */}
          <button
            type="button"
            className="section-ai-btn section-ai-header-btn"
            title="AI summary of this section"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('aa-section-summarize', {
                detail: { title: section.title, content: section.content },
              }))
            }}
            dangerouslySetInnerHTML={{ __html: BOT_SVG }}
          />
        </div>
      )}

      {section.content && (
        <div className="section-optional-body">
          <ArticleContent
            content={section.content}
            sectionIndex={index}
            standalone
          />
        </div>
      )}
    </div>
  )
}
