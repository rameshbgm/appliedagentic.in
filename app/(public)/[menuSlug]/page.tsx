// app/(public)/[menuSlug]/page.tsx — a line: its zones (sub-menus) and stops (articles)
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ArrowRight } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { getNetwork, formatJourney, plural } from '@/lib/transit'
import { getSiteSettings } from '@/lib/site-settings'
import StopList, { type Stop } from '@/components/transit/StopList'

interface Props {
  params: Promise<{ menuSlug: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { menuSlug } = await params
    const menu = await prisma.navMenu.findUnique({
      where: { slug: menuSlug },
      select: { title: true, description: true },
    })
    if (!menu) return {}
    return {
      title: menu.title,
      description: menu.description ?? undefined,
      alternates: { canonical: `/${menuSlug}` },
      openGraph: { title: menu.title, description: menu.description ?? undefined, url: `/${menuSlug}`, type: 'website' },
    }
  } catch (err) {
    logger.error('[generateMetadata /[menuSlug]]', err)
    return {}
  }
}

const stopSelect = {
  id: true,
  title: true,
  slug: true,
  summary: true,
  readingTimeMinutes: true,
  publishedAt: true,
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
            id: true,
            title: true,
            slug: true,
            description: true,
            articles: { where: published, orderBy: { orderIndex: 'asc' }, select: { article: { select: stopSelect } } },
          },
        },
        menuArticles: { where: published, orderBy: { orderIndex: 'asc' }, select: { article: { select: stopSelect } } },
      },
    })
  } catch (err) {
    logger.error(`[GET /${menuSlug}] DB error loading menu`, err)
    throw err
  }
  if (!menu) notFound()

  const network = await getNetwork()
  const { showArticleImages } = await getSiteSettings()
  const line = network.find((l) => l.id === menu.id)
  const color = line?.color ?? 'var(--l2)'
  const number = line?.number ?? 1

  const toStop = (a: typeof menu.menuArticles[number]['article']): Stop => ({
    id: a.id,
    slug: a.slug,
    title: a.title,
    summary: a.summary,
    minutes: a.readingTimeMinutes,
    publishedAt: a.publishedAt,
    imageUrl: a.coverImage?.url,
    tags: a.articleTags.map((t) => t.tag.name),
  })

  const zones = menu.subMenus.map((z) => ({ ...z, stops: z.articles.map((x) => toStop(x.article)) }))
  const directStops = menu.menuArticles.map((x) => toStop(x.article))
  const totalStops = zones.reduce((s, z) => s + z.stops.length, 0) + directStops.length
  const totalMinutes = [...zones.flatMap((z) => z.stops), ...directStops].reduce((s, a) => s + (a.minutes ?? 0), 0)
  const otherLines = network.filter((l) => l.id !== menu.id)
  const lineIndex = network.findIndex((l) => l.id === menu.id)
  const nextLine = lineIndex >= 0 ? network[lineIndex + 1] : undefined

  return (
    <div style={{ '--c': color } as React.CSSProperties}>
      <header className="tr-band">
        <span className="tr-band__ghost" aria-hidden="true">{number}</span>
        <div className="tr-wrap tr-band__inner">
          <nav className="tr-crumbs" aria-label="Breadcrumb">
            <Link href="/">Network</Link><span aria-hidden="true">›</span><span>Line {number}</span>
          </nav>
          <h1 className="tr-display">{menu.title}</h1>
          {menu.description && <p>{menu.description}</p>}
          <div className="tr-band__stats">
            <span>{plural(totalStops, 'stop')}</span>
            {zones.length > 0 && <span>{plural(zones.length, 'zone')}</span>}
            {totalMinutes > 0 && <span>{formatJourney(totalMinutes)} ride</span>}
          </div>
        </div>
      </header>

      <div className="tr-wrap" style={{ paddingBottom: 48 }}>
        {zones.length > 1 && (
          <nav className="tr-zonebar" aria-label="Zones on this line">
            {zones.map((z, i) => (
              <a key={z.id} href={`#zone-${z.slug}`} className="tr-chip">
                <span className="tr-mono" style={{ fontSize: '.72rem', color: 'var(--muted)' }}>Z{i + 1}</span>{z.title}
              </a>
            ))}
          </nav>
        )}

        {zones.map((z, i) => (
          <section key={z.id} id={`zone-${z.slug}`} className="tr-zone" aria-labelledby={`zone-title-${z.id}`}>
            <div className="tr-zone__head">
              <span className="z">ZONE {i + 1}</span>
              <h2 id={`zone-title-${z.id}`} className="tr-display">{z.title}</h2>
              <Link href={`/${menu.slug}/${z.slug}`} className="tr-link">Zone page <ArrowRight size={14} /></Link>
            </div>
            {z.description && <p>{z.description}</p>}
            {z.stops.length > 0 ? (
              <StopList stops={z.stops} showThumbs={showArticleImages} />
            ) : (
              <p style={{ color: 'var(--muted)', padding: '12px 0' }}>No stops in this zone yet.</p>
            )}
          </section>
        ))}

        {directStops.length > 0 && (
          <section className="tr-zone" aria-labelledby="direct-title">
            <div className="tr-zone__head">
              <span className="z">EXPRESS</span>
              <h2 id="direct-title" className="tr-display">{zones.length > 0 ? 'More stops on this line' : 'Stops on this line'}</h2>
            </div>
            <StopList stops={directStops} showThumbs={showArticleImages} />
          </section>
        )}

        {zones.length === 0 && directStops.length === 0 && (
          <div className="tr-empty">
            <h2>Line under construction</h2>
            <p>Stops on this line open soon. Ride another line in the meantime.</p>
            <Link href="/" className="tr-btn tr-btn--primary">Back to the network map</Link>
          </div>
        )}

        {(nextLine || otherLines.length > 0) && (
          <div className="tr-sec" style={{ display: 'grid', gap: 16 }}>
            {nextLine && (
              <Link href={`/${nextLine.slug}`} className="tr-np tr-np--next" style={{ '--c': nextLine.color } as React.CSSProperties}>
                <div>
                  <span className="tr-eyebrow">Next line</span>
                  <h3>{nextLine.title}</h3>
                </div>
                <span className="arrow"><ArrowRight size={20} /></span>
              </Link>
            )}
            {otherLines.length > 0 && (
              <div className="tr-change">
                Change here for
                {otherLines.map((l) => (
                  <Link key={l.id} href={`/${l.slug}`} style={{ '--c': l.color } as React.CSSProperties}>
                    <span className="tr-roundel" style={{ '--s': '24px' } as React.CSSProperties}>{l.number}</span>{l.title}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
