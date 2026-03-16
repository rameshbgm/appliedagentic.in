'use client'
// components/public/HeroClient.tsx
// Client-side hero — 2-column layout
// Left : headline + description + CTAs + stats
// Right: "Master" + typewriter

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { ArrowRight, Zap } from 'lucide-react'
import { heroContent, heroRotatingMessages } from '@/content/home'
import { useArticleLoading } from '@/components/shared/ArticleLoadingContext'

interface Props {
  menuCount:    number
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

// ─── Rotating hero messages ────────────────────────────────────────────────────
const HERO_MESSAGES = [
  'Build, deploy, and reason about AI agents — from LLM fundamentals to production-ready agentic workflows.',
  'Go beyond prompting — understand the architecture behind autonomous, tool-using AI systems.',
  'From RAG pipelines to multi-agent orchestration — learn what actually works in production.',
  'Master the patterns that power real AI agents: memory, planning, tools, and reflection.',
  'The internet runs on APIs. The future runs on agents — learn to build both.',
  'Structured paths from first principles to deployed, reasoning AI systems.',
  'LLMs are the engine. Agents are the vehicle. Learn to drive.',
  'Explore the full stack of agentic AI — models, memory, tools, and orchestration layers.',
  'Every great AI product starts with understanding how language models reason and act.',
  'Cut through the hype — deep, practical knowledge on agentic systems that ship.',
  'From zero-shot prompts to autonomous agents that plan, act, and self-correct.',
  'Learn to build AI that doesn\'t just respond — it decides, acts, and adapts.',
  'The era of single-turn chatbots is over. Welcome to the age of agentic AI.',
  'Understand how agents perceive, reason, and act — then build your own.',
  'Production AI isn\'t about clever prompts — it\'s about robust, observable systems.',
  'RAG, tool-calling, memory, planning — master every pillar of modern agentic design.',
  'AI agents that work in the real world require more than a good model — learn what else.',
  'From transformer internals to deployment pipelines — deep coverage, zero fluff.',
  'Build agents that solve real problems, not just demos that impress for five minutes.',
  'The shift from assistants to agents is the biggest platform transition in software.',
  'Agentic AI is the new full-stack — understand the entire execution chain.',
  'Practical, production-focused content on LLMs, agents, RAG, and beyond.',
  'Learn how top teams are building reliable, observable, agentic AI systems today.',
  'Not tutorials — mental models. Not demos — deployable patterns.',
  'Go deep on the systems that will define how software is built for the next decade.',
  'Every module here is built around what actually ships, not what just looks good in a notebook.',
  'Understand why agents fail — and how to build ones that don\'t.',
  'Context windows, tool use, multi-step reasoning — the building blocks of agentic AI.',
  'AI agents that can browse, code, search, and synthesise — learn to orchestrate them.',
  'The next generation of software engineers will build with, around, and on top of LLMs.',
  'Grounding, retrieval, evaluation, and safety — the unglamorous parts that make AI real.',
  'Move from prompt curiosity to agentic systems engineering.',
  'Learn to design AI agents that are robust, auditable, and actually useful.',
  'The best agentic systems feel like magic from the outside and rock-solid engineering inside.',
  'Understand attention, embeddings, and reasoning chains — not just API calls.',
  'From local models to cloud-scale multi-agent pipelines — cover the full spectrum.',
  'Agentic AI rewards systems thinkers. Start thinking in systems.',
  'The foundations aren\'t optional — every great agent engineer understands the model first.',
  'Hands-on, structured, opinionated learning for serious AI builders.',
  'Retrieval-augmented generation done right — architecture, evaluation, and tradeoffs.',
  'Build agents with long-term memory, persistent state, and real-world tool access.',
  'Not just what LLMs can do — but how to reliably make them do it at scale.',
  'Every lesson here is written for engineers who want to ship, not just experiment.',
  'Autonomous agents need more than intelligence — they need guardrails and observability.',
  'From fine-tuning intuition to production RLHF — understand how models are shaped.',
  'Multi-agent systems, role specialization, and coordination patterns — covered in depth.',
  'The gap between AI demo and AI product is systems engineering. Bridge it here.',
  'Real-world agentic AI is part software, part product, part cognitive architecture.',
  'Knowledge graphs, vector stores, semantic search — the memory layer of modern AI.',
  'Applied means usable. Learn agentic AI the way professionals actually build it.',
]

const NEON_COLORS = [
  { color: '#60a5fa', glow1: 'rgba(96,165,250,0.85)',   glow2: 'rgba(96,165,250,0.4)'   },  // blue
  { color: '#34d399', glow1: 'rgba(52,211,153,0.85)',   glow2: 'rgba(52,211,153,0.4)'   },  // emerald
  { color: '#f472b6', glow1: 'rgba(244,114,182,0.85)',  glow2: 'rgba(244,114,182,0.4)'  },  // pink
  { color: '#a78bfa', glow1: 'rgba(167,139,250,0.85)',  glow2: 'rgba(167,139,250,0.4)'  },  // violet
  { color: '#fb923c', glow1: 'rgba(251,146,60,0.85)',   glow2: 'rgba(251,146,60,0.4)'   },  // orange
  { color: '#38bdf8', glow1: 'rgba(56,189,248,0.85)',   glow2: 'rgba(56,189,248,0.4)'   },  // sky
  { color: '#fbbf24', glow1: 'rgba(251,191,36,0.85)',   glow2: 'rgba(251,191,36,0.4)'   },  // amber
  { color: '#e879f9', glow1: 'rgba(232,121,249,0.85)',  glow2: 'rgba(232,121,249,0.4)'  },  // fuchsia
  { color: '#4ade80', glow1: 'rgba(74,222,128,0.85)',   glow2: 'rgba(74,222,128,0.4)'   },  // green
  { color: '#f87171', glow1: 'rgba(248,113,113,0.85)',  glow2: 'rgba(248,113,113,0.4)'  },  // red
]

function pickRandom<T>(arr: T[], exclude?: T): T {
  const filtered = exclude !== undefined ? arr.filter(x => x !== exclude) : arr
  return filtered[Math.floor(Math.random() * filtered.length)]
}


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
          key={`${left}-${bottom}-${dur}-${delay}`}
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
export default function HeroClient({ menuCount, articleCount }: Props) {
  const { headline, typewriterTopics, ctas, staticStats, dynamicStatLabels, badge } =
    heroContent

  const { showLoading } = useArticleLoading()
  const typewritten = useTypewriter(typewriterTopics)

  // Rotating message + neon color
  const [msgIndex, setMsgIndex]   = useState(0)
  const [neonIndex, setNeonIndex] = useState(0)
  const [fade, setFade]           = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false)
      setTimeout(() => {
        setMsgIndex(prev  => {
          const next = Math.floor(Math.random() * heroRotatingMessages.length)
          return next === prev ? (next + 1) % heroRotatingMessages.length : next
        })
        setNeonIndex(prev => {
          const next = Math.floor(Math.random() * NEON_COLORS.length)
          return next === prev ? (next + 1) % NEON_COLORS.length : next
        })
        setFade(true)
      }, 400)
    }, 7000)
    return () => clearInterval(interval)
  }, [])

  const stats = [
    { value: String(menuCount    || '8'),   label: dynamicStatLabels.modules  },
    { value: String(articleCount || '50+'), label: dynamicStatLabels.articles },
    ...staticStats,
  ]

  return (
    <section className="bg-dark pattern-dots relative flex flex-col md:flex-row justify-between items-center px-4 sm:px-8 md:px-16 lg:px-32 gap-10 overflow-hidden pt-10 sm:pt-14 pb-16 sm:pb-20">

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

          {/* Description — rotates every 7s with random neon color */}
          <p
            className="text-[13px] sm:text-[15px] max-w-md"
            style={{
              fontFamily: "'Literata', 'Source Serif 4', Georgia, serif",
              fontStyle: 'italic',
              lineHeight: '1.7',
              color: NEON_COLORS[neonIndex].color,
              textShadow: `0 0 8px ${NEON_COLORS[neonIndex].glow1}, 0 0 22px ${NEON_COLORS[neonIndex].glow2}`,
              opacity: fade ? 1 : 0,
              transition: 'opacity 0.4s ease',
            }}
          >
            {heroRotatingMessages[msgIndex]}
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 sm:gap-4">
            {/* Browse Topics */}
            <Link
              href={ctas.secondary.href}
              className="inline-flex items-center gap-2 px-7 sm:px-9 py-3 sm:py-3.5 text-xs sm:text-sm font-bold uppercase tracking-widest text-neon bg-transparent border border-white/20 transition-all duration-200 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(255,255,255,0.1)] active:translate-y-0"
            >
              <Zap size={13} />
              {ctas.secondary.label}
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
            <span className="block text-5xl sm:text-7xl md:text-[10vw] xl:text-[8vw] 2xl:text-[120px] text-outline">
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
