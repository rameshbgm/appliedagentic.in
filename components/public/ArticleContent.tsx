'use client'
// components/public/ArticleContent.tsx
import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import MarkdownRenderer from './MarkdownRenderer'

interface Props {
  content: string
  standalone?: boolean
}

export default function ArticleContent({ content, standalone }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const root = ref.current

    // ── Heading IDs for TOC ──────────────────────────────────────────────────
    // Deduplicate against any IDs already present in the document so that when
    // multiple sections contain headings with the same text the second one gets
    // a "-2" suffix (matching what TableOfContents.parseHeadings generates).
    root.querySelectorAll('h1, h2, h3').forEach((el) => {
      if (!el.id) {
        const base = (el.textContent ?? '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
        let id = base
        let n = 2
        while (document.getElementById(id) && document.getElementById(id) !== el) {
          id = `${base}-${n++}`
        }
        el.id = id
      }
    })

    // ── Copy buttons on code blocks ──────────────────────────────────────────
    root.querySelectorAll('pre').forEach((pre) => {
      if (pre.querySelector('.copy-btn')) return
      const btn = document.createElement('button')
      btn.className =
        'copy-btn absolute top-2 right-2 p-2.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors sm:opacity-0 sm:group-hover/pre:opacity-100'
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
    <div ref={ref} className="article-content" suppressHydrationWarning>
      <MarkdownRenderer content={content} />
    </div>
  )
}
