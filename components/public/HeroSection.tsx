'use client'
// components/public/HeroSection.tsx
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Zap, Star } from 'lucide-react'

const WORDS = ['AI Agents', 'LLM Systems', 'RAG Pipelines', 'Agentic AI', 'MCP Servers', 'Multi-Agent']

export default function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [wordIdx, setWordIdx] = useState(0)
  const [displayWord, setDisplayWord] = useState('')
  const [typing, setTyping] = useState(true)

  // Typewriter
  useEffect(() => {
    const word = WORDS[wordIdx]
    let i = 0
    let timer: ReturnType<typeof setTimeout>
    if (typing) {
      const tick = () => {
        setDisplayWord(word.slice(0, i + 1))
        i++
        if (i < word.length) timer = setTimeout(tick, 80)
        else setTimeout(() => setTyping(false), 1800)
      }
      tick()
    } else {
      const erase = () => {
        setDisplayWord((d) => d.slice(0, -1))
        if (displayWord.length > 1) timer = setTimeout(erase, 40)
        else {
          setWordIdx((n) => (n + 1) % WORDS.length)
          setTyping(true)
        }
      }
      timer = setTimeout(erase, 40)
    }
    return () => clearTimeout(timer)
  }, [wordIdx, typing]) // eslint-disable-line

  // Particle canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let animFrame: number

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2 + 0.5,
      alpha: Math.random() * 0.5 + 0.1,
    }))

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1

        // Draw connections
        particles.forEach((q) => {
          const d = Math.hypot(p.x - q.x, p.y - q.y)
          if (d < 100) {
            ctx.beginPath()
            ctx.strokeStyle = `rgba(108,61,255,${0.15 * (1 - d / 100)})`
            ctx.lineWidth = 0.5
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(q.x, q.y)
            ctx.stroke()
          }
        })

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(108,61,255,${p.alpha})`
        ctx.fill()
      })
      animFrame = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animFrame)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Particle canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #6C3DFF, transparent)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-15 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #00D4FF, transparent)' }} />

      {/* Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-8 text-sm font-medium"
          style={{ borderColor: 'rgba(108,61,255,0.4)', background: 'rgba(108,61,255,0.1)', color: '#A29BFE' }}>
          <Star size={14} className="text-yellow-400" fill="currentColor" />
          The Applied AI Knowledge Hub
        </div>

        <h1 className="font-display font-black text-5xl md:text-7xl lg:text-8xl leading-none mb-6">
          <span className="gradient-text">Master</span>
          <br />
          <span style={{ color: 'var(--text-primary)' }}>
            <span className="gradient-text">{displayWord}</span>
            <span className="animate-pulse">|</span>
          </span>
        </h1>

        <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          Deep-dive into AI agents, LLM architectures, RAG pipelines, prompt engineering and modern AI systems — with practical, production-grade content.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/modules"
            className="inline-flex items-center gap-2.5 px-7 py-4 rounded-2xl font-semibold text-white transition-transform hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #6C3DFF, #00D4FF)' }}
          >
            <Zap size={18} />
            Explore Modules
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/articles"
            className="inline-flex items-center gap-2.5 px-7 py-4 rounded-2xl font-semibold border transition-all hover:bg-white/5"
            style={{ borderColor: 'var(--bg-border)', color: 'var(--text-primary)' }}
          >
            Browse Articles
          </Link>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap items-center justify-center gap-8 mt-14 pt-8 border-t" style={{ borderColor: 'var(--bg-border)' }}>
          {[
            { value: '8', label: 'Learning Modules' },
            { value: '50+', label: 'In-depth Articles' },
            { value: '100%', label: 'Free to Read' },
            { value: 'AI', label: 'Powered Content' },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="font-display font-black text-3xl gradient-text">{value}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
