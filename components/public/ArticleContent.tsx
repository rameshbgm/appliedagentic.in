'use client'
// components/public/ArticleContent.tsx
import { useEffect, useRef } from 'react'
import { toast } from 'sonner'

interface Props {
  content: string
}

export default function ArticleContent({ content }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const root = ref.current

    // ── Heading IDs for TOC ──────────────────────────────────────────────────
    root.querySelectorAll('h2, h3').forEach((el) => {
      if (!el.id) {
        el.id = el.textContent?.toLowerCase().replace(/[^a-z0-9]+/g, '-') ?? ''
      }
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
        btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2ED573" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`
        toast.success('Code copied!')
        setTimeout(() => {
          btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>`
        }, 2000)
      })
      pre.style.position = 'relative'
      pre.classList.add('group/pre')
      pre.appendChild(btn)
    })

    // ── Wrap H1 + following siblings into <section class="article-section"> ──
    // Only run once (guard: section already exists)
    if (!root.querySelector('.article-section')) {
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
        if (!h1) return // preamble before first H1 — leave as-is
        const section = document.createElement('section')
        section.className = 'article-section article-section-slide'
        root.insertBefore(section, h1)
        section.appendChild(h1)
        nodes.forEach((n) => section.appendChild(n))
      })
    }

    // ── Observer 1: section slide (whole card) ───────────────────────────────
    const sectionIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('section-visible')
          sectionIo.unobserve(entry.target)
        })
      },
      { threshold: 0.06, rootMargin: '0px 0px -60px 0px' }
    )
    root.querySelectorAll('.article-section-slide').forEach((s) => sectionIo.observe(s))

    // ── Observer 2: per-element fade-up inside each section ──────────────────
    const innerIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          const el = entry.target as HTMLElement
          el.classList.remove('reveal-hidden')
          el.classList.add('reveal-visible')
          setTimeout(() => { el.style.transitionDelay = '' }, 750)
          innerIo.unobserve(el)
        })
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    )

    root.querySelectorAll('.article-section').forEach((section) => {
      const items = section.querySelectorAll(
        'h1, h2, h3, h4, p, blockquote, pre, img, ul, ol, table, figure'
      )
      items.forEach((el, i) => {
        if (el.classList.contains('reveal-visible')) return
        el.classList.add('reveal-hidden')
        ;(el as HTMLElement).style.transitionDelay = `${Math.min(i * 60, 300)}ms`
        innerIo.observe(el)
      })
    })

    // Also animate any preamble elements that weren't wrapped in a section
    root.querySelectorAll(':scope > h2, :scope > h3, :scope > h4, :scope > p, :scope > blockquote, :scope > pre, :scope > img, :scope > ul, :scope > ol, :scope > figure').forEach((el, i) => {
      if (el.classList.contains('reveal-visible')) return
      el.classList.add('reveal-hidden')
      ;(el as HTMLElement).style.transitionDelay = `${Math.min(i * 60, 300)}ms`
      innerIo.observe(el)
    })

    return () => { sectionIo.disconnect(); innerIo.disconnect() }
  }, [content])

  return (
    <div
      ref={ref}
      className="article-content"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}
