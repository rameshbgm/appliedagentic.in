// app/(public)/[menuSlug]/page.tsx — a module: its chapters (sub-menus) and lessons
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ArrowRight } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { getNetwork, formatJourney, plural } from '@/lib/catalog'
import LessonList, { type Lesson } from '@/components/pulse/LessonList'

interface Props {
  params: Promise<{ menuSlug: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { menuSlug } = await params
    const menu = await prisma.navMenu.findUnique({ where: { slug: menuSlug }, select: { title: true, description: true } })
    if (!menu) return {}
    return { title: menu.title, description: menu.description ?? undefined }
  } catch (err) {
    logger.error('[generateMetadata /[menuSlug]]', err)
    return {}
  }
}

const lessonSelect = {
  id: true,
  title: true,
  slug: true,
  summary: true,
  readingTimeMinutes: true,
  coverImage: { select: { url: true } },
  articleTags: { take: 3, select: { tag: { select: { name: true } } } },
} as const

const published = { article: { status: 'PUBLISHED' as const } }

export default async function MenuPage({ params }: Props) {
  const { menuSlug } = await params
  let menu
  try {
    menu = await prisma.navMenu.findUnique({
      where: { slug: menuSlug, isVisible: true },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        subMenus: {
          where: { isVisible: true },
          orderBy: { order: 'asc' },
          select: {
            id: true, title: true, slug: true, description: true,
            articles: { where: published, orderBy: { orderIndex: 'asc' }, select: { article: { select: lessonSelect } } },
          },
        },
        menuArticles: { where: published, orderBy: { orderIndex: 'asc' }, select: { article: { select: lessonSelect } } },
      },
    })
  } catch (err) {
    logger.error(`[GET /${menuSlug}] DB error loading menu`, err)
    throw err
  }
  if (!menu) notFound()

  const modules = await getNetwork()
  const idx = modules.findIndex((m) => m.id === menu.id)
  const mod = modules[idx]
  const next = idx >= 0 ? modules[idx + 1] : undefined
  const style = { '--c': mod?.color ?? 'var(--cobalt)', '--fg': mod?.fg ?? 'var(--on-dark)' } as React.CSSProperties

  const toLesson = (a: typeof menu.menuArticles[number]['article']): Lesson => ({
    id: a.id, slug: a.slug, title: a.title, summary: a.summary, minutes: a.readingTimeMinutes,
    imageUrl: a.coverImage?.url, tags: a.articleTags.map((t) => t.tag.name),
  })
  const chapters = menu.subMenus.map((z) => ({ ...z, lessons: z.articles.map((x) => toLesson(x.article)) }))
  const extra = menu.menuArticles.map((x) => toLesson(x.article))
  const all = [...chapters.flatMap((c) => c.lessons), ...extra]
  const minutes = all.reduce((s, l) => s + (l.minutes ?? 0), 0)
  let counter = 1

  return (
    <div style={style}>
      <header className="p-cover">
        <span className="p-cover__ghost" aria-hidden="true">{String(mod?.number ?? 1).padStart(2, '0')}</span>
        <div className="p-wrap p-cover__inner">
          <nav className="p-crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link><span aria-hidden="true">/</span><span>Module {String(mod?.number ?? 1).padStart(2, '0')}</span>
          </nav>
          <h1 className="p-display">{menu.title}</h1>
          {menu.description && <p>{menu.description}</p>}
          <div className="p-cover__stats">
            <span>{plural(all.length, 'lesson')}</span>
            {chapters.length > 0 && <span>{plural(chapters.length, 'chapter')}</span>}
            {minutes > 0 && <span>{formatJourney(minutes)}</span>}
          </div>
          {all[0] && (
            <div className="p-ctas">
              <Link href={`/articles/${all[0].slug}`} className="p-btn" style={{ borderColor: 'var(--fg)', color: 'var(--fg)', '--sweep': 'var(--fg)', '--sweep-fg': 'var(--c)' } as React.CSSProperties}>
                Start lesson 01 <ArrowRight size={18} />
              </Link>
            </div>
          )}
        </div>
      </header>

      <div className="p-wrap" style={{ paddingBottom: 40 }}>
        {chapters.length > 1 && (
          <nav className="p-chips" aria-label="Chapters">
            {chapters.map((c, i) => (
              <a key={c.id} href={`#chapter-${c.slug}`} className="p-chip">
                <span style={{ opacity: .55 }}>{String(i + 1).padStart(2, '0')}</span>{c.title}
              </a>
            ))}
          </nav>
        )}

        {chapters.map((c, i) => {
          const start = counter
          counter += c.lessons.length
          return (
            <section key={c.id} id={`chapter-${c.slug}`} className="p-chapter" aria-labelledby={`chapter-title-${c.id}`}>
              <div className="p-chapter__head">
                <span className="p-label" style={{ color: 'var(--c)' }}>Chapter {String(i + 1).padStart(2, '0')}</span>
                <h2 id={`chapter-title-${c.id}`} className="p-display" style={{ flexBasis: '100%' }}>{c.title}</h2>
              </div>
              {c.description && <p>{c.description}</p>}
              {c.lessons.length > 0
                ? <LessonList lessons={c.lessons} showThumbs start={start} />
                : <p style={{ color: 'var(--muted)', padding: '12px 0' }}>Lessons for this chapter are on their way.</p>}
              <Link href={`/${menu.slug}/${c.slug}`} className="p-btn p-btn--sm p-btn--soft" style={{ marginTop: 14 }}>
                Open chapter page <ArrowRight size={16} />
              </Link>
            </section>
          )
        })}

        {extra.length > 0 && (
          <section className="p-chapter" aria-labelledby="extra-title">
            <div className="p-chapter__head">
              <h2 id="extra-title" className="p-display">{chapters.length > 0 ? 'More lessons' : 'Lessons'}</h2>
            </div>
            <LessonList lessons={extra} showThumbs start={counter} />
          </section>
        )}

        {all.length === 0 && (
          <div className="p-empty">
            <h2>Coming soon</h2>
            <p>Lessons for this module are being written. Explore another module in the meantime.</p>
            <Link href="/" className="p-btn p-btn--fill">Back home</Link>
          </div>
        )}

        {next && (
          <div className="p-nextprev">
            <Link href={`/${next.slug}`} className="p-next" style={{ '--c': next.color, '--fg': next.fg, gridColumn: '1 / -1' } as React.CSSProperties}>
              <div>
                <span className="p-label">Next module · {String(next.number).padStart(2, '0')}</span>
                <h3>{next.title}</h3>
              </div>
              <span className="p-next__go" aria-hidden="true"><ArrowRight size={24} /></span>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
