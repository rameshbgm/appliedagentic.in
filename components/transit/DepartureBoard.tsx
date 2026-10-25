'use client'
// components/transit/DepartureBoard.tsx
// Split-flap style board of upcoming reads. Rows rotate every few seconds.
import Link from 'next/link'
import { useEffect, useState } from 'react'

export interface Departure {
  slug: string
  title: string
  minutes: number | null
  lineNumber: number | null
  color: string
}

interface Props {
  departures: Departure[]
  rows?: number
}

const pad = (n: number) => String(n).padStart(2, '0')
const hhmm = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`

export default function DepartureBoard({ departures, rows = 4 }: Props) {
  const [offset, setOffset] = useState(0)
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())
    const clock = setInterval(() => setNow(new Date()), 15000)
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const rotate = departures.length > rows && !reduce
      ? setInterval(() => setOffset((o) => (o + 1) % departures.length), 6000)
      : undefined
    return () => { clearInterval(clock); if (rotate) clearInterval(rotate) }
  }, [departures.length, rows])

  const visible = Array.from({ length: Math.min(rows, departures.length) }, (_, i) => departures[(offset + i) % departures.length])

  return (
    <div className="tr-board" aria-label="Next articles departing">
      <div className="tr-board__head">
        <span>Next departures</span>
        <span className="tr-board__clock tr-mono" suppressHydrationWarning>{now ? hhmm(now) : '--:--'}</span>
      </div>
      {visible.map((d, i) => {
        const t = now ? new Date(now.getTime() + (i * 6 + 2) * 60000) : null
        return (
          <Link
            key={`${d.slug}-${offset}`}
            href={`/articles/${d.slug}`}
            className="tr-board__row"
            aria-label={`${d.title}${d.minutes ? `, ${d.minutes} minute read` : ''}`}
          >
            <span className="t" suppressHydrationWarning>{t ? hhmm(t) : '--:--'}</span>
            <span className="dest" aria-hidden="true">
              {[...d.title].map((ch, k) => (
                <span key={k} className="ch" style={{ animationDelay: `${k * 16 + i * 70}ms` }}>
                  {ch === ' ' ? ' ' : ch}
                </span>
              ))}
            </span>
            <span className="ln" style={{ '--c': d.color } as React.CSSProperties}>
              {d.lineNumber ? `L${d.lineNumber}` : `${d.minutes ?? '—'}m`}
            </span>
          </Link>
        )
      })}
      <div className="tr-board__foot">
        <span>{departures.length} services today</span>
        <Link href="/search">Full timetable →</Link>
      </div>
    </div>
  )
}
