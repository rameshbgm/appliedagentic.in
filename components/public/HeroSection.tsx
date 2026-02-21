'use client'
// components/public/HeroSection.tsx
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Zap, Sparkles } from 'lucide-react'

const WORDS = ['AI Agents', 'LLM Systems', 'RAG Pipelines', 'Agentic AI', 'MCP Servers', 'Multi-Agent']

/* ── Three.js neural network background (same as loader) ─────────────────── */
function NeuralBackground() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const container = containerRef.current
    if (!container) return

    let animationId: number

    const init = async () => {
      const THREE = await import('three')

      const W = container.offsetWidth
      const H = container.offsetHeight

      const _scene = new THREE.Scene()
      const _camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 1000)
      _camera.position.z = 20

      const _renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      _renderer.setSize(W, H)
      _renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      _renderer.setClearColor(0x000000, 0) // transparent — hero bg shows through
      container.appendChild(_renderer.domElement)

      // Nodes
      const nodeCount = 80
      const nodes: InstanceType<typeof THREE.Mesh>[] = []
      const positions: InstanceType<typeof THREE.Vector3>[] = []
      const nodeGeo = new THREE.SphereGeometry(0.15, 8, 8)

      for (let i = 0; i < nodeCount; i++) {
        const x = (Math.random() - 0.5) * 30
        const y = (Math.random() - 0.5) * 20
        const z = (Math.random() - 0.5) * 15
        const hue = Math.random() > 0.5 ? 0.73 : 0.53 // violet or cyan
        const color = new THREE.Color().setHSL(hue, 1, 0.6 + Math.random() * 0.3)
        const node = new THREE.Mesh(nodeGeo, new THREE.MeshBasicMaterial({ color }))
        node.position.set(x, y, z)
        _scene.add(node)
        nodes.push(node)
        positions.push(new THREE.Vector3(x, y, z))
      }

      // Lines
      const linePoints: InstanceType<typeof THREE.Vector3>[] = []
      const threshold = 6
      for (let i = 0; i < nodeCount; i++) {
        for (let j = i + 1; j < nodeCount; j++) {
          if (positions[i].distanceTo(positions[j]) < threshold) {
            linePoints.push(positions[i].clone(), positions[j].clone())
          }
        }
      }
      const lineGeo = new THREE.BufferGeometry().setFromPoints(linePoints)
      const lineMat = new THREE.LineBasicMaterial({ color: 0x00D4FF, transparent: true, opacity: 0.25 })
      _scene.add(new THREE.LineSegments(lineGeo, lineMat))

      // Animate
      const clock = new THREE.Clock()
      const animate = () => {
        animationId = requestAnimationFrame(animate)
        const t = clock.getElapsedTime()
        _scene.rotation.y += 0.003
        _scene.rotation.x = Math.sin(t * 0.2) * 0.05
        nodes.forEach((node, i) => {
          node.scale.setScalar(1 + Math.sin(t * 2 + i * 0.3) * 0.03)
        })
        _renderer.render(_scene, _camera)
      }
      animate()

      // Resize
      const onResize = () => {
        const nW = container.offsetWidth
        const nH = container.offsetHeight
        _camera.aspect = nW / nH
        _camera.updateProjectionMatrix()
        _renderer.setSize(nW, nH)
      }
      const ro = new ResizeObserver(onResize)
      ro.observe(container)

      return () => {
        cancelAnimationFrame(animationId)
        ro.disconnect()
        _renderer.dispose()
        if (_renderer.domElement.parentNode === container) {
          container.removeChild(_renderer.domElement)
        }
      }
    }

    let cleanup: (() => void) | undefined
    init().then((fn) => { cleanup = fn }).catch(console.error)
    return () => { cleanup?.() }
  }, [])

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full"
      style={{ opacity: 0.5 }}
    />
  )
}

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
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
      <NeuralBackground />

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
          <span className="block g-text" style={{ minHeight: '1.1em' }}>
            {displayWord || '\u00A0'}
            <span className="animate-pulse" style={{ color: 'var(--green)' }}>|</span>
          </span>
        </h1>

        {/* Sub-headline */}
        <p className="text-base md:text-lg max-w-2xl mx-auto mb-8 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
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
