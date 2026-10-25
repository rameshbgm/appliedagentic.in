// components/transit/StopList.tsx
// Articles drawn as stops along a vertical line, with journey time on the right.
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

export interface Stop {
  id: number
  slug: string
  title: string
  summary?: string | null
  minutes?: number | null
  publishedAt?: Date | string | null
  imageUrl?: string | null
  tags?: string[]
}

interface Props {
  stops: Stop[]
  showThumbs?: boolean
}

export default function StopList({ stops, showThumbs = false }: Props) {
  return (
    <ol className="tr-stops">
      {stops.map((s, i) => {
        const thumb = showThumbs && s.imageUrl
        return (
          <li key={s.id}>
            <Link href={`/articles/${s.slug}`} className={thumb ? 'has-thumb' : undefined}>
              <span className="pin" aria-hidden="true" />
              {thumb && (
                <span className="thumb">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.imageUrl!} alt="" loading="lazy" />
                </span>
              )}
              <div className="body">
                <h3>{s.title}</h3>
                {s.summary && <p>{s.summary}</p>}
                {s.publishedAt && (
                  <span className="tr-eyebrow">
                    <time dateTime={new Date(s.publishedAt).toISOString()}>{formatDate(s.publishedAt, 'short')}</time>
                  </span>
                )}
                {(s.tags?.length || i === 0 || i === stops.length - 1) ? (
                  <span className="tags">
                    {i === 0 && stops.length > 1 && <span className="tag">Start here</span>}
                    {i === stops.length - 1 && stops.length > 1 && <span className="tag">Terminus</span>}
                    {s.tags?.slice(0, 3).map((t) => <span key={t} className="tag">{t}</span>)}
                  </span>
                ) : null}
              </div>
              <span className="eta">
                {s.minutes ? <><b>{s.minutes}</b>min</> : <><b>·</b>read</>}
              </span>
            </Link>
          </li>
        )
      })}
    </ol>
  )
}
