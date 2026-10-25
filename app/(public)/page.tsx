// app/(public)/page.tsx — Network map (home)
import Link from 'next/link'
import fs from 'fs'
import path from 'path'
import type { Metadata } from 'next'
import { ArrowRight, Presentation } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { getNetwork, resolveLine, articleLineSelect, menuIdsOf, lineColor } from '@/lib/transit'
import DepartureBoard, { type Departure } from '@/components/transit/DepartureBoard'
import NetworkMap from '@/components/transit/NetworkMap'
import StopCard from '@/components/transit/StopCard'
import NewsletterForm from '@/components/transit/NewsletterForm'
import { heroContent } from '@/content/home'
import { newsletterContent } from '@/content/newsletter'
import { getSiteSettings } from '@/lib/site-settings'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  return { title: { absolute: settings.siteName }, description: settings.metaDescription }
}

export const dynamic = 'force-dynamic'

const articleSelect = {
  id: true,
  title: true,
  slug: true,
  summary: true,
  readingTimeMinutes: true,
  viewCount: true,
  publishedAt: true,
  coverImage: { select: { url: true } },
  ...articleLineSelect,
} as const

async function getHomeData() {
  try {
    const [featured, latest, publishedCount, tags] = await Promise.all([
      prisma.article.findMany({
        where: { status: 'PUBLISHED', isFeatured: true },
        orderBy: { publishedAt: 'desc' },
        take: 6,
        select: articleSelect,
      }),
      prisma.article.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
        take: 10,
        select: articleSelect,
      }),
      prisma.article.count({ where: { status: 'PUBLISHED' } }),
      prisma.tag.findMany({
        where: { articleTags: { some: { article: { status: 'PUBLISHED' } } } },
        orderBy: { articleTags: { _count: 'desc' } },
        take: 12,
        select: {
          id: true,
          name: true,
          articleTags: {
            where: { article: { status: 'PUBLISHED' } },
            take: 30,
            select: { article: { select: articleLineSelect } },
          },
        },
      }),
    ])
    return { featured, latest, publishedCount, tags }
  } catch (err) {
    logger.error('[GET /] DB error loading homepage data', err)
    return { featured: [], latest: [], publishedCount: 0, tags: [] }
  }
}

function getStaticFiles() {
  try {
    const publicDir = path.join(process.cwd(), 'public')
    return fs
      .readdirSync(publicDir)
      .filter((f) => f.endsWith('.html') || f.endsWith('.htm'))
      .map((f) => {
        let title = f.replace(/\.(html|htm)$/, '').replace(/[-_]/g, ' ')
        let description: string | null = null
        try {
          const html = fs.readFileSync(path.join(publicDir, f), 'utf8')
          const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
          if (titleMatch) title = titleMatch[1].trim()
          const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)
            ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i)
          if (descMatch) description = descMatch[1].trim()
        } catch {
          // fall back to the file name
        }
        return { file: f, title, description, href: `/${f}` }
      })
  } catch {
    return []
  }
}

export default async function HomePage() {
  const [network, { featured, latest, publishedCount, tags }] = await Promise.all([getNetwork(), getHomeData()])
  const staticFiles = getStaticFiles()
  const settings = await getSiteSettings()

  const lineOf = (a: Parameters<typeof menuIdsOf>[0]) => resolveLine(network, menuIdsOf(a))

  const boardSource = latest.length > 0 ? latest : featured
  const departures: Departure[] = boardSource.map((a) => {
    const line = lineOf(a)
    return { slug: a.slug, title: a.title, minutes: a.readingTimeMinutes, lineNumber: line?.number ?? null, color: line?.color ?? 'var(--l2)' }
  })

  const interchanges = tags
    .map((t) => {
      const lineNumbers = new Set<number>()
      t.articleTags.forEach((at) => { const l = lineOf(at.article); if (l) lineNumbers.add(l.number) })
      return { id: t.id, name: t.name, count: t.articleTags.length, lines: [...lineNumbers].sort((a, b) => a - b) }
    })
    .filter((t) => t.count > 0)

  const totalZones = network.reduce((sum, l) => sum + l.zones.length, 0)
  const firstLine = network[0]
  const allGood = network.length > 0

  return (
    <>
      {/* ── Hero + departure board ─────────────────────────────── */}
      <section className="tr-wrap tr-hero" aria-labelledby="home-title">
        <div>
          <div className="tr-status">
            <span className="dot" aria-hidden="true" />
            <span className="tr-eyebrow">{allGood ? `Good service on all ${network.length} lines` : 'Lines opening soon'}</span>
          </div>
          <h1 id="home-title" className="tr-display">Every route to <em>agentic&nbsp;AI</em>, mapped.</h1>
          <p className="tr-lede">{settings.tagline || heroContent.subheadline}</p>
          <div className="tr-ctas">
            {firstLine && (
              <Link href={`/${firstLine.slug}`} className="tr-btn tr-btn--primary">
                Board Line 1 <ArrowRight size={17} />
              </Link>
            )}
            <a href="#network" className="tr-btn">See the network map</a>
          </div>
          <div className="tr-stats">
            <div><b>{network.length}</b><span>Lines</span></div>
            <div><b>{totalZones}</b><span>Zones</span></div>
            <div><b>{publishedCount}</b><span>Stops</span></div>
            <div><b>100%</b><span>Free to ride</span></div>
          </div>
        </div>
        {departures.length > 0 && <DepartureBoard departures={departures} />}
      </section>

      {/* ── Network map ─────────────────────────────────────────── */}
      <section id="network" className="tr-wrap tr-sec" aria-labelledby="network-title" style={{ scrollMarginTop: 'calc(var(--nav-h) + 12px)' }}>
        <div className="tr-sec-head" data-reveal>
          <h2 id="network-title" className="tr-display">Network map</h2>
          <p>Each learning path is a line. Start at Line 1 for the foundations, or board wherever your work is today.</p>
        </div>
        {network.length > 0 ? (
          <NetworkMap lines={network} />
        ) : (
          <div className="tr-empty">
            <h3>Lines under construction</h3>
            <p>The first learning paths are being laid. Check back shortly.</p>
          </div>
        )}
      </section>

      {/* ── Featured stops ──────────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="tr-wrap tr-sec" aria-labelledby="featured-title">
          <div className="tr-sec-head" data-reveal>
            <h2 id="featured-title" className="tr-display">Express stops</h2>
            <p>Hand-picked reads that are worth the trip, whichever line you ride.</p>
          </div>
          <div className="tr-cards">
            {featured.map((a) => {
              const line = lineOf(a)
              return (
                <StopCard
                  key={a.id}
                  slug={a.slug}
                  title={a.title}
                  summary={a.summary}
                  minutes={a.readingTimeMinutes}
                  views={a.viewCount}
                  date={a.publishedAt}
                  imageUrl={settings.showArticleImages ? a.coverImage?.url : undefined}
                  label={line ? `Line ${line.number} · ${line.title}` : 'Express'}
                  color={line?.color}
                />
              )
            })}
          </div>
        </section>
      )}

      {/* ── Interchanges (tags) ─────────────────────────────────── */}
      {interchanges.length > 0 && (
        <section className="tr-wrap tr-sec" aria-labelledby="xchg-title">
          <div className="tr-sec-head" data-reveal>
            <h2 id="xchg-title" className="tr-display">Interchanges</h2>
            <p>Topics that run across several lines. Change here to follow one idea through the whole network.</p>
          </div>
          <div className="tr-xchg" data-reveal>
            {interchanges.map((t) => (
              <Link key={t.id} href={`/search?q=${encodeURIComponent(t.name)}`}>
                {t.lines.length > 0 && (
                  <span className="tr-dots" aria-hidden="true">
                    {t.lines.slice(0, 4).map((n) => <i key={n} style={{ background: lineColor(n - 1) }} />)}
                  </span>
                )}
                {t.name}
                <small>{t.count}</small>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Ticket office (static decks) ────────────────────────── */}
      {staticFiles.length > 0 && (
        <section className="tr-wrap tr-sec" aria-labelledby="tickets-title">
          <div className="tr-sec-head" data-reveal>
            <h2 id="tickets-title" className="tr-display">Ticket office</h2>
            <p>Slide decks and visual guides you can open on their own.</p>
          </div>
          <div className="tr-tickets">
            {staticFiles.map((f) => (
              <a key={f.file} href={f.href} target="_blank" rel="noopener noreferrer" className="tr-ticket" data-reveal>
                <div className="tr-ticket__main">
                  <span className="tr-eyebrow">Presentation · opens in a new tab</span>
                  <h3>{f.title}</h3>
                  {f.description && <p>{f.description}</p>}
                </div>
                <div className="tr-ticket__stub">
                  <div><Presentation size={22} />Open</div>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* ── Newsletter band ─────────────────────────────────────── */}
      <section className="tr-news" aria-labelledby="news-title">
        <div className="tr-wrap tr-news__inner">
          <div>
            <span className="tr-eyebrow" style={{ color: 'inherit', opacity: 0.7 }}>Service updates</span>
            <h2 id="news-title" className="tr-display" style={{ marginTop: 8 }}>New stops, straight to your inbox.</h2>
            <p style={{ marginTop: 10 }}>{newsletterContent.subheadline}</p>
          </div>
          <NewsletterForm />
        </div>
      </section>
    </>
  )
}
