// components/pulse/LessonList.tsx
// Numbered lessons with stretching numerals, optional thumbnails and reading time.
import Link from 'next/link'

export interface Lesson {
  id: number
  slug: string
  title: string
  summary?: string | null
  minutes?: number | null
  imageUrl?: string | null
  tags?: string[]
}

interface Props {
  lessons: Lesson[]
  showThumbs?: boolean
  /** Number of the first item (lists continue across chapters) */
  start?: number
}

export default function LessonList({ lessons, showThumbs = false, start = 1 }: Props) {
  return (
    <ol className="p-list">
      {lessons.map((l, i) => {
        const thumb = showThumbs && l.imageUrl
        return (
          <li key={l.id} data-reveal>
            <Link href={`/articles/${l.slug}`} className={thumb ? 'has-thumb' : undefined}>
              <span className="n" aria-hidden="true">{String(start + i).padStart(2, '0')}</span>
              {thumb && (
                <span className="thumb">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={l.imageUrl!} alt="" loading="lazy" />
                </span>
              )}
              <div className="body">
                <h3>{l.title}</h3>
                {l.summary && <p>{l.summary}</p>}
                {l.tags && l.tags.length > 0 && (
                  <span className="tags">{l.tags.slice(0, 3).map((t) => <span key={t} className="p-tag">{t}</span>)}</span>
                )}
              </div>
              <span className="min">{l.minutes ? `${l.minutes} min` : 'Read'}</span>
            </Link>
          </li>
        )
      })}
    </ol>
  )
}
