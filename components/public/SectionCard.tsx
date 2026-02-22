'use client'
// components/public/SectionCard.tsx
// Public article section card — mirrors admin editor section UI.
// Animates itself into view on scroll; uses standalone ArticleContent mode.

import { useEffect, useRef } from 'react'
import ArticleContent from './ArticleContent'

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
  const cardRef = useRef<HTMLDivElement>(null)

  // Slide the card in when it enters the viewport
  useEffect(() => {
    const el = cardRef.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('section-visible')
          io.unobserve(entry.target)
        })
      },
      { threshold: 0.05, rootMargin: '0px 0px -60px 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const hasTitle = Boolean(section.title?.trim())
  const titleId = hasTitle
    ? section.title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    : `section-${index + 1}`

  return (
    <div
      ref={cardRef}
      className="section-optional"
      id={`section-${index + 1}`}
    >
      {/* Header — only shown when a title is set ("optional") */}
      {hasTitle && (
        <div
          id={titleId}
          className="section-optional-header"
        >
          <span className="section-optional-badge">{index + 1}</span>
          <span className="section-optional-title">{section.title}</span>
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
