'use client'
// components/aurora/Constellation.tsx
// Topics as a star map: brighter stars are discussed in more essays, and each
// star is joined to its nearest neighbours. Hover or focus a star to light up
// its links; open it to search the essays on that topic.
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { swatch } from '@/lib/catalog'

interface Topic { id: number; name: string; count: number }
interface Star extends Topic { x: number; y: number; r: number; color: string }

function hash(s: string) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return (h >>> 0) / 4294967295
}

// A sunflower spiral, nudged by a hash of each name so the map feels hand-placed.
function layout(topics: Topic[], w: number, h: number): { stars: Star[]; edges: [number, number][] } {
  const max = Math.max(1, ...topics.map((t) => t.count))
  const pad = 70
  const stars = topics.map((t, i) => {
    const a = i * 2.39996 + hash(t.name) * 0.8
    const d = Math.sqrt((i + 0.6) / topics.length)
    return {
      ...t,
      x: w / 2 + Math.cos(a) * d * (w / 2 - pad),
      y: h / 2 + Math.sin(a) * d * (h / 2 - pad / 1.4),
      r: 3 + (t.count / max) * 3,
      color: swatch(Math.floor(hash(t.name) * 8)).color,
    }
  })
  const seen = new Set<string>()
  const edges: [number, number][] = []
  stars.forEach((s, i) => {
    stars
      .map((o, j) => ({ j, d: (o.x - s.x) ** 2 + (o.y - s.y) ** 2 }))
      .filter((o) => o.j !== i)
      .sort((a, b) => a.d - b.d)
      .slice(0, 2)
      .forEach(({ j }) => {
        const k = i < j ? `${i}-${j}` : `${j}-${i}`
        if (!seen.has(k)) { seen.add(k); edges.push(i < j ? [i, j] : [j, i]) }
      })
  })
  return { stars, edges }
}

function StarMap({ topics, w, h, active, setActive }: { topics: Topic[]; w: number; h: number; active: number | null; setActive: (i: number | null) => void }) {
  const router = useRouter()
  const { stars, edges } = useMemo(() => layout(topics, w, h), [topics, w, h])
  const open = (t: Topic) => router.push(`/search?q=${encodeURIComponent(t.name)}`)
  return (
    <svg viewBox={`0 0 ${w} ${h}`} role="list" aria-label="Topics">
      {edges.map(([a, b]) => (
        <line key={`${a}-${b}`} x1={stars[a].x} y1={stars[a].y} x2={stars[b].x} y2={stars[b].y} className={active === a || active === b ? 'on' : undefined} />
      ))}
      {stars.map((s, i) => {
        const right = s.x < w * 0.72
        return (
          <g
            key={s.id}
            role="listitem"
            className={`a-star${active === i ? ' on' : ''}`}
            style={{ '--c': s.color, '--i': i } as React.CSSProperties}
            tabIndex={0}
            aria-label={`${s.name}, ${s.count} ${s.count === 1 ? 'essay' : 'essays'}`}
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            onClick={() => (active === i ? open(s) : setActive(i))}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(s) } }}
          >
            <circle className="halo" cx={s.x} cy={s.y} r={s.r * 3} />
            <circle className="core" cx={s.x} cy={s.y} r={s.r} />
            <circle cx={s.x} cy={s.y} r={22} fill="transparent" />
            <text x={s.x + (right ? s.r + 9 : -(s.r + 9))} y={s.y + 4.5} textAnchor={right ? 'start' : 'end'}>{s.name}</text>
          </g>
        )
      })}
    </svg>
  )
}

export default function Constellation({ topics }: { topics: Topic[] }) {
  const router = useRouter()
  const [active, setActive] = useState<number | null>(null)
  const list = useMemo(() => [...topics].sort((a, b) => b.count - a.count).slice(0, 18), [topics])
  const current = active != null ? list[active] : null
  return (
    <div className="a-constellation a-glass" onMouseLeave={() => setActive(null)}>
      <div className="a-mobile-only"><StarMap topics={list} w={400} h={Math.max(480, list.length * 46)} active={active} setActive={setActive} /></div>
      <div className="a-desktop-only"><StarMap topics={list} w={1000} h={440} active={active} setActive={setActive} /></div>
      <div className="a-constellation__hint" aria-live="polite">
        {current ? (
          <button type="button" className="a-chip" onClick={() => router.push(`/search?q=${encodeURIComponent(current.name)}`)}>
            {current.count} {current.count === 1 ? 'essay' : 'essays'} on {current.name} <ArrowRight size={15} />
          </button>
        ) : (
          <span>Tap a star to explore a topic</span>
        )}
      </div>
    </div>
  )
}
