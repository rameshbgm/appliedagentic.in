// app/(public)/[menuSlug]/[subMenuSlug]/page.tsx — a chapter of a module
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { getNetwork, formatJourney, plural } from '@/lib/catalog'
import LessonList from '@/components/aurora/LessonList'

interface Props {
  params: Promise<{ menuSlug: string; subMenuSlug: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { subMenuSlug } = await params
    const subMenu = await prisma.navSubMenu.findUnique({
      where: { slug: subMenuSlug },
      select: { title: true, description: true, menu: { select: { title: true } } },
    })
    if (!subMenu) return {}
    return {
      title: `${subMenu.title} | ${subMenu.menu.title}`,
      description: subMenu.description ?? undefined,
    }
  } catch (err) {
    logger.error('[generateMetadata /[menuSlug]/[subMenuSlug]]', err)
    return {}
  }
}

export default async function SubMenuPage({ params }: Props) {
  const { menuSlug, subMenuSlug } = await params

  let subMenu
  try {
    subMenu = await prisma.navSubMenu.findUnique({
      where: { slug: subMenuSlug },
      include: {
        menu: { select: { id: true, title: true, slug: true, isVisible: true } },
        articles: {
          where: { article: { status: 'PUBLISHED' } },
          orderBy: { orderIndex: 'asc' },
          include: {
            article: {
              select: {
                id: true,
                title: true,
                slug: true,
                summary: true,
                readingTimeMinutes: true,
                coverImage: { select: { url: true } },
                articleTags: { take: 3, select: { tag: { select: { name: true } } } },
              },
            },
          },
        },
      },
    })
  } catch (err) {
    logger.error(`[GET /${menuSlug}/${subMenuSlug}] DB error loading sub-menu`, err)
    throw err
  }

  if (!subMenu || !subMenu.menu.isVisible || !subMenu.isVisible) notFound()
  if (subMenu.menu.slug !== menuSlug) notFound()

  const modules = await getNetwork()
  const mod = modules.find((m) => m.id === subMenu.menu.id)
  const chapters = mod?.zones ?? []
  const ci = chapters.findIndex((z) => z.id === subMenu.id)
  const prev = ci > 0 ? chapters[ci - 1] : undefined
  const next = ci >= 0 ? chapters[ci + 1] : undefined
  const style = { '--c': mod?.color ?? 'var(--accent)', '--fg': mod?.fg ?? '#fff' } as React.CSSProperties
  const num = String(mod?.number ?? 1).padStart(2, '0')

  const lessons = subMenu.articles.map(({ article: a }) => ({
    id: a.id, slug: a.slug, title: a.title, summary: a.summary, minutes: a.readingTimeMinutes,
    imageUrl: a.coverImage?.url, tags: a.articleTags.map((t) => t.tag.name),
  }))
  const minutes = lessons.reduce((s, a) => s + (a.minutes ?? 0), 0)

  return (
    <div style={style}>
      <header className="a-wrap a-opener">
        <nav className="a-crumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link><span aria-hidden="true">/</span>
          <Link href={`/${subMenu.menu.slug}`}>Path {num}</Link><span aria-hidden="true">/</span>
          <span>Milestone {ci + 1}</span>
        </nav>
        <span className="a-opener__num" aria-hidden="true">{num}.{ci + 1}</span>
        <span className="a-kicker" style={{ color: 'var(--c)' }}>Path {num} · {subMenu.menu.title}</span>
        <h1 className="a-display">{subMenu.title}</h1>
        {subMenu.description && <p className="a-dek">{subMenu.description}</p>}
        <div className="a-opener__stats">
          <span className="a-tag">{plural(lessons.length, 'essay')}</span>
          {minutes > 0 && <span className="a-tag">{formatJourney(minutes)} of reading</span>}
        </div>
      </header>

      <div className="a-wrap a-narrow" style={{ paddingBottom: 40 }}>
        {chapters.length > 1 && (
          <nav className="a-chapnav" aria-label="Milestones on this path">
            {chapters.map((z, i) => (
              <Link key={z.id} href={`/${subMenu.menu.slug}/${z.slug}`} className="a-chip" aria-current={z.id === subMenu.id ? 'page' : undefined}>
                <span style={{ fontFamily: 'var(--display)', fontStyle: 'italic' }}>{i + 1}</span>{z.title}
              </Link>
            ))}
          </nav>
        )}

        <section className="a-chapter" aria-label="Essays in this milestone">
          {lessons.length > 0 ? (
            <LessonList lessons={lessons} showThumbs />
          ) : (
            <div className="a-empty">
              <h2>No essays yet</h2>
              <p>Essays for this milestone are on their way.</p>
              <Link href={`/${subMenu.menu.slug}`} className="a-btn a-btn--accent">Back to the path</Link>
            </div>
          )}
        </section>

        {(prev || next) && (
          <nav className="a-nextprev" aria-label="Neighbouring milestones">
            {prev ? (
              <Link href={`/${subMenu.menu.slug}/${prev.slug}`} className="a-next a-next--quiet a-next--prev a-glass">
                <span className="go" aria-hidden="true"><ArrowLeft size={20} /></span>
                <div><span className="a-kicker">Previous milestone</span><h3>{prev.title}</h3></div>
              </Link>
            ) : <span className="a-desktop-only" />}
            {next && (
              <Link href={`/${subMenu.menu.slug}/${next.slug}`} className="a-next a-glass">
                <div><span className="a-kicker">Next milestone</span><h3>{next.title}</h3></div>
                <span className="go" aria-hidden="true"><ArrowRight size={20} /></span>
              </Link>
            )}
          </nav>
        )}
      </div>
    </div>
  )
}
