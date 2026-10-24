// app/(public)/[menuSlug]/[subMenuSlug]/page.tsx — a chapter of a module
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { getNetwork, formatJourney, plural } from '@/lib/catalog'
import LessonList from '@/components/pulse/LessonList'

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
  const style = { '--c': mod?.color ?? 'var(--cobalt)', '--fg': mod?.fg ?? 'var(--on-dark)' } as React.CSSProperties
  const num = String(mod?.number ?? 1).padStart(2, '0')

  const lessons = subMenu.articles.map(({ article: a }) => ({
    id: a.id, slug: a.slug, title: a.title, summary: a.summary, minutes: a.readingTimeMinutes,
    imageUrl: a.coverImage?.url, tags: a.articleTags.map((t) => t.tag.name),
  }))
  const minutes = lessons.reduce((s, a) => s + (a.minutes ?? 0), 0)

  return (
    <div style={style}>
      <header className="p-cover p-cover--soft">
        <span className="p-cover__ghost" aria-hidden="true">{String(ci + 1).padStart(2, '0')}</span>
        <div className="p-wrap p-cover__inner">
          <nav className="p-crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link><span aria-hidden="true">/</span>
            <Link href={`/${subMenu.menu.slug}`}>Module {num}</Link><span aria-hidden="true">/</span>
            <span>Chapter {String(ci + 1).padStart(2, '0')}</span>
          </nav>
          <span className="p-label" style={{ color: 'var(--ink-2)' }}>{subMenu.menu.title}</span>
          <h1 className="p-display">{subMenu.title}</h1>
          {subMenu.description && <p style={{ color: 'var(--ink-2)' }}>{subMenu.description}</p>}
          <div className="p-cover__stats">
            <span>{plural(lessons.length, 'lesson')}</span>
            {minutes > 0 && <span>{formatJourney(minutes)}</span>}
          </div>
        </div>
      </header>

      <div className="p-wrap" style={{ paddingBottom: 40 }}>
        {chapters.length > 1 && (
          <nav className="p-chips" aria-label="Chapters in this module">
            {chapters.map((z, i) => (
              <Link key={z.id} href={`/${subMenu.menu.slug}/${z.slug}`} className="p-chip" aria-current={z.id === subMenu.id ? 'page' : undefined}>
                <span style={{ opacity: .55 }}>{String(i + 1).padStart(2, '0')}</span>{z.title}
              </Link>
            ))}
          </nav>
        )}

        <section className="p-chapter" aria-label="Lessons in this chapter">
          {lessons.length > 0 ? (
            <LessonList lessons={lessons} showThumbs />
          ) : (
            <div className="p-empty">
              <h2>No lessons yet</h2>
              <p>Lessons for this chapter are on their way.</p>
              <Link href={`/${subMenu.menu.slug}`} className="p-btn p-btn--fill">Back to the module</Link>
            </div>
          )}
        </section>

        {(prev || next) && (
          <nav className="p-nextprev" aria-label="Neighbouring chapters">
            {prev ? (
              <Link href={`/${subMenu.menu.slug}/${prev.slug}`} className="p-next p-next--soft p-next--prev">
                <span className="p-next__go" aria-hidden="true"><ArrowLeft size={22} /></span>
                <div><span className="p-label">Previous chapter</span><h3>{prev.title}</h3></div>
              </Link>
            ) : <span className="p-desktop-only" />}
            {next && (
              <Link href={`/${subMenu.menu.slug}/${next.slug}`} className="p-next">
                <div><span className="p-label">Next chapter</span><h3>{next.title}</h3></div>
                <span className="p-next__go" aria-hidden="true"><ArrowRight size={22} /></span>
              </Link>
            )}
          </nav>
        )}
      </div>
    </div>
  )
}
