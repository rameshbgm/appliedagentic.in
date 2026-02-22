'use client'
// components/public/ArticleReaderTools.tsx

import { useEffect, useState, useCallback } from 'react'
import {
  SunMoon, Bot,
  AArrowUp, AArrowDown, X, Loader2,
} from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  content: string
  mobile?: boolean
}

const DEFAULT_SIZE = 16
const MIN_SIZE = 10
const MAX_SIZE = 25

export default function ArticleReaderTools({ content, mobile = false }: Props) {
  // ── Theme ─────────────────────────────────────────────────────────────────
  const [theme, setThemeState] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    const stored = localStorage.getItem('aa-theme') as 'dark' | 'light' | null
    const initial = stored ?? (document.documentElement.getAttribute('data-theme') as 'dark' | 'light') ?? 'dark'
    setThemeState(initial)
  }, [])

  const toggleTheme = useCallback(() => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setThemeState(next)
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('aa-theme', next)
  }, [theme])

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
        body: JSON.stringify({ content }),
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

  const stripClass = `art-tools-strip${mobile ? ' mobile' : ''}`

  return (
    <>
      {/* ── Tool strip ─────────────────────────────────────────────────────── */}
      <div className={stripClass} role="toolbar" aria-label="Article reader tools">

        {/* Theme toggle */}
        <button
          className={`tool-btn${theme === 'light' ? ' active' : ''}`}
          onClick={toggleTheme}
          data-tip={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          aria-label="Toggle theme"
        >
          <SunMoon size={16} />
        </button>

        <div className="art-tools-divider" />

        {/* AI Summary */}
        <button
          className={`tool-btn${aiState === 'done' ? ' active' : ''}`}
          onClick={summarize}
          data-tip="AI summary"
          aria-label="AI summarize article"
        >
          {aiState === 'loading' ? <Loader2 size={16} className="animate-spin" /> : <Bot size={16} />}
        </button>

        <div className="art-tools-divider" />

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
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          AI SUMMARY MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      {aiOpen && (
        <div
          className="reader-overlay ai-overlay"
          role="dialog"
          aria-modal
          aria-label="AI Summary"
          onClick={(e) => { if (e.target === e.currentTarget) setAiOpen(false) }}
        >
          <div className="ai-summary-modal">
            <div className="reader-overlay-header">
              <span className="reader-overlay-title">
                <Bot size={14} style={{ display: 'inline', marginRight: 7, verticalAlign: 'middle', color: 'var(--green)' }} />
                AI Summary — 10 key points
              </span>
              <button className="reader-overlay-close" onClick={() => setAiOpen(false)} aria-label="Close">
                <X size={16} />
              </button>
            </div>

            <div className="ai-summary-body">
              {aiState === 'loading' && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '40px 0', color: 'var(--text-muted)' }}>
                  <Loader2 size={28} className="animate-spin" style={{ color: 'var(--green)' }} />
                  <span style={{ fontSize: 13 }}>Summarizing article…</span>
                </div>
              )}
              {aiState === 'error' && (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 12 }}>
                    Could not generate summary. Please try again.
                  </p>
                  <button
                    onClick={() => { setAiState('idle'); }}
                    style={{
                      padding: '7px 18px', borderRadius: 8, border: '1px solid var(--bg-border)',
                      background: 'var(--bg-elevated)', color: 'var(--text-secondary)', fontSize: 13,
                      cursor: 'pointer',
                    }}
                  >
                    Retry
                  </button>
                </div>
              )}
              {aiState === 'done' && bullets.map((b, i) => (
                <div key={i} className="ai-bullet anim-fade-up" style={{ animationDelay: `${i * 55}ms` }}>
                  <span className="ai-bullet-num">{i + 1}</span>
                  <span className="ai-bullet-text">{b}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
