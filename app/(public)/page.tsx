// app/(public)/page.tsx — home
import Link from 'next/link'
import fs from 'fs'
import path from 'path'
import type { Metadata } from 'next'
import { ArrowRight, Presentation } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { getNetwork, resolveLine, articleLineSelect, menuIdsOf, swatch, formatJourney, plural } from '@/lib/catalog'
import StoryStrip, { type Story } from '@/components/pulse/StoryStrip'
import Tile from '@/components/pulse/Tile'
import NewsletterForm from '@/components/pulse/NewsletterForm'
import { heroContent } from '@/content/home'
import { newsletterContent } from '@/content/newsletter'

export const metadata: Metadata = {
  title: 'Applied Agentic AI | Master AI Agents & LLMs',
  description: 'Your comprehensive, structured guide to understanding and building AI-powered agentic systems.',
}

export const dynamic = 'force-dynamic'

const articleSelect = {
  id: true,
  title: true,
  slug: true,
  summary: true,
  readingTimeMinutes: true,
  viewCount: true,
  coverImage: { select: { url: true } },
  articleTags: { take: 2, select: { tag: { select: { name: true } } } },
  ...articleLineSelect,
} as const

async function getHomeData() {
  try {
    const [featured, latest, popular, publishedCount, tags] = await Promise.all([
      prisma.article.findMany({ where: { status: 'PUBLISHED', isFeatured: true }, orderBy: { createdAt: 'desc' }, take: 5, select: articleSelect }),
      prisma.article.findMany({ where: { status: 'PUBLISHED' }, orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }], take: 8, select: articleSelect }),
      prisma.article.findMany({ where: { status: 'PUBLISHED' }, orderBy: { viewCount: 'desc' }, take: 5, select: articleSelect }),
      prisma.article.count({ where: { status: 'PUBLISHED' } }),
      prisma.tag.findMany({
        where: { articleTags: { some: { article: { status: 'PUBLISHED' } } } },
        orderBy: { articleTags: { _count: 'desc' } },
        take: 14,
        select: { id: true, name: true, _count: { select: { articleTags: true } } },
      }),
    ])
    return { featured, latest, popular, publishedCount, tags }
  } catch (err) {
    logger.error('[GET /] DB error loading homepage data', err)
    return { featured: [], latest: [], popular: [], publishedCount: 0, tags: [] }
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
  const [modules, { featured, latest, popular, publishedCount, tags }] = await Promise.all([getNetwork(), getHomeData()])
  const decks = getStaticFiles()
  const moduleOf = (a: Parameters<typeof menuIdsOf>[0]) => resolveLine(modules, menuIdsOf(a))

  const stories: Story[] = latest.map((a, i) => {
    const m = moduleOf(a)
    const sw = m ? { color: m.color, fg: m.fg } : swatch(i)
    return { slug: a.slug, title: a.title, summary: a.summary, minutes: a.readingTimeMinutes, label: m ? `Module ${String(m.number).padStart(2, '0')}` : 'New', ...sw }
  })
  const picks = (featured.length >= 3 ? featured : popular).slice(0, 5)
  const topics = tags.length > 0 ? tags.map((t) => ({ name: t.name, count: t._count.articleTags })) : heroContent.typewriterTopics.map((name) => ({ name, count: 0 }))
  const totalMinutes = modules.reduce((s, m) => s + m.minutes, 0)
  const first = modules[0]

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="p-wrap p-hero" aria-labelledby="home-title">
        <svg className="p-sticker" viewBox="0 0 120 120" aria-hidden="true">
          <circle cx="60" cy="60" r="58" />
          <path id="sticker-path" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" fill="none" />
          <text><textPath href="#sticker-path">{modules.length} modules · {publishedCount} lessons · free ·</textPath></text>
        </svg>
        <h1 id="home-title" className="p-display p-mega" aria-label="Agents that act">
          <span>Agents</span><span>that</span><span>act.</span>
        </h1>
        <div className="p-hero__row">
          <p className="p-lede">{heroContent.subheadline}</p>
          <div className="p-ctas">
            {first && (
              <Link href={`/${first.slug}`} className="p-btn p-btn--fill">
                Start module 01 <ArrowRight size={18} />
              </Link>
            )}
            <a href="#fresh" className="p-btn">Fresh reads</a>
          </div>
        </div>
        <div className="p-stats">
          <div><b>{modules.length}</b><span>Modules</span></div>
          <div><b>{publishedCount}</b><span>Lessons</span></div>
          {totalMinutes > 0 && <div><b>{Math.round(totalMinutes / 60)}h</b><span>Of reading</span></div>}
          <div><b>Free</b><span>Always</span></div>
        </div>
      </section>

      {/* ── Topic ticker ─────────────────────────────────────────── */}
      <div className="p-marquee-clip">
        <div className="p-marquee">
          <div className="p-marquee__track">
            {[0, 1].map((copy) => (
              <span key={copy} style={{ display: 'flex' }} aria-hidden={copy === 1 ? true : undefined}>
                {topics.map((t) => (
                  <Link key={`${copy}-${t.name}`} href={`/search?q=${encodeURIComponent(t.name)}`} tabIndex={copy === 1 ? -1 : undefined}>{t.name}</Link>
                ))}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Fresh reads (stories) ────────────────────────────────── */}
      {stories.length > 0 && (
        <section id="fresh" className="p-wrap p-sec" aria-labelledby="fresh-title" style={{ scrollMarginTop: 'calc(var(--top-h) + 10px)' }}>
          <div className="p-sec-head">
            <h2 id="fresh-title" className="p-display">Fresh reads</h2>
            <p>The newest lessons, one swipe at a time. Tap a card to start reading.</p>
          </div>
          <StoryStrip stories={stories} />
        </section>
      )}

      {/* ── Course modules (stacked cards) ───────────────────────── */}
      <section className="p-wrap p-sec" aria-labelledby="course-title">
        <div className="p-sec-head">
          <h2 id="course-title" className="p-display">The course</h2>
          <p>Modules in order. Each one builds on the last, so start at 01 if you are new.</p>
        </div>
        {modules.length > 0 ? (
          <div className="p-stack">
            {modules.map((m, i) => (
              <Link key={m.id} href={`/${m.slug}`} className="p-mod" style={{ '--c': m.color, '--fg': m.fg, '--i': i } as React.CSSProperties}>
                <div className="p-mod__row">
                  <span className="p-num">{String(m.number).padStart(2, '0')}</span>
                  <span className="p-mod__go" aria-hidden="true"><ArrowRight size={24} /></span>
                </div>
                <h3>{m.title}</h3>
                {m.description && <p>{m.description}</p>}
                <div className="p-mod__meta">
                  <span>{plural(m.stops, 'lesson')}</span>
                  {m.zones.length > 0 && <span>{plural(m.zones.length, 'chapter')}</span>}
                  {m.minutes > 0 && <span>{formatJourney(m.minutes)}</span>}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-empty"><h3>Modules coming soon</h3><p>The first modules are being written. Check back shortly.</p></div>
        )}
      </section>

      {/* ── Picks (bento) ────────────────────────────────────────── */}
      {picks.length > 0 && (
        <section className="p-wrap p-sec" aria-labelledby="picks-title">
          <div className="p-sec-head">
            <h2 id="picks-title" className="p-display">{featured.length >= 3 ? 'Editor’s picks' : 'Most read'}</h2>
            <p>The lessons readers come back to most.</p>
          </div>
          <div className="p-bento">
            {picks.map((a, i) => {
              const m = moduleOf(a)
              return (
                <Tile
                  key={a.id}
                  variant={i === 0 ? 'big' : 'plain'}
                  slug={a.slug}
                  title={a.title}
                  summary={a.summary}
                  minutes={a.readingTimeMinutes}
                  imageUrl={a.coverImage?.url}
                  tags={a.articleTags.map((t) => t.tag.name)}
                  label={m ? `Module ${String(m.number).padStart(2, '0')} · ${m.title}` : 'Featured'}
                  color={m?.color}
                  fg={m?.fg}
                />
              )
            })}
          </div>
        </section>
      )}

      {/* ── Topic cloud ──────────────────────────────────────────── */}
      {tags.length > 0 && (
        <section className="p-wrap p-sec" aria-labelledby="topics-title">
          <div className="p-sec-head">
            <h2 id="topics-title" className="p-display">Jump to a topic</h2>
          </div>
          <div className="p-cloud" data-reveal>
            {tags.map((t, i) => {
              const sw = swatch(i)
              return (
                <Link key={t.id} href={`/search?q=${encodeURIComponent(t.name)}`} style={{ '--c': sw.color, '--fg': sw.fg } as React.CSSProperties}>
                  {t.name}<small>{t._count.articleTags}</small>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* ── Slide decks ──────────────────────────────────────────── */}
      {decks.length > 0 && (
        <section className="p-wrap p-sec" aria-labelledby="decks-title">
          <div className="p-sec-head">
            <h2 id="decks-title" className="p-display">Slide decks</h2>
            <p>Visual walkthroughs you can flick through in a few minutes. They open in a new tab.</p>
          </div>
          <div className="p-decks">
            {decks.map((d, i) => {
              const sw = swatch(i + 2)
              return (
                <a key={d.file} href={d.href} target="_blank" rel="noopener noreferrer" className="p-deck" style={{ '--c': sw.color, '--fg': sw.fg } as React.CSSProperties}>
                  <span className="pg" /><span className="pg" />
                  <span className="pg top">
                    <span className="p-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Presentation size={16} /> Deck</span>
                    <span style={{ display: 'grid', gap: 6 }}>
                      <h3>{d.title}</h3>
                      {d.description && <p>{d.description}</p>}
                    </span>
                  </span>
                </a>
              )
            })}
          </div>
        </section>
      )}

      {/* ── Newsletter ───────────────────────────────────────────── */}
      <section className="p-wrap p-news" aria-labelledby="news-title">
        <h2 id="news-title" className="p-display">Get the <em>next</em> one.</h2>
        <p>{newsletterContent.subheadline}</p>
        <NewsletterForm />
      </section>
    </>
  )
}
