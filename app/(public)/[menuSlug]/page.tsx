// app/(public)/[menuSlug]/page.tsx — a module: its chapters (sub-menus) and lessons
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ArrowRight } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { getNetwork, formatJourney, plural, toRoman } from '@/lib/catalog'
import LessonList, { type Lesson } from '@/components/folio/LessonList'

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
  const style = { '--c': mod?.color ?? 'var(--accent)', '--fg': mod?.fg ?? '#fff' } as React.CSSProperties

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
      <header className="f-wrap f-opener">
        <nav className="f-crumbs" aria-label="Breadcrumb">
          <Link href="/">Front page</Link><span aria-hidden="true">/</span><Link href="/#contents">Contents</Link>
        </nav>
        <span className="f-opener__num" aria-hidden="true">{toRoman(mod?.number ?? 1)}</span>
        <span className="f-kicker" style={{ color: 'var(--c)' }}>Chapter {toRoman(mod?.number ?? 1)}</span>
        <h1 className="f-display">{menu.title}</h1>
        {menu.description && <p className="f-dek">{menu.description}</p>}
        <div className="f-opener__stats">
          <span className="f-tag">{plural(all.length, 'essay')}</span>
          {chapters.length > 0 && <span className="f-tag">{plural(chapters.length, 'section')}</span>}
          {minutes > 0 && <span className="f-tag">{formatJourney(minutes)} of reading</span>}
        </div>
        {all[0] && (
          <Link href={`/articles/${all[0].slug}`} className="f-btn f-btn--ink" style={{ marginTop: 6 }}>
            Start reading <ArrowRight size={17} />
          </Link>
        )}
      </header>

      <div className="f-wrap f-narrow" style={{ paddingBottom: 40 }}>
        {chapters.length > 1 && (
          <nav className="f-chapnav" aria-label="Sections in this chapter">
            {chapters.map((c, i) => (
              <a key={c.id} href={`#section-${c.slug}`} className="f-chip"><span style={{ fontFamily: 'var(--display)', fontStyle: 'italic', color: 'var(--c)' }}>{i + 1}</span>{c.title}</a>
            ))}
          </nav>
        )}

        {chapters.map((c, i) => {
          const start = counter
          counter += c.lessons.length
          return (
            <section key={c.id} id={`section-${c.slug}`} className="f-chapter" aria-labelledby={`chapter-title-${c.id}`}>
              <div className="f-chapter__head">
                <span className="f-kicker" style={{ color: 'var(--c)' }}>Section {i + 1}</span>
                <h2 id={`chapter-title-${c.id}`} className="f-display">{c.title}</h2>
                {c.description && <p>{c.description}</p>}
              </div>
              {c.lessons.length > 0
                ? <LessonList lessons={c.lessons} showThumbs start={start} />
                : <p className="f-colophon" style={{ padding: '12px 0' }}>Essays for this section are being written.</p>}
              <Link href={`/${menu.slug}/${c.slug}`} className="f-btn f-btn--quiet f-btn--sm" style={{ marginTop: 16 }}>
                Section page <ArrowRight size={15} />
              </Link>
            </section>
          )
        })}

        {extra.length > 0 && (
          <section className="f-chapter" aria-labelledby="extra-title">
            <div className="f-chapter__head"><h2 id="extra-title" className="f-display">{chapters.length > 0 ? 'More essays' : 'Essays'}</h2></div>
            <LessonList lessons={extra} showThumbs start={counter} />
          </section>
        )}

        {all.length === 0 && (
          <div className="f-empty">
            <h2>Being written</h2>
            <p>Essays for this chapter are on their way. Read another chapter in the meantime.</p>
            <Link href="/#contents" className="f-btn f-btn--ink">Back to the contents</Link>
          </div>
        )}

        {next && (
          <div className="f-nextprev">
            <Link href={`/${next.slug}`} className="f-next" style={{ '--c': next.color, '--fg': next.fg, gridColumn: '1 / -1' } as React.CSSProperties}>
              <div>
                <span className="f-kicker">Next · Chapter {toRoman(next.number)}</span>
                <h3>{next.title}</h3>
              </div>
              <span className="go" aria-hidden="true"><ArrowRight size={22} /></span>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
