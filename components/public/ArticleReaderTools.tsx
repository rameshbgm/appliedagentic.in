'use client'
// components/public/ArticleReaderTools.tsx

import { useEffect, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import {
  Bot,
  AArrowUp, AArrowDown, X, Loader2, Sun, Moon,
} from 'lucide-react'
import { toast } from 'sonner'
import { featureFlags } from '@/content/features'

interface Props {
  content: string
  mobile?: boolean
  /** Render horizontally inline in the document flow (no fixed positioning) */
  inline?: boolean
}

const DEFAULT_SIZE = 16
const MIN_SIZE = 10
const MAX_SIZE = 25

export default function ArticleReaderTools({ content, mobile = false, inline = false }: Props) {
  // ── Font size ──────────────────────────────────────────────────────────────
  const [fontSize, setFontSizeState] = useState<number>(DEFAULT_SIZE)

  useEffect(() => {
    const stored = localStorage.getItem('aa-article-font-size')
    const val = stored ? parseInt(stored, 10) : DEFAULT_SIZE
    const clamped = Math.min(MAX_SIZE, Math.max(MIN_SIZE, val))
    setFontSizeState(clamped)
    document.documentElement.style.setProperty('--article-font-size', `${clamped}px`)
  }, [])

  const adjustFont = useCallback((delta: number) => {
    setFontSizeState((prev) => {
      const next = Math.min(MAX_SIZE, Math.max(MIN_SIZE, prev + delta))
      document.documentElement.style.setProperty('--article-font-size', `${next}px`)
      localStorage.setItem('aa-article-font-size', String(next))
      return next
    })
  }, [])

  // ── Article theme (dark / light) — scoped to .article-page only ──────────
  const [articleTheme, setArticleTheme] = useState<'dark' | 'light'>('light')

  useEffect(() => {
    const stored = (localStorage.getItem('aa-article-theme') ?? 'light') as 'dark' | 'light'
    setArticleTheme(stored)
    const page = document.querySelector('.article-page')
    if (stored === 'light') page?.classList.add('article-theme-light')
  }, [])

  const toggleArticleTheme = useCallback(() => {
    setArticleTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark'
      localStorage.setItem('aa-article-theme', next)
      const page = document.querySelector('.article-page')
      if (next === 'light') page?.classList.add('article-theme-light')
      else page?.classList.remove('article-theme-light')
      return next
    })
  }, [])

  // ── AI Summary ────────────────────────────────────────────────────────────
  const [aiOpen, setAiOpen] = useState(false)
  const [aiState, setAiState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [bullets, setBullets] = useState<string[]>([])

  const summarize = useCallback(async () => {
    setAiOpen(true)
    if (aiState === 'done') return
    setAiState('loading')
    try {
      const res = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, type: 'article' }),
      })
      const data = await res.json()
      if (!res.ok || !data.data?.bullets) throw new Error(data.message ?? 'Summarization failed')
      setBullets(data.data.bullets)
      setAiState('done')
    } catch (err) {
      setAiState('error')
      toast.error(err instanceof Error ? err.message : 'AI summary failed')
    }
  }, [content, aiState])

  // ── Lock body scroll when AI overlay is open ──────────────────────────────
  useEffect(() => {
    document.body.style.overflow = aiOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [aiOpen])

  // ── Keyboard: close AI overlay on Escape ──────────────────────────────────
  useEffect(() => {
    if (!aiOpen) return
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') setAiOpen(false) }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [aiOpen])

  const stripClass = `art-tools-strip${mobile ? ' mobile' : ''}${inline ? ' inline' : ''}`

  return (
    <>
      {/* ── Tool strip ─────────────────────────────────────────────────────── */}
      <div className={stripClass} role="toolbar" aria-label="Article reader tools">

        {/* AI Summary — only shown when featureFlags.aiSummary is true */}
        {featureFlags.aiSummary && (
          <>
            <button
              className={`tool-btn${aiState === 'done' ? ' active' : ''}`}
              onClick={summarize}
              data-tip="AI summary"
              aria-label="AI summarize article"
            >
              {aiState === 'loading' ? <Loader2 size={16} className="animate-spin" /> : <Bot size={16} />}
            </button>

            <div className="art-tools-divider" />
          </>
        )}

        {/* Font size */}
        <button
          className="tool-btn"
          onClick={() => adjustFont(1)}
          data-tip={`Increase font (${fontSize}px)`}
          aria-label="Increase font size"
          disabled={fontSize >= MAX_SIZE}
        >
          <AArrowUp size={16} />
        </button>

        <span className="tool-font-label">{fontSize}</span>

        <button
          className="tool-btn"
          onClick={() => adjustFont(-1)}
          data-tip={`Decrease font (${fontSize}px)`}
          aria-label="Decrease font size"
          disabled={fontSize <= MIN_SIZE}
        >
          <AArrowDown size={16} />
        </button>

        <div className="art-tools-divider" />

        {/* Theme toggle */}
        <button
          type="button"
          className={`tool-btn${articleTheme === 'light' ? ' active' : ''}`}
          onClick={toggleArticleTheme}
          data-tip={articleTheme === 'dark' ? 'Switch to light' : 'Switch to dark'}
          aria-label="Toggle article theme"
        >
          {articleTheme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          AI SUMMARY POPUP MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      {featureFlags.aiSummary && aiOpen && createPortal(
        <div
          className="ai-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="AI Summary"
          onClick={(e) => { if (e.target === e.currentTarget) setAiOpen(false) }}
        >
          <div className="ai-modal-container">
            {/* Modal header */}
            <div className="ai-modal-header">
              <span className="ai-modal-title">
                <Bot size={16} style={{ color: 'var(--green)' }} />
                AI Summary — {bullets.length || 12} key points
              </span>
              <button
                className="ai-modal-close"
                onClick={() => setAiOpen(false)}
                aria-label="Close AI Summary"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal body */}
            <div className="ai-modal-body">
              {aiState === 'loading' && (
                <div className="ai-modal-loading">
                  <Loader2 size={28} className="animate-spin" style={{ color: 'var(--green)' }} />
                  <span>Summarizing article...</span>
                </div>
              )}
              {aiState === 'error' && (
                <div className="ai-modal-error">
                  <p>Could not generate summary. Please try again.</p>
                  <button
                    onClick={() => { setAiState('idle'); }}
                    className="ai-modal-retry-btn"
                  >
                    Retry
                  </button>
                </div>
              )}
              {aiState === 'done' && bullets.map((b, i) => (
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
    </>
  )
}
