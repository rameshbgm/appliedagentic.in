// app/(public)/[menuSlug]/page.tsx — a path: its chapters as milestones on a glowing timeline
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ArrowRight } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { getNetwork, formatJourney, plural } from '@/lib/catalog'
import LessonList, { type Lesson } from '@/components/aurora/LessonList'
import Timeline from '@/components/aurora/Timeline'

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
  const two = (n: number) => String(n).padStart(2, '0')
  let counter = 1

  return (
    <div style={style}>
      <header className="a-wrap a-opener">
        <nav className="a-crumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link><span aria-hidden="true">/</span><Link href="/#paths">Paths</Link>
        </nav>
        <span className="a-opener__num" aria-hidden="true">{two(mod?.number ?? 1)}</span>
        <span className="a-kicker" style={{ color: 'var(--c)' }}>Path {two(mod?.number ?? 1)}</span>
        <h1 className="a-display">{menu.title}</h1>
        {menu.description && <p className="a-dek">{menu.description}</p>}
        <div className="a-opener__stats">
          <span className="a-tag">{plural(all.length, 'essay')}</span>
          {chapters.length > 0 && <span className="a-tag">{plural(chapters.length, 'milestone')}</span>}
          {minutes > 0 && <span className="a-tag">{formatJourney(minutes)} of reading</span>}
        </div>
        {all[0] && (
          <Link href={`/articles/${all[0].slug}`} className="a-btn a-btn--accent" style={{ marginTop: 6 }}>
            Start the path <ArrowRight size={17} />
          </Link>
        )}
      </header>

      <div className="a-wrap a-narrow" style={{ paddingBottom: 40 }}>
        {chapters.length > 1 && (
          <nav className="a-chapnav" aria-label="Milestones on this path">
            {chapters.map((c, i) => (
              <a key={c.id} href={`#section-${c.slug}`} className="a-chip"><span style={{ fontFamily: 'var(--display)', fontStyle: 'italic', color: 'var(--c)' }}>{i + 1}</span>{c.title}</a>
            ))}
          </nav>
        )}

        <Timeline>
        {chapters.map((c, i) => {
          const start = counter
          counter += c.lessons.length
          return (
            <section key={c.id} id={`section-${c.slug}`} className="a-milestone" aria-labelledby={`chapter-title-${c.id}`} data-reveal>
              <div className="a-milestone__head">
                <span className="a-kicker" style={{ color: 'var(--c)' }}>Milestone {i + 1}</span>
                <h2 id={`chapter-title-${c.id}`} className="a-display">{c.title}</h2>
                {c.description && <p>{c.description}</p>}
              </div>
              {c.lessons.length > 0
                ? <LessonList lessons={c.lessons} showThumbs start={start} />
                : <p className="a-colophon" style={{ padding: '12px 0' }}>Essays for this section are being written.</p>}
              <Link href={`/${menu.slug}/${c.slug}`} className="a-btn a-btn--quiet a-btn--sm" style={{ marginTop: 16 }}>
                Open this milestone <ArrowRight size={15} />
              </Link>
            </section>
          )
        })}

        {extra.length > 0 && (
          <section className="a-milestone" aria-labelledby="extra-title" data-reveal>
            <div className="a-milestone__head"><h2 id="extra-title" className="a-display">{chapters.length > 0 ? 'More essays' : 'Essays'}</h2></div>
            <LessonList lessons={extra} showThumbs start={counter} />
          </section>
        )}
        </Timeline>

        {all.length === 0 && (
          <div className="a-empty">
            <h2>Being written</h2>
            <p>Essays for this path are on their way. Try another path in the meantime.</p>
            <Link href="/#paths" className="a-btn a-btn--accent">See all paths</Link>
          </div>
        )}

        {next && (
          <div className="a-nextprev">
            <Link href={`/${next.slug}`} className="a-next a-glass" style={{ '--c': next.color, '--fg': next.fg, gridColumn: '1 / -1' } as React.CSSProperties}>
              <div>
                <span className="a-kicker">Next · Path {two(next.number)}</span>
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
