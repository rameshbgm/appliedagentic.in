'use client'
// components/shared/Loader3D.tsx
import { useEffect, useRef, useState } from 'react'
import type * as THREE from 'three'

export default function Loader3D() {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Only show once per session
    const seen = sessionStorage.getItem('aa_loader_seen')
    if (seen) return

    setVisible(true)

    let animationId: number
    let renderer: unknown
    let scene: unknown
    let camera: unknown

    const init = async () => {
      const THREE = await import('three')

      const container = canvasRef.current
      if (!container) return

      // Scene setup
      const _scene = new THREE.Scene()
      const _camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000)
      _camera.position.z = 20
      scene = _scene
      camera = _camera

      const _renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      _renderer.setSize(window.innerWidth, window.innerHeight)
      _renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      _renderer.setClearColor(0x0A0A0F, 1)
      container.appendChild(_renderer.domElement)
      renderer = _renderer

      // Create neural network nodes
      const nodeCount = 80
      const nodes: THREE.Mesh[] = []
      const positions: THREE.Vector3[] = []

      const nodeGeo = new THREE.SphereGeometry(0.15, 8, 8)

      for (let i = 0; i < nodeCount; i++) {
        const x = (Math.random() - 0.5) * 30
        const y = (Math.random() - 0.5) * 20
        const z = (Math.random() - 0.5) * 15

        const hue = Math.random() > 0.5 ? 0.73 : 0.53 // violet or cyan
        const color = new THREE.Color().setHSL(hue, 1, 0.6 + Math.random() * 0.3)
        const nodeMat = new THREE.MeshBasicMaterial({ color })
        const node = new THREE.Mesh(nodeGeo, nodeMat)
        node.position.set(x, y, z)
        _scene.add(node)
        nodes.push(node)
        positions.push(new THREE.Vector3(x, y, z))
      }

      // Create lines between nearby nodes
      const linePoints: THREE.Vector3[] = []
      const threshold = 6

      for (let i = 0; i < nodeCount; i++) {
        for (let j = i + 1; j < nodeCount; j++) {
          const d = positions[i].distanceTo(positions[j])
          if (d < threshold) {
            linePoints.push(positions[i].clone(), positions[j].clone())
          }
        }
      }

      const lineGeo = new THREE.BufferGeometry().setFromPoints(linePoints)
      const lineMat = new THREE.LineBasicMaterial({ color: 0x00D4FF, transparent: true, opacity: 0.25 })
      const lines = new THREE.LineSegments(lineGeo, lineMat)
      _scene.add(lines)

      // Animate
      const clock = new THREE.Clock()

      const animate = () => {
        animationId = requestAnimationFrame(animate)
        const t = clock.getElapsedTime()

        _scene.rotation.y += 0.003
        _scene.rotation.x = Math.sin(t * 0.2) * 0.05

        // Pulse nodes
        nodes.forEach((node, i) => {
          const pulse = 1 + Math.sin(t * 2 + i * 0.3) * 0.03
          node.scale.setScalar(pulse)
        })

        _renderer.render(_scene, _camera)
      }

      animate()

      // Handle resize
      const onResize = () => {
        _camera.aspect = window.innerWidth / window.innerHeight
        _camera.updateProjectionMatrix()
        _renderer.setSize(window.innerWidth, window.innerHeight)
      }
      window.addEventListener('resize', onResize)

      // Fade out after 2.5s
      setTimeout(() => {
        setFadeOut(true)
        setTimeout(() => {
          setVisible(false)
          sessionStorage.setItem('aa_loader_seen', '1')
        }, 600)
      }, 2500)
    }

    init().catch(console.error)

    return () => {
      if (animationId) cancelAnimationFrame(animationId)
      // Cleanup Three.js renderer
    }
  }, [])

  if (!visible) return null

  return (
    <div
      id="loader-overlay"
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center transition-opacity duration-500 ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{ background: 'var(--bg-base)' }}
    >
      <div ref={canvasRef} className="absolute inset-0" />
      <div className="relative z-10 text-center">
        <h2 className="font-display text-2xl font-bold gradient-text mb-3 animate-pulse">
          Applied Agentic AI
        </h2>
        <div className="flex items-center justify-center gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-primary animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
