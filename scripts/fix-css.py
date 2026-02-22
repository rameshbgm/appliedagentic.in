import re

# Fix HeroSection - rewrite entirely without animations
hero_content = """// components/public/HeroSection.tsx
import Link from 'next/link'
import { ArrowRight, Zap, Sparkles } from 'lucide-react'

export default function HeroSection() {
  const stats = [
    { value: '8',    label: 'Learning Modules'  },
    { value: '50+',  label: 'In-depth Articles' },
    { value: '100%', label: 'Free to Read'       },
    { value: 'Live', label: 'AI Content'         },
  ]

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
      {/* Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-5">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[12px] font-semibold mb-6"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--bg-border)', color: 'var(--green)' }}>
          <Sparkles size={12} />
          The Applied AI Knowledge Hub
        </div>

        {/* Headline */}
        <h1 className="font-bold mb-4 leading-[1.1] tracking-tight" style={{ fontFamily: "'Inter',sans-serif" }}>
          <span className="block" style={{ color: 'var(--text-primary)' }}>Master</span>
          <span className="block g-text">AI Agents</span>
        </h1>

        {/* Sub-headline */}
        <p className="text-base md:text-lg max-w-2xl mx-auto mb-8 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          Deep-dive into AI agents, LLMs, RAG pipelines, prompt engineering and
          modern agentic systems \u2014 with practical, production-grade content.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/modules" className="btn-primary">
            <Zap size={16} />Explore Modules<ArrowRight size={15} />
          </Link>
          <Link href="/articles" className="btn-ghost">Browse Articles</Link>
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap items-center justify-center gap-8 mt-10 pt-6"
          style={{ borderTop: '1px solid var(--bg-border)' }}>
          {stats.map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="font-bold text-3xl g-text" style={{ fontFamily: "'Inter',sans-serif" }}>{value}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
"""

with open('components/public/HeroSection.tsx', 'w', encoding='utf-8') as f:
    f.write(hero_content)

print('HeroSection rewritten')
