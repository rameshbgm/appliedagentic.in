'use client'
// components/public/HeroSection.tsx
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Zap, Sparkles } from 'lucide-react'

const WORDS = ['AI Agents', 'LLM Systems', 'RAG Pipelines', 'Agentic AI', 'MCP Servers', 'Multi-Agent']

export default function HeroSection() {
  const [wordIdx, setWordIdx]         = useState(0)
  const [displayWord, setDisplayWord] = useState('')
  const [phase, setPhase]             = useState<'typing' | 'pause' | 'erasing'>('typing')
  const charRef                       = useRef(0)

  // Stale-closure-free typewriter
  useEffect(() => {
    const word = WORDS[wordIdx]
    let timer: ReturnType<typeof setTimeout>

    if (phase === 'typing') {
      charRef.current = 0
      const tick = () => {
        charRef.current++
        setDisplayWord(word.slice(0, charRef.current))
        if (charRef.current < word.length) timer = setTimeout(tick, 80)
        else timer = setTimeout(() => setPhase('pause'), 1800)
      }
      tick()
    } else if (phase === 'pause') {
      setPhase('erasing')
    } else {
      const erase = () => {
        setDisplayWord((cur) => {
          if (cur.length <= 1) {
            timer = setTimeout(() => { setWordIdx((n) => (n + 1) % WORDS.length); setPhase('typing') }, 120)
            return ''
          }
          timer = setTimeout(erase, 40)
          return cur.slice(0, -1)
        })
      }
      timer = setTimeout(erase, 40)
    }
    return () => clearTimeout(timer)
  }, [wordIdx, phase])

  const stats = [
    { value: '8',    label: 'Learning Modules'  },
    { value: '50+',  label: 'In-depth Articles' },
    { value: '100%', label: 'Free to Read'       },
    { value: 'Live', label: 'AI Content'         },
  ]

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-(--nav-h)">

      {/* CSS-only animated background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0" style={{ background: 'var(--bg-page)' }} />
        <div className="absolute" style={{
          top: '10%', left: '15%', width: '40vw', height: '40vw', maxWidth: 640, maxHeight: 640,
          borderRadius: '50%',
          background: 'radial-gradient(circle,rgba(124,58,237,0.22) 0%,transparent 68%)',
          filter: 'blur(56px)',
        }} />
        <div className="absolute" style={{
          bottom: '12%', right: '12%', width: '32vw', height: '32vw', maxWidth: 520, maxHeight: 520,
          borderRadius: '50%',
          background: 'radial-gradient(circle,rgba(6,182,212,0.17) 0%,transparent 68%)',
          filter: 'blur(48px)',
        }} />
        <div className="absolute inset-0 opacity-[0.025]" style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px)',
          backgroundSize: '48px 48px',
        }} />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-5">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[12px] font-semibold mb-8"
          style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)', color: '#A78BFA' }}>
          <Sparkles size={12} />
          The Applied AI Knowledge Hub
        </div>

        {/* Headline */}
        <h1 className="font-bold mb-5 leading-[1.1] tracking-tight" style={{ fontFamily: "'DM Sans',sans-serif" }}>
          <span className="block" style={{ color: 'var(--text-primary)' }}>Master</span>
          <span className="block g-text" style={{ minHeight: '1.1em' }}>
            {displayWord || '\u00A0'}
            <span className="animate-pulse" style={{ color: 'var(--violet-light)' }}>|</span>
          </span>
        </h1>

        {/* Sub-headline */}
        <p className="text-base md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          Deep-dive into AI agents, LLMs, RAG pipelines, prompt engineering and
          modern agentic systems — with practical, production-grade content.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/modules" className="btn-primary">
            <Zap size={16} />Explore Modules<ArrowRight size={15} />
          </Link>
          <Link href="/articles" className="btn-ghost">Browse Articles</Link>
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap items-center justify-center gap-8 mt-16 pt-8"
          style={{ borderTop: '1px solid var(--bg-border)' }}>
          {stats.map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="font-bold text-3xl g-text" style={{ fontFamily: "'DM Sans',sans-serif" }}>{value}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
