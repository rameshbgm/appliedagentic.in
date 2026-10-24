'use client'
// components/pulse/StoryStrip.tsx
// Swipeable, colour-blocked story cards with progress segments (like stories).
import Link from 'next/link'
import { useRef, useState } from 'react'
import { ArrowRight } from 'lucide-react'

export interface Story {
  slug: string
  title: string
  summary?: string | null
  label: string
  minutes?: number | null
  color: string
  fg: string
}

export default function StoryStrip({ stories }: { stories: Story[] }) {
  const [at, setAt] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  const onScroll = () => {
    const el = ref.current
    const first = el?.firstElementChild as HTMLElement | null
    if (!el || !first) return
    const w = first.offsetWidth + 14
    setAt(Math.min(stories.length - 1, Math.round(el.scrollLeft / w)))
  }

  return (
    <>
      <div className="p-segs" aria-hidden="true">
        {stories.map((s, i) => <i key={s.slug} className={i <= at ? 'on' : undefined} />)}
      </div>
      <div className="p-stories" ref={ref} onScroll={onScroll}>
        {stories.map((s) => (
          <Link key={s.slug} href={`/articles/${s.slug}`} className="p-story" style={{ '--c': s.color, '--fg': s.fg } as React.CSSProperties}>
            <span className="p-story__glyph" aria-hidden="true">{s.title.trim().charAt(0)}</span>
            <span className="p-label">{s.label}</span>
            <div>
              <h3>{s.title}</h3>
              {s.summary && <p>{s.summary}</p>}
            </div>
            <span className="p-story__foot">
              {s.minutes ? `${s.minutes} min read` : 'Read'}
              <span className="p-story__go"><ArrowRight size={20} /></span>
            </span>
          </Link>
        ))}
      </div>
    </>
  )
}
