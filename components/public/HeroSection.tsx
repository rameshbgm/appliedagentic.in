'use client'
// components/public/HeroSection.tsx
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Zap, Sparkles } from 'lucide-react'
import type * as THREE from 'three'

const WORDS = ['AI Agents', 'LLM Systems', 'RAG Pipelines', 'Agentic AI', 'MCP Servers', 'Multi-Agent']

/* ── Three.js neural-network background ────────────────────────────────── */
function HeroCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    let animationId: number
    let disposed = false

    const init = async () => {
      const THREE = await import('three')

      // Wait one tick so the container has measured dimensions
      await new Promise<void>((r) => requestAnimationFrame(() => r()))

      const container = containerRef.current
      if (!container || disposed) return

      const getW = () => container.clientWidth  || window.innerWidth
      const getH = () => container.clientHeight || window.innerHeight

      // Scene
      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(75, getW() / getH(), 0.1, 1000)
      camera.position.set(0, 0, 28)

      // Renderer — let CSS stretch the canvas
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setSize(getW(), getH())
      renderer.setClearColor(0x0A0A0F, 1)
      const canvas = renderer.domElement
      canvas.style.width  = '100%'
      canvas.style.height = '100%'
      container.appendChild(canvas)

      // ── 120 nodes spread across the full visible frustum ──────────
      const nodeCount = 120
      const nodes: THREE.Mesh[] = []
      const basePos: THREE.Vector3[]  = []
      const phases: number[]          = []
      const speeds: number[]          = []
      const nodeGeo = new THREE.SphereGeometry(0.17, 10, 10)

      for (let i = 0; i < nodeCount; i++) {
        // cover ±46 horizontal, ±30 vertical, ±22 depth
        const x = (Math.random() - 0.5) * 46
        const y = (Math.random() - 0.5) * 30
        const z = (Math.random() - 0.5) * 22
        const hue = Math.random() > 0.5 ? 0.73 : 0.53  // violet or cyan
        const col  = new THREE.Color().setHSL(hue, 1, 0.55 + Math.random() * 0.35)
        const mat  = new THREE.MeshBasicMaterial({ color: col })
        const mesh = new THREE.Mesh(nodeGeo, mat)
        mesh.position.set(x, y, z)
        scene.add(mesh)
        nodes.push(mesh)
        basePos.push(new THREE.Vector3(x, y, z))
        phases.push(Math.random() * Math.PI * 2)
        speeds.push(0.18 + Math.random() * 0.28)
      }

      // ── Dynamic connection lines ───────────────────────────────────
      const LINE_THRESH = 8
      const linePairs: [number, number][] = []
      for (let i = 0; i < nodeCount; i++)
        for (let j = i + 1; j < nodeCount; j++)
          if (basePos[i].distanceTo(basePos[j]) < LINE_THRESH)
            linePairs.push([i, j])

      const linePosArr  = new Float32Array(linePairs.length * 6)
      const linePosAttr = new THREE.BufferAttribute(linePosArr, 3)
      linePosAttr.setUsage(THREE.DynamicDrawUsage)
      const lineGeo = new THREE.BufferGeometry()
      lineGeo.setAttribute('position', linePosAttr)
      const lineMat = new THREE.LineBasicMaterial({ color: 0x00D4FF, transparent: true, opacity: 0.22 })
      scene.add(new THREE.LineSegments(lineGeo, lineMat))

      // ── Dynamic triangle fill ──────────────────────────────────────
      const TRI_THRESH = 5.5
      const triTriplets: [number, number, number][] = []
      for (let i = 0; i < nodeCount; i++)
        for (let j = i + 1; j < nodeCount; j++) {
          if (basePos[i].distanceTo(basePos[j]) > TRI_THRESH) continue
          for (let k = j + 1; k < nodeCount; k++)
            if (
              basePos[i].distanceTo(basePos[k]) < TRI_THRESH &&
              basePos[j].distanceTo(basePos[k]) < TRI_THRESH
            ) triTriplets.push([i, j, k])
        }

      let triMesh: THREE.Mesh | null = null
      let triMat:  THREE.MeshBasicMaterial | null = null
      let triPosAttr: THREE.BufferAttribute | null = null
      const triPosArr = new Float32Array(triTriplets.length * 9)
      if (triTriplets.length > 0) {
        triPosAttr = new THREE.BufferAttribute(triPosArr, 3)
        triPosAttr.setUsage(THREE.DynamicDrawUsage)
        const triGeo = new THREE.BufferGeometry()
        triGeo.setAttribute('position', triPosAttr)
        triMat  = new THREE.MeshBasicMaterial({ color: 0x7C3AED, transparent: true, opacity: 0.07, side: THREE.DoubleSide })
        triMesh = new THREE.Mesh(triGeo, triMat)
        scene.add(triMesh)
      }

      // ── Animation ─────────────────────────────────────────────────
      const clock = new THREE.Clock()
      // Camera slowly orbits around the scene origin in 3D
      const CAM_RADIUS = 28

      const animate = () => {
        if (disposed) return
        animationId = requestAnimationFrame(animate)
        const t = clock.getElapsedTime()

        // Smooth 3D camera orbit (very slow)
        camera.position.x = Math.sin(t * 0.06) * CAM_RADIUS * 0.18
        camera.position.y = Math.sin(t * 0.04) * CAM_RADIUS * 0.10
        camera.position.z = CAM_RADIUS + Math.cos(t * 0.05) * 3
        camera.lookAt(0, 0, 0)

        // Scene slow rotation so the network drifts left-right
        scene.rotation.y = t * 0.022
        scene.rotation.x = Math.sin(t * 0.13) * 0.06

        // Float each node independently in 3D
        nodes.forEach((node, i) => {
          const sp = speeds[i], ph = phases[i], bp = basePos[i]
          node.position.set(
            bp.x + Math.sin(t * sp         + ph)         * 0.7,
            bp.y + Math.cos(t * sp * 0.75  + ph + 1.1)   * 0.6,
            bp.z + Math.sin(t * sp * 0.55  + ph + 2.3)   * 0.5,
          )
          // Breathe scale
          node.scale.setScalar(0.8 + Math.abs(Math.sin(t * 1.1 * sp + ph)) * 0.5)
        })

        // Sync line vertices to animated node positions
        let lp = 0
        for (const [a, b] of linePairs) {
          const pa = nodes[a].position, pb = nodes[b].position
          linePosArr[lp++]=pa.x; linePosArr[lp++]=pa.y; linePosArr[lp++]=pa.z
          linePosArr[lp++]=pb.x; linePosArr[lp++]=pb.y; linePosArr[lp++]=pb.z
        }
        linePosAttr.needsUpdate = true

        // Sync triangle vertices + pulse opacity
        if (triPosAttr && triMat) {
          let tp = 0
          for (const [a, b, c] of triTriplets) {
            const pa=nodes[a].position, pb=nodes[b].position, pc=nodes[c].position
            triPosArr[tp++]=pa.x; triPosArr[tp++]=pa.y; triPosArr[tp++]=pa.z
            triPosArr[tp++]=pb.x; triPosArr[tp++]=pb.y; triPosArr[tp++]=pb.z
            triPosArr[tp++]=pc.x; triPosArr[tp++]=pc.y; triPosArr[tp++]=pc.z
          }
          triPosAttr.needsUpdate = true
          triMat.opacity = 0.04 + Math.sin(t * 0.45) * 0.04
        }

        renderer.render(scene, camera)
      }
      animate()

      // Resize observer for proper filling
      const onResize = () => {
        const w = getW(), h = getH()
        camera.aspect = w / h
        camera.updateProjectionMatrix()
        renderer.setSize(w, h)
      }
      const ro = new ResizeObserver(onResize)
      ro.observe(container)
      window.addEventListener('resize', onResize)

      const onVisibility = () => {
        if (!document.hidden && !disposed) {
          cancelAnimationFrame(animationId)
          animationId = requestAnimationFrame(animate)
        }
      }
      document.addEventListener('visibilitychange', onVisibility)

      return () => {
        disposed = true
        cancelAnimationFrame(animationId)
        ro.disconnect()
        window.removeEventListener('resize', onResize)
        document.removeEventListener('visibilitychange', onVisibility)
        renderer.dispose()
        nodeGeo.dispose(); lineGeo.dispose(); lineMat.dispose()
        triMesh?.geometry.dispose(); triMat?.dispose()
        nodes.forEach((n) => (n.material as THREE.MeshBasicMaterial).dispose())
        if (container.contains(canvas)) container.removeChild(canvas)
      }
    }

    let cleanup: (() => void) | undefined
    init().then((c) => { cleanup = c }).catch(console.error)

    return () => {
      disposed = true
      cancelAnimationFrame(animationId)
      cleanup?.()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full overflow-hidden"
      style={{ pointerEvents: 'none' }}
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
    <section className="relative w-full min-h-[88vh] md:min-h-screen flex items-center justify-center overflow-hidden">
      <HeroCanvas />

      {/* Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-4 sm:px-6">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] sm:text-[12px] font-semibold mb-5 sm:mb-6"
          style={{ background: 'var(--bg-elevated)', border: '1px solid rgba(56,189,248,0.3)', color: '#38BDF8' }}>
          <Sparkles size={11} />
          The Applied AI Knowledge Hub
        </div>

        {/* Headline */}
        <h1 className="font-bold mb-4 leading-[1.05] tracking-tight text-4xl sm:text-6xl lg:text-7xl" style={{ fontFamily: "'Inter',sans-serif" }}>
          <span className="block" style={{ color: 'var(--text-primary)' }}>Master</span>
          <span className="block g-text" style={{ minHeight: '1.05em' }}>
            {displayWord || '\u00A0'}
            <span className="animate-pulse" style={{ color: '#A78BFA' }}>|</span>
          </span>
        </h1>

        {/* Sub-headline */}
        <p className="text-sm sm:text-base md:text-lg max-w-2xl mx-auto mb-7 sm:mb-8 leading-relaxed px-2" style={{ color: 'var(--text-secondary)' }}>
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
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 mt-8 sm:mt-10 pt-5 sm:pt-6"
          style={{ borderTop: '1px solid var(--bg-border)' }}>
          {stats.map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="font-bold text-2xl sm:text-3xl g-text" style={{ fontFamily: "'Inter',sans-serif" }}>{value}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
