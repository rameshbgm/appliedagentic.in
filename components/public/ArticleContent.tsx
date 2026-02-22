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

    // ── Scroll-reveal —— tag each element, then observe ──────────────────────
    const targets = root.querySelectorAll(
      'h1, h2, h3, h4, p, blockquote, pre, img, ul, ol, table, figure'
    )

    let staggerIdx = 0
    targets.forEach((el) => {
      // skip already-revealed (hot-reload safety)
      if (el.classList.contains('reveal-visible')) return
      el.classList.add('reveal-hidden')
      // Stagger: max 320 ms total, 55 ms per item  
      ;(el as HTMLElement).style.transitionDelay = `${Math.min(staggerIdx * 55, 320)}ms`
      staggerIdx++
    })

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          const el = entry.target as HTMLElement
          el.classList.remove('reveal-hidden')
          el.classList.add('reveal-visible')
          // clear delay after transition so it doesn't affect re-entry
          setTimeout(() => { el.style.transitionDelay = '' }, 700)
          io.unobserve(el)
        })
      },
      { threshold: 0.08, rootMargin: '0px 0px -50px 0px' }
    )

    targets.forEach((el) => io.observe(el))

    return () => io.disconnect()
  }, [content])

  return (
    <div
      ref={ref}
      className="article-content"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}
