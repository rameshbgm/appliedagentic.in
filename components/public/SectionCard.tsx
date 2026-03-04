'use client'
// components/public/SectionCard.tsx
// Public article section card — mirrors admin editor section UI.
// Animates itself into view on scroll; uses standalone ArticleContent mode.

import ArticleContent from './ArticleContent'

const BOT_SVG_HEADER = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>`

interface Section {
  id: number
  title: string
  content: string
  order: number
}

interface Props {
  section: Section
  index: number
}

export default function SectionCard({ section, index }: Props) {

  const hasTitle = Boolean(section.title?.trim())
  const titleId = hasTitle
    ? section.title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    : `section-${index + 1}`

  return (
    <div
      className="section-optional"
      id={`section-${index + 1}`}
    >
      {/* Header — only shown when a title is set ("optional") */}
      {hasTitle && (
        <div
          id={titleId}
          className="section-optional-header"
        >
          {/* Left: badge + title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
            <span className="section-optional-badge">{index + 1}</span>
            <span className="section-optional-title">{section.title}</span>
            {/* AI summarize icon inline after title */}
            <button
              className="section-ai-btn section-ai-header-btn"
              title="Summarize this section (7 key points)"
              onClick={() => {
                window.dispatchEvent(new CustomEvent('aa-section-summarize', {
                  detail: { title: section.title, content: section.content },
                }))
              }}
              dangerouslySetInnerHTML={{ __html: BOT_SVG_HEADER }}
            />
          </div>
        </div>
      )}

      {/* Content body */}
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
