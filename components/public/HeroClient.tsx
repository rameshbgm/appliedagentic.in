'use client'
// components/public/HeroClient.tsx
// Client-side hero — 2-column layout
// Left : headline + description + CTAs + stats
// Right: "Master" + typewriter

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { ArrowRight, Zap } from 'lucide-react'
import { heroContent } from '@/content/home'

interface Props {
  moduleCount:  number
  articleCount: number
}

// ─── Typewriter hook ───────────────────────────────────────────────────────────
function useTypewriter(words: string[], typingMs = 80, pauseMs = 1800, erasingMs = 50) {
  const [displayed, setDisplayed] = useState('')
  const [wordIdx,   setWordIdx]   = useState(0)
  const [phase,     setPhase]     = useState<'typing' | 'pausing' | 'erasing'>('typing')
  const charIdx = useRef(0)

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    if (phase === 'typing') {
      const word = words[wordIdx]
      if (charIdx.current < word.length) {
        timer = setTimeout(() => {
          charIdx.current++
          setDisplayed(word.slice(0, charIdx.current))
        }, typingMs)
      } else {
        timer = setTimeout(() => setPhase('pausing'), pauseMs)
      }
    } else if (phase === 'pausing') {
      setPhase('erasing')
    } else {
      if (charIdx.current > 0) {
        timer = setTimeout(() => {
          charIdx.current--
          setDisplayed(words[wordIdx].slice(0, charIdx.current))
        }, erasingMs)
      } else {
        setWordIdx((i) => (i + 1) % words.length)
        setPhase('typing')
      }
    }
    return () => clearTimeout(timer)
  })

  return displayed
}

// ─── Animated dots overlay ──────────────────────────────────────────────────
const DOTS = [
  { left: '4%',  bottom: '10%', dur: 8,    delay: 0    },
  { left: '10%', bottom: '55%', dur: 10.5, delay: 2.2  },
  { left: '17%', bottom: '30%', dur: 7.5,  delay: 4.8  },
  { left: '25%', bottom: '72%', dur: 9,    delay: 1.1  },
  { left: '32%', bottom: '20%', dur: 11,   delay: 3.5  },
  { left: '40%', bottom: '88%', dur: 8.5,  delay: 6.3  },
  { left: '48%', bottom: '45%', dur: 7,    delay: 0.7  },
  { left: '56%', bottom: '15%', dur: 9.5,  delay: 5.1  },
  { left: '63%', bottom: '63%', dur: 10,   delay: 2.8  },
  { left: '71%', bottom: '35%', dur: 7.8,  delay: 7.4  },
  { left: '79%', bottom: '80%', dur: 11.5, delay: 1.6  },
  { left: '86%', bottom: '50%', dur: 8.2,  delay: 4    },
  { left: '93%', bottom: '25%', dur: 9.2,  delay: 6    },
  { left: '7%',  bottom: '90%', dur: 7.3,  delay: 8    },
  { left: '52%', bottom: '5%',  dur: 10.8, delay: 3    },
] as const

function DotsLayer() {
  return (
    <div className="dots-layer" aria-hidden>
      {DOTS.map(({ left, bottom, dur, delay }, i) => (
        <span
          key={i}
          style={{
            left,
            bottom,
            animationDuration: `${dur}s`,
            animationDelay: `${delay}s`,
          }}
        />
      ))}
    </div>
  )
}

// ─── Hero Client ──────────────────────────────────────────────────────────────
export default function HeroClient({ moduleCount, articleCount }: Props) {
  const { headline, typewriterTopics, subheadline, ctas, staticStats, dynamicStatLabels, badge } =
    heroContent

  const typewritten = useTypewriter(typewriterTopics)

  const stats = [
    { value: String(moduleCount  || '8'),   label: dynamicStatLabels.modules  },
    { value: String(articleCount || '50+'), label: dynamicStatLabels.articles },
    ...staticStats,
  ]

  return (
    <section className="bg-dark pattern-dots relative flex flex-col md:flex-row justify-between items-center px-10 md:px-32 gap-10 overflow-hidden pt-10 sm:pt-14 pb-16 sm:pb-20">

      {/* ── animated dots ── */}
      <DotsLayer />

      {/* ── subtle cyan glow ── */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 70% at 75% 50%, rgba(6,182,212,0.06) 0%, transparent 70%)',
        }}
        aria-hidden
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-8 items-center">

        {/* ══════════════════════════════════════════════════
            LEFT COLUMN
        ══════════════════════════════════════════════════ */}
        <div className="flex flex-col items-center md:items-start gap-6 sm:gap-7 text-center md:text-left order-2 md:order-1">

          {/* Main display heading */}
          <h2
            className="glitch-text font-bold uppercase leading-[1.05] tracking-tight"
            data-text="The Applied AI Knowledge Hub"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 'clamp(2rem, 5vw, 3.75rem)',
              color: '#ffffff',
            }}
          >
            The Applied AI<br />Knowledge Hub
          </h2>

          {/* Description */}
          <p
            className="text-xs sm:text-sm leading-relaxed max-w-md"
            style={{ color: 'rgba(255,255,255,0.85)' }}
          >
            {subheadline}
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 sm:gap-4">
            <Link
              href={ctas.primary.href}
              className="inline-flex items-center gap-2 px-7 sm:px-9 py-3 sm:py-3.5 text-xs sm:text-sm font-bold uppercase tracking-widest text-neon bg-transparent border border-white/20 transition-all duration-200 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(255,255,255,0.1)] active:translate-y-0"
            >
              <Zap size={13} />
              {ctas.primary.label}
            </Link>

            <Link
              href={ctas.secondary.href}
              className="inline-flex items-center gap-2 rounded-full px-8 sm:px-10 py-3 sm:py-3.5 text-xs sm:text-sm font-bold uppercase tracking-widest transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'rgba(255,255,255,0.60)',
              }}
            >
              {ctas.secondary.label}
              <ArrowRight size={13} />
            </Link>
          </div>

          {/* Stats row */}
          <div
            className="flex flex-wrap items-center justify-center md:justify-start gap-5 sm:gap-8 pt-5 sm:pt-6 mt-1 w-full"
            style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
          >
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center md:text-left">
                <p
                  className="font-black"
                  style={{
                    fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)',
                    fontFamily: "'Inter',sans-serif",
                    lineHeight: 1,
                    color: '#ec4899',
                  }}
                >
                  {value}
                </p>
                <p
                  className="text-[10px] sm:text-[11px] font-medium uppercase tracking-widest mt-1"
                  style={{ color: 'rgba(255,255,255,0.35)' }}
                >
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            RIGHT COLUMN — "Master" + typewriter
        ══════════════════════════════════════════════════ */}
        <div className="flex flex-col items-center text-center order-1 md:order-2">
          <h1 className="font-sans font-black leading-none">
            <span className="block text-7xl md:text-[10vw] text-outline">
              {headline.line1}
            </span>

            {/* Typewriter — single line, smaller than Master */}
            <span
              className="block text-neon whitespace-nowrap"
              style={{ fontSize: 'clamp(1.4rem, 3.5vw, 2.4rem)', minHeight: '1.2em' }}
            >
              {typewritten}
              <span
                className="inline-block align-middle animate-pulse"
                style={{ width: '2px', height: '0.7em', background: '#06b6d4', marginLeft: '3px' }}
                aria-hidden
              />
            </span>
          </h1>
        </div>

      </div>
    </section>
  )
}
