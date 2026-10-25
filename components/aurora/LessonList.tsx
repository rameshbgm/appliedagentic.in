// components/aurora/LessonList.tsx — essays as glass rows with a numbered halo and a read marker
import Link from 'next/link'
import ReadMark from './ReadMark'

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
  start?: number
}

export default function LessonList({ lessons, showThumbs = false, start = 1 }: Props) {
  return (
    <ol className="a-lessons">
      {lessons.map((l, i) => {
        const thumb = showThumbs && l.imageUrl
        return (
          <li key={l.id} data-reveal>
            <Link href={`/articles/${l.slug}`} className={thumb ? 'has-thumb' : undefined}>
              <span className="n" aria-hidden="true">{start + i}</span>
              <h3>{l.title}</h3>
              {l.summary && <p>{l.summary}</p>}
              <span className="row">
                {l.minutes ? <span>{l.minutes} min read</span> : null}
                {l.tags?.slice(0, 2).map((t) => <span key={t} className="a-tag">{t}</span>)}
                <ReadMark slug={l.slug} />
              </span>
              {thumb && (
                <span className="thumb">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={l.imageUrl!} alt="" loading="lazy" />
                </span>
              )}
            </Link>
          </li>
        )
      })}
    </ol>
  )
}
