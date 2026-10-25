// app/(public)/[menuSlug]/[subMenuSlug]/page.tsx — a chapter of a module
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { getNetwork, formatJourney, plural, toRoman } from '@/lib/catalog'
import LessonList from '@/components/folio/LessonList'

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
  const num = toRoman(mod?.number ?? 1)

  const lessons = subMenu.articles.map(({ article: a }) => ({
    id: a.id, slug: a.slug, title: a.title, summary: a.summary, minutes: a.readingTimeMinutes,
    imageUrl: a.coverImage?.url, tags: a.articleTags.map((t) => t.tag.name),
  }))
  const minutes = lessons.reduce((s, a) => s + (a.minutes ?? 0), 0)

  return (
    <div style={style}>
      <header className="f-wrap f-opener">
        <nav className="f-crumbs" aria-label="Breadcrumb">
          <Link href="/">Front page</Link><span aria-hidden="true">/</span>
          <Link href={`/${subMenu.menu.slug}`}>Chapter {num}</Link><span aria-hidden="true">/</span>
          <span>Section {ci + 1}</span>
        </nav>
        <span className="f-kicker" style={{ color: 'var(--c)' }}>Chapter {num} · {subMenu.menu.title}</span>
        <h1 className="f-display">{subMenu.title}</h1>
        {subMenu.description && <p className="f-dek">{subMenu.description}</p>}
        <div className="f-opener__stats">
          <span className="f-tag">{plural(lessons.length, 'essay')}</span>
          {minutes > 0 && <span className="f-tag">{formatJourney(minutes)} of reading</span>}
        </div>
      </header>

      <div className="f-wrap f-narrow" style={{ paddingBottom: 40 }}>
        {chapters.length > 1 && (
          <nav className="f-chapnav" aria-label="Sections in this chapter">
            {chapters.map((z, i) => (
              <Link key={z.id} href={`/${subMenu.menu.slug}/${z.slug}`} className="f-chip" aria-current={z.id === subMenu.id ? 'page' : undefined}>
                <span style={{ fontFamily: 'var(--display)', fontStyle: 'italic' }}>{i + 1}</span>{z.title}
              </Link>
            ))}
          </nav>
        )}

        <section className="f-chapter" aria-label="Essays in this section">
          {lessons.length > 0 ? (
            <LessonList lessons={lessons} showThumbs />
          ) : (
            <div className="f-empty">
              <h2>No essays yet</h2>
              <p>Essays for this section are on their way.</p>
              <Link href={`/${subMenu.menu.slug}`} className="f-btn f-btn--ink">Back to the chapter</Link>
            </div>
          )}
        </section>

        {(prev || next) && (
          <nav className="f-nextprev" aria-label="Neighbouring sections">
            {prev ? (
              <Link href={`/${subMenu.menu.slug}/${prev.slug}`} className="f-next f-next--quiet f-next--prev">
                <span className="go" aria-hidden="true"><ArrowLeft size={20} /></span>
                <div><span className="f-kicker">Previous section</span><h3>{prev.title}</h3></div>
              </Link>
            ) : <span className="f-desktop-only" />}
            {next && (
              <Link href={`/${subMenu.menu.slug}/${next.slug}`} className="f-next">
                <div><span className="f-kicker">Next section</span><h3>{next.title}</h3></div>
                <span className="go" aria-hidden="true"><ArrowRight size={20} /></span>
              </Link>
            )}
          </nav>
        )}
      </div>
    </div>
  )
}
