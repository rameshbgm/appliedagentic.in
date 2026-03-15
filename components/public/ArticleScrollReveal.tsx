'use client'
// components/public/ArticleScrollReveal.tsx
// Attaches IntersectionObserver to article elements.
// Only elements BELOW the viewport fold get animated — already-visible
// content is never hidden, eliminating any flash-of-invisible-content.

import { useEffect } from 'react'

// 10 animation variants — cycled across section cards
const SECTION_ANIMS = [
  'sa-tilt-up',
  'sa-blur-in',
  'sa-scale-soft',
  'sa-drift-left',
  'sa-rise-slow',
  'sa-drift-right',
  'sa-lift-soft',
  'sa-zoom-blur',
  'sa-fade-drop',
  'sa-rise',
]

export default function ArticleScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view')
            observer.unobserve(entry.target)
          }
        })
      },
      // -80px bottom margin: trigger slightly before the element fully enters
      { threshold: 0.05, rootMargin: '0px 0px -80px 0px' }
    )

    // Only animate elements that are below the visible fold.
    // Elements already on screen stay fully visible — no flash.
    const isBelowFold = (el: Element) => {
      const rect = el.getBoundingClientRect()
      return rect.top > window.innerHeight * 0.85
    }

    const reveal = (el: Element, anim: string, delayMs = 0) => {
      if (!isBelowFold(el)) return
      const h = el as HTMLElement
      h.classList.add('scroll-anim', anim)
      if (delayMs) h.style.animationDelay = `${delayMs}ms`
      observer.observe(el)
    }

    // ── Section cards — each gets a different animation, staggered ──────────
    document.querySelectorAll('.section-optional').forEach((el, i) => {
      reveal(el, SECTION_ANIMS[i % SECTION_ANIMS.length], Math.min(i * 55, 220))
    })

    // ── Article content elements — type-specific animations ─────────────────
    document.querySelectorAll('.article-content h2').forEach((el) => reveal(el, 'sa-fade-drop'))
    document.querySelectorAll('.article-content h3').forEach((el) => reveal(el, 'sa-blur-in'))
    document.querySelectorAll('.article-content h4').forEach((el) => reveal(el, 'sa-rise'))
    document.querySelectorAll('.article-content p').forEach((el)  => reveal(el, 'sa-rise'))
    document.querySelectorAll('.article-content blockquote').forEach((el) => reveal(el, 'sa-drift-left'))
    document.querySelectorAll('.article-content pre').forEach((el) => reveal(el, 'sa-scale-soft'))
    document.querySelectorAll('.article-content img').forEach((el) => reveal(el, 'sa-zoom-blur'))
    document.querySelectorAll('.article-content .table-scroll-wrapper').forEach((el) => reveal(el, 'sa-lift-soft'))
    document.querySelectorAll('.article-content ul, .article-content ol').forEach((el) => reveal(el, 'sa-lift-soft'))

    // ── Legacy single-content H1 sections ───────────────────────────────────
    document.querySelectorAll('.article-section').forEach((el, i) => {
      reveal(el, SECTION_ANIMS[i % SECTION_ANIMS.length], Math.min(i * 55, 220))
    })

    return () => observer.disconnect()
  }, [])

  return null
}
