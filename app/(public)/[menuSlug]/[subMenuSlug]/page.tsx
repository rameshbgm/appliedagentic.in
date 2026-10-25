// app/(public)/[menuSlug]/[subMenuSlug]/page.tsx — a zone: one stretch of a line
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { getNetwork, formatJourney, plural } from '@/lib/transit'
import StopList from '@/components/transit/StopList'

interface Props {
  params: Promise<{ menuSlug: string; subMenuSlug: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { subMenuSlug } = await params
    const subMenu = await prisma.navSubMenu.findUnique({
      where: { slug: subMenuSlug },
      select: { title: true, description: true, menu: { select: { title: true, slug: true } } },
    })
    if (!subMenu) return {}
    return {
      title: `${subMenu.title} | ${subMenu.menu.title}`,
      description: subMenu.description ?? undefined,
      alternates: { canonical: `/${subMenu.menu.slug}/${subMenuSlug}` },
      openGraph: { title: subMenu.title, description: subMenu.description ?? undefined, url: `/${subMenu.menu.slug}/${subMenuSlug}`, type: 'website' },
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
                publishedAt: true,
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

  const network = await getNetwork()
  const line = network.find((l) => l.id === subMenu.menu.id)
  const color = line?.color ?? 'var(--l2)'
  const zones = line?.zones ?? []
  const zoneIndex = zones.findIndex((z) => z.id === subMenu.id)
  const prevZone = zoneIndex > 0 ? zones[zoneIndex - 1] : undefined
  const nextZone = zoneIndex >= 0 ? zones[zoneIndex + 1] : undefined

  const stops = subMenu.articles.map(({ article: a }) => ({
    id: a.id,
    slug: a.slug,
    title: a.title,
    summary: a.summary,
    minutes: a.readingTimeMinutes,
    publishedAt: a.publishedAt,
    imageUrl: a.coverImage?.url,
    tags: a.articleTags.map((t) => t.tag.name),
  }))
  const minutes = stops.reduce((s, a) => s + (a.minutes ?? 0), 0)

  return (
    <div style={{ '--c': color } as React.CSSProperties}>
      <header className="tr-band tr-band--soft">
        <span className="tr-band__ghost" aria-hidden="true">Z{zoneIndex + 1}</span>
        <div className="tr-wrap tr-band__inner">
          <nav className="tr-crumbs" aria-label="Breadcrumb">
            <Link href="/">Network</Link><span aria-hidden="true">›</span>
            <Link href={`/${subMenu.menu.slug}`}>Line {line?.number ?? ''} · {subMenu.menu.title}</Link><span aria-hidden="true">›</span>
            <span>Zone {zoneIndex + 1}</span>
          </nav>
          <span className="tr-line-tag" style={{ color }}>
            <span className="tr-roundel" style={{ '--s': '26px' } as React.CSSProperties}>{line?.number ?? '•'}</span>
            {subMenu.menu.title}
          </span>
          <h1 className="tr-display">{subMenu.title}</h1>
          {subMenu.description && <p style={{ color: 'var(--ink-2)' }}>{subMenu.description}</p>}
          <div className="tr-band__stats">
            <span>{plural(stops.length, 'stop')}</span>
            {minutes > 0 && <span>{formatJourney(minutes)} ride</span>}
          </div>
        </div>
      </header>

      <div className="tr-wrap" style={{ paddingBottom: 48 }}>
        {zones.length > 1 && (
          <nav className="tr-zonebar" aria-label="Other zones on this line">
            {zones.map((z, i) => (
              <Link key={z.id} href={`/${subMenu.menu.slug}/${z.slug}`} className="tr-chip" aria-current={z.id === subMenu.id ? 'page' : undefined}>
                <span className="tr-mono" style={{ fontSize: '.72rem', opacity: 0.7 }}>Z{i + 1}</span>{z.title}
              </Link>
            ))}
          </nav>
        )}

        <section className="tr-zone" aria-label="Stops in this zone">
          {stops.length > 0 ? (
            <StopList stops={stops} showThumbs />
          ) : (
            <div className="tr-empty">
              <h2>No stops yet</h2>
              <p>Articles for this zone are on their way.</p>
              <Link href={`/${subMenu.menu.slug}`} className="tr-btn tr-btn--primary">Back to the line</Link>
            </div>
          )}
        </section>

        {(prevZone || nextZone) && (
          <nav className="tr-nextprev" aria-label="Neighbouring zones">
            {prevZone ? (
              <Link href={`/${subMenu.menu.slug}/${prevZone.slug}`} className="tr-np tr-np--prev">
                <span className="arrow"><ArrowLeft size={20} /></span>
                <div><span className="tr-eyebrow">Previous zone</span><h3>{prevZone.title}</h3></div>
              </Link>
            ) : <span className="tr-desktop-only" />}
            {nextZone && (
              <Link href={`/${subMenu.menu.slug}/${nextZone.slug}`} className="tr-np tr-np--next">
                <div><span className="tr-eyebrow">Next zone</span><h3>{nextZone.title}</h3></div>
                <span className="arrow"><ArrowRight size={20} /></span>
              </Link>
            )}
          </nav>
        )}
      </div>
    </div>
  )
}
