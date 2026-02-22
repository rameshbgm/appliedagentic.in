'use client'
// components/shared/Loader3D.tsx
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

const DOTS = [
  '#FF6B6B', '#FF8E53', '#FFCC00', '#4ADE80', '#22D3EE',
  '#818CF8', '#E879F9', '#F43F5E', '#AAFF00', '#00C2FF',
]

const NODE_COUNT  = 90
const LINK_DIST   = 2.4
const COLORS      = [0x4ade80, 0x22d3ee, 0x818cf8, 0xe879f9, 0x00c2ff, 0xaaff00]

export default function Loader3D() {
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const rafRef     = useRef<number>(0)
  const [visible,  setVisible]  = useState(false)
  const [fadeOut,  setFadeOut]  = useState(false)

  /* ── show once per session ── */
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (sessionStorage.getItem('aa_loader_seen')) return
    setVisible(true)
    const t1 = setTimeout(() => setFadeOut(true), 3500)
    const t2 = setTimeout(() => {
      setVisible(false)
      sessionStorage.setItem('aa_loader_seen', '1')
    }, 4000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  /* ── Three.js scene ── */
  useEffect(() => {
    if (!visible || !canvasRef.current) return

    const canvas = canvasRef.current
    const W = canvas.clientWidth  || 400
    const H = canvas.clientHeight || 300

    /* renderer */
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(W, H, false)
    renderer.setClearColor(0x000000, 0)

    const scene  = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 100)
    camera.position.set(0, 0, 7)

    /* nodes */
    const positions: THREE.Vector3[] = []
    const velocities: THREE.Vector3[] = []
    const nodeMeshes: THREE.Mesh[] = []
    const nodeGeo = new THREE.SphereGeometry(0.065, 8, 8)

    for (let i = 0; i < NODE_COUNT; i++) {
      const pos = new THREE.Vector3(
        (Math.random() - 0.5) * 9,
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 5,
      )
      positions.push(pos)
      velocities.push(new THREE.Vector3(
        (Math.random() - 0.5) * 0.006,
        (Math.random() - 0.5) * 0.006,
        (Math.random() - 0.5) * 0.004,
      ))
      const color  = COLORS[i % COLORS.length]
      const mat    = new THREE.MeshBasicMaterial({ color })
      const mesh   = new THREE.Mesh(nodeGeo, mat)
      mesh.position.copy(pos)
      scene.add(mesh)
      nodeMeshes.push(mesh)
    }

    /* edges (LineSegments — rebuilt each frame via BufferGeometry) */
    const edgeGeo = new THREE.BufferGeometry()
    const MAX_LINES = NODE_COUNT * 6
    const edgePositions = new Float32Array(MAX_LINES * 2 * 3)
    const edgeColors    = new Float32Array(MAX_LINES * 2 * 3)
    const edgePosAttr   = new THREE.BufferAttribute(edgePositions, 3).setUsage(THREE.DynamicDrawUsage)
    const edgeColAttr   = new THREE.BufferAttribute(edgeColors,    3).setUsage(THREE.DynamicDrawUsage)
    edgeGeo.setAttribute('position', edgePosAttr)
    edgeGeo.setAttribute('color',    edgeColAttr)
    const edgeMat  = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.45 })
    const lines    = new THREE.LineSegments(edgeGeo, edgeMat)
    scene.add(lines)

    /* ambient glow: one large semi-transparent sphere in the center */
    const glowGeo = new THREE.SphereGeometry(1.2, 32, 32)
    const glowMat = new THREE.MeshBasicMaterial({ color: 0x4ade80, transparent: true, opacity: 0.04 })
    scene.add(new THREE.Mesh(glowGeo, glowMat))

    /* resize handler */
    const onResize = () => {
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    window.addEventListener('resize', onResize)

    /* animate */
    let tick = 0
    const tmpColor = new THREE.Color()

    const animate = () => {
      rafRef.current = requestAnimationFrame(animate)
      tick++

      /* move nodes */
      for (let i = 0; i < NODE_COUNT; i++) {
        positions[i].add(velocities[i])
        /* soft boundary bounce */
        if (Math.abs(positions[i].x) > 4.6) velocities[i].x *= -1
        if (Math.abs(positions[i].y) > 3.2) velocities[i].y *= -1
        if (Math.abs(positions[i].z) > 2.8) velocities[i].z *= -1
        nodeMeshes[i].position.copy(positions[i])
      }

      /* slow scene rotation */
      scene.rotation.y = tick * 0.0015
      scene.rotation.x = Math.sin(tick * 0.0008) * 0.18

      /* rebuild edges */
      let lineIdx = 0
      for (let a = 0; a < NODE_COUNT && lineIdx < MAX_LINES - 1; a++) {
        for (let b = a + 1; b < NODE_COUNT && lineIdx < MAX_LINES - 1; b++) {
          const d = positions[a].distanceTo(positions[b])
          if (d < LINK_DIST) {
            const alpha = 1 - d / LINK_DIST
            tmpColor.setHex(COLORS[a % COLORS.length])

            const base = lineIdx * 6
            edgePositions[base]     = positions[a].x
            edgePositions[base + 1] = positions[a].y
            edgePositions[base + 2] = positions[a].z
            edgePositions[base + 3] = positions[b].x
            edgePositions[base + 4] = positions[b].y
            edgePositions[base + 5] = positions[b].z

            edgeColors[base]     = tmpColor.r * alpha
            edgeColors[base + 1] = tmpColor.g * alpha
            edgeColors[base + 2] = tmpColor.b * alpha
            tmpColor.setHex(COLORS[b % COLORS.length])
            edgeColors[base + 3] = tmpColor.r * alpha
            edgeColors[base + 4] = tmpColor.g * alpha
            edgeColors[base + 5] = tmpColor.b * alpha

            lineIdx++
          }
        }
      }
      edgeGeo.setDrawRange(0, lineIdx * 2)
      edgePosAttr.needsUpdate = true
      edgeColAttr.needsUpdate = true

      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      nodeGeo.dispose()
      edgeGeo.dispose()
    }
  }, [visible])

  if (!visible) return null

  return (
    <div
      className={`fixed inset-0 z-99999 flex flex-col items-center justify-center transition-opacity duration-500 ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{ background: 'var(--bg-base, #080e1e)' }}
    >
      {/* WebGL canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ display: 'block' }}
      />

      {/* Branding overlay */}
      <div className="relative z-10 flex flex-col items-center gap-5 select-none">
        {/* Logo row */}
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--green, #4ade80)', boxShadow: '0 0 24px #4ade8088' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
          </div>
          <span className="font-bold text-2xl tracking-tight" style={{ color: 'rgba(255,255,255,0.95)' }}>
            Applied<span style={{ color: 'var(--green, #4ade80)' }}>Agentic</span>
          </span>
        </div>

        {/* Colorful bouncing dots */}
        <div className="flex items-center gap-2">
          {DOTS.map((color, i) => (
            <div
              key={i}
              className="rounded-full animate-bounce"
              style={{
                width: '9px',
                height: '9px',
                background: color,
                boxShadow: `0 0 8px ${color}, 0 0 16px ${color}55`,
                animationDelay: `${i * 0.07}s`,
                animationDuration: '0.9s',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

