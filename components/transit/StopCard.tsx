// components/transit/StopCard.tsx
// Article card in Transit style: line-coloured edge, display title, mono meta.
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

export interface StopCardData {
  slug: string
  title: string
  summary?: string | null
  minutes?: number | null
  views?: number | null
  date?: Date | string | null
  imageUrl?: string | null
  label?: string | null
  color?: string
}

export default function StopCard({ slug, title, summary, minutes, views, date, imageUrl, label, color }: StopCardData) {
  return (
    <Link href={`/articles/${slug}`} className="tr-card" style={{ '--c': color ?? 'var(--l2)' } as React.CSSProperties} data-reveal>
      {imageUrl && (
        <span className="tr-card__img">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt="" loading="lazy" />
        </span>
      )}
      {label && <span className="tr-eyebrow" style={{ color: 'var(--c)' }}>{label}</span>}
      <h3>{title}</h3>
      {summary && <p>{summary}</p>}
      <span className="tr-card__meta">
        {minutes ? <span>{minutes} min ride</span> : null}
        {views != null && views > 0 ? <span>{views.toLocaleString()} riders</span> : null}
        {date ? <span>{formatDate(date)}</span> : null}
      </span>
    </Link>
  )
}
