'use client'
// components/public/MobileArticlePanel.tsx
// Hamburger on the LEFT → slide-in panel from left with Reader Tools (top) + TOC

import { useState, useEffect } from 'react'
import { AlignLeft, ArrowRight, X } from 'lucide-react'
import TableOfContents from './TableOfContents'
import ArticleReaderTools from './ArticleReaderTools'

interface SectionLike {
  id: number
  title: string
  content: string
  order: number
}

interface Props {
  sections: SectionLike[]
  content: string
}

export default function MobileArticlePanel({ sections, content }: Props) {
  const [open, setOpen] = useState(false)

  // Lock body scroll when panel is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open])

  return (
    <>
      {/* ── Hamburger button — left side, just below navbar ── */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open Reader Tools and Table of Contents"
          style={{
            position: 'fixed',
            left: 0,
            top: 'var(--nav-h, 64px)',
            zIndex: 45,
            background: 'var(--bg-surface)',
            border: '1px solid var(--bg-border)',
            borderLeft: 'none',
            borderTop: 'none',
            borderBottom: 'none',
            height: '32px',
            borderRadius: '0 8px 8px 0',
            boxShadow: '2px 4px 12px rgba(0,0,0,0.08)',
            padding: '0 8px',
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <ArrowRight size={13} />
        </button>
      )}

      {/* ── Backdrop ── */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 46,
            background: 'rgba(0,0,0,0.35)',
            backdropFilter: 'blur(2px)',
          }}
          aria-hidden
        />
      )}

      {/* ── Slide-in panel from LEFT ── */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Reader Tools and Table of Contents"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 47,
          width: 'min(88vw, 320px)',
          background: 'var(--bg-surface)',
          borderRight: '1px solid var(--bg-border)',
          boxShadow: '8px 0 40px rgba(0,0,0,0.18)',
          display: 'flex',
          flexDirection: 'column',
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.28s cubic-bezier(0.32, 0, 0.14, 1)',
          overflowY: 'auto',
          overscrollBehavior: 'contain',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {/* Panel header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 16px 12px',
            borderBottom: '1px solid var(--bg-border)',
            position: 'sticky',
            top: 0,
            background: 'var(--bg-surface)',
            zIndex: 1,
          }}
        >
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <AlignLeft size={14} style={{ color: 'var(--text-muted)' }} />
            Reader Tools
          </span>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close panel"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              borderRadius: 8,
              border: '1px solid var(--bg-border)',
              background: 'var(--bg-elevated)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Reader Tools — top */}
        <div style={{ padding: '8px 0 4px', borderBottom: '1px solid var(--bg-border)' }}>
          <ArticleReaderTools content={content} inline />
        </div>

        {/* TOC — below reader tools, no "Contents" header */}
        <div style={{ flex: 1 }}>
          <TableOfContents
            mobileFlat
            sections={sections.length > 0 ? sections : undefined}
            content={sections.length === 0 ? content : undefined}
            onSelect={() => setOpen(false)}
          />
        </div>
      </div>
    </>
  )
}
