'use client'
// components/public/MobileArticlePanel.tsx
// Floating icon on the right → slide-in panel with TOC + Reader Tools

import { useState, useEffect } from 'react'
import { AlignLeft, X } from 'lucide-react'
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
      {/* ── Floating icon button (top-right, just below navbar) ── */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open Table of Contents and Reader Tools"
          style={{
            position: 'fixed',
            right: 0,
            // Align exactly with the sticky section header which sticks at var(--nav-h)
            top: 'var(--nav-h, 64px)',
            zIndex: 45,
            background: 'var(--bg-surface)',
            border: '1px solid var(--bg-border)',
            borderRight: 'none',
            borderTop: 'none',
            borderBottom: 'none',
            // Match the section header height — min 44px for touch target
            height: '44px',
            borderRadius: '0 0 0 10px',
            boxShadow: '-2px 4px 18px rgba(0,0,0,0.10)',
            padding: '0 11px',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
            cursor: 'pointer',
            color: 'var(--text-secondary)',
            minWidth: '44px',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <AlignLeft size={16} />
         
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

      {/* ── Slide-in panel from right ── */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Table of Contents and Reader Tools"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          zIndex: 47,
          width: 'min(88vw, 320px)',
          background: 'var(--bg-surface)',
          borderLeft: '1px solid var(--bg-border)',
          boxShadow: '-8px 0 40px rgba(0,0,0,0.18)',
          display: 'flex',
          flexDirection: 'column',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.28s cubic-bezier(0.32, 0, 0.14, 1)',
          overflowY: 'auto',
          overscrollBehavior: 'contain',
          // Respect safe-area on notched devices
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
            Navigation
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

        {/* TOC — flat mobile render */}
        <div style={{ flex: 1 }}>
          <TableOfContents
            mobileFlat
            sections={sections.length > 0 ? sections : undefined}
            content={sections.length === 0 ? content : undefined}
          />
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--bg-border)', margin: '0 16px' }} />

        {/* Reader Tools */}
        <div style={{ padding: '8px 0 4px' }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.09em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              padding: '6px 20px 4px',
            }}
          >
            Reader Tools
          </p>
          <ArticleReaderTools content={content} inline />
        </div>
      </div>
    </>
  )
}
