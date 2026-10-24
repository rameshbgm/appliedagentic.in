// components/pulse/Tile.tsx — bento tile for an article (spotlight + tilt on hover)
import Link from 'next/link'

export interface TileData {
  slug: string
  title: string
  summary?: string | null
  minutes?: number | null
  imageUrl?: string | null
  label?: string | null
  tags?: string[]
  color?: string
  fg?: string
  variant?: 'plain' | 'big'
}

export default function Tile({ slug, title, summary, minutes, imageUrl, label, tags, color, fg, variant = 'plain' }: TileData) {
  return (
    <Link
      href={`/articles/${slug}`}
      className={`p-tile${variant === 'big' ? ' p-tile--big' : ''}`}
      style={{ '--c': color ?? 'var(--cobalt)', '--fg': fg ?? 'var(--on-dark)' } as React.CSSProperties}
      data-spot
      data-tilt
      data-reveal
    >
      {imageUrl && variant !== 'big' && (
        <span className="p-tile__img">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt="" loading="lazy" />
        </span>
      )}
      <div style={{ display: 'grid', gap: 10 }}>
        {label && <span className="p-label" style={{ color: variant === 'big' ? 'var(--sun)' : 'var(--c)' }}>{label}</span>}
        <h3>{title}</h3>
        {summary && <p>{summary}</p>}
      </div>
      <span className="p-tile__meta">
        {minutes ? <span className="p-tag">{minutes} min read</span> : null}
        {tags?.slice(0, 2).map((t) => <span key={t} className="p-tag">{t}</span>)}
      </span>
    </Link>
  )
}
