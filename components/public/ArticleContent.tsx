'use client'
// components/public/ArticleContent.tsx
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import MarkdownRenderer from './MarkdownRenderer'

const BOT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>`

interface Props {
  content: string
  sectionIndex?: number
  sectionTitle?: string
  standalone?: boolean
}

export default function ArticleContent({ content, sectionIndex, sectionTitle, standalone }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  // ── Section AI summary state ────────────────────────────────────────────────
  type SecModalState = { title: string; state: 'loading' | 'done' | 'error'; bullets: string[] } | null
  const [secModal, setSecModal] = useState<SecModalState>(null)

  // ── Listen for section-summarize events (avoids stale closure in useEffect) ─
  useEffect(() => {
    const handler = async (e: Event) => {
      const { title, content: sectionContent } = (e as CustomEvent<{ title: string; content: string }>).detail
      setSecModal({ title, state: 'loading', bullets: [] })
      // Lock scroll
      document.body.style.overflow = 'hidden'
      try {
        const res = await fetch('/api/ai/summarize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: sectionContent, maxPoints: 7, type: 'section' }),
        })
        const data = await res.json()
        if (!res.ok || !data.data?.bullets) throw new Error(data.message ?? 'Failed')
        setSecModal({ title, state: 'done', bullets: data.data.bullets })
      } catch (err) {
        setSecModal((prev) => prev ? { ...prev, state: 'error' } : null)
        toast.error(err instanceof Error ? err.message : 'Section summary failed')
      }
    }
    window.addEventListener('aa-section-summarize', handler)
    return () => window.removeEventListener('aa-section-summarize', handler)
  }, [])

  // Restore scroll when modal closes
  useEffect(() => {
    if (!secModal) document.body.style.overflow = ''
  }, [secModal])

  // Keyboard: close on Escape
  useEffect(() => {
    if (!secModal) return
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') { setSecModal(null); document.body.style.overflow = '' } }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [secModal])

  useEffect(() => {
    if (!ref.current) return
    const root = ref.current

    // ── Heading IDs for TOC ──────────────────────────────────────────────────
    root.querySelectorAll('h1, h2, h3').forEach((el) => {
      if (!el.id) {
        el.id = (el.textContent ?? '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
      }
    })

    // ── Bot icon on h2/h3 for section summarize ───────────────────────────────
    root.querySelectorAll('h2, h3').forEach((heading) => {
      if (heading.querySelector('.section-ai-btn')) return
      const btn = document.createElement('button')
      btn.className = 'section-ai-btn'
      btn.title = 'Summarize this section (7 key points)'
      btn.innerHTML = BOT_SVG
      btn.addEventListener('click', (ev) => {
        ev.stopPropagation()
        // Collect section text: heading + siblings until the next h2/h3
        const parts: string[] = [heading.textContent ?? '']
        let node = heading.nextSibling
        while (node) {
          const el = node as Element
          if (el.nodeType === 1 && /^H[12]$/.test(el.tagName ?? '')) break
          if (el.textContent) parts.push(el.textContent.trim())
          node = node.nextSibling
        }
        // Fallback: use parent section innerHTML
        const sectionEl = heading.closest('.article-section')
        const sectionContent = sectionEl ? (sectionEl as HTMLElement).innerText : parts.join('\n')
        window.dispatchEvent(new CustomEvent('aa-section-summarize', {
          detail: { title: heading.textContent?.trim() ?? 'Section', content: sectionContent },
        }))
      })
      // Wrap existing text nodes so the heading can flex: [text] [icon-right]
      if (!heading.querySelector('.section-heading-text')) {
        const textNodes: Node[] = []
        heading.childNodes.forEach((n) => { if (n !== btn) textNodes.push(n) })
        const textWrap = document.createElement('span')
        textWrap.className = 'section-heading-text'
        textNodes.forEach((n) => textWrap.appendChild(n))
        heading.insertBefore(textWrap, heading.firstChild)
      }
      heading.appendChild(btn)
    })

    // ── Copy buttons on code blocks ──────────────────────────────────────────
    root.querySelectorAll('pre').forEach((pre) => {
      if (pre.querySelector('.copy-btn')) return
      const btn = document.createElement('button')
      btn.className =
        'copy-btn absolute top-3 right-3 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors opacity-0 group-hover/pre:opacity-100'
      btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>`
      btn.style.color = '#fff'
      btn.addEventListener('click', async () => {
        const code = pre.querySelector('code')?.textContent ?? ''
        await navigator.clipboard.writeText(code)
        btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1E293B" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`
        toast.success('Code copied!')
        setTimeout(() => {
          btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>`
        }, 2000)
      })
      pre.style.position = 'relative'
      pre.classList.add('group/pre')
      pre.appendChild(btn)
    })

    // ── Section mode: H1-wrapping (legacy single-content or standalone) ─────
    // Skipped when `standalone` is true — sections are already delimited by DB.
    if (!standalone && !root.querySelector('.article-section')) {
      type Group = { h1: Element | null; nodes: ChildNode[] }
      const groups: Group[] = []
      let current: Group = { h1: null, nodes: [] }

      Array.from(root.childNodes).forEach((node) => {
        const el = node as Element
        if (el.tagName === 'H1') {
          if (current.h1 || current.nodes.length > 0) groups.push(current)
          current = { h1: el, nodes: [] }
        } else {
          current.nodes.push(node)
        }
      })
      if (current.h1 || current.nodes.length > 0) groups.push(current)

      groups.forEach(({ h1, nodes }) => {
        if (!h1) return
        const section = document.createElement('section')
        section.className = 'article-section article-section-slide'
        root.insertBefore(section, h1)
        section.appendChild(h1)
        nodes.forEach((n) => section.appendChild(n))
      })
    }

    return () => {}
  }, [content])

  return (
    <>
      <div ref={ref} className="article-content" suppressHydrationWarning>
        <MarkdownRenderer content={content} />
      </div>

      {/* ── Section AI Summary Modal ──────────────────────────────────────── */}
      {secModal && (
        <div
          className="ai-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Section AI Summary"
          onClick={(e) => { if (e.target === e.currentTarget) { setSecModal(null); document.body.style.overflow = '' } }}
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
                    title={secModal.title}
                  >
                    {secModal.title}
                  </span>
                </span>
              </span>
              <button
                type="button"
                className="ai-modal-close"
                onClick={() => { setSecModal(null); document.body.style.overflow = '' }}
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div className="ai-modal-body">
              {secModal.state === 'loading' && (
                <div className="ai-modal-loading">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" className="animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                  <span>Summarizing section...</span>
                </div>
              )}
              {secModal.state === 'error' && (
                <div className="ai-modal-error">
                  <p>Could not generate summary.</p>
                  <button
                    type="button"
                    onClick={() => {
                      const title = secModal.title
                      setSecModal({ title, state: 'loading', bullets: [] })
                    }}
                    className="ai-modal-retry-btn"
                  >
                    Retry
                  </button>
                </div>
              )}
              {secModal.state === 'done' && secModal.bullets.map((b, i) => (
                <div key={`${b}-${i}`} className="ai-bullet anim-fade-up" style={{ animationDelay: `${i * 55}ms` }}>
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
