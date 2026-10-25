// app/(public)/page.tsx — the front page
import Link from 'next/link'
import fs from 'fs'
import path from 'path'
import type { Metadata } from 'next'
import { ArrowRight, Clock, Plus } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { formatDate } from '@/lib/utils'
import { getNetwork, resolveLine, articleLineSelect, menuIdsOf, formatJourney, plural, swatch, toRoman } from '@/lib/catalog'
import TitleReveal from '@/components/folio/TitleReveal'
import ContinueShelf from '@/components/folio/ContinueShelf'
import ReadMark from '@/components/folio/ReadMark'
import NewsletterForm from '@/components/folio/NewsletterForm'
import { heroContent } from '@/content/home'
import { newsletterContent } from '@/content/newsletter'

export const metadata: Metadata = {
  title: 'Applied Agentic AI | Master AI Agents & LLMs',
  description: 'Your comprehensive, structured guide to understanding and building AI-powered agentic systems.',
}

export const dynamic = 'force-dynamic'

const cardSelect = {
  id: true, title: true, slug: true, summary: true, readingTimeMinutes: true, viewCount: true, publishedAt: true,
  coverImage: { select: { url: true } },
  ...articleLineSelect,
} as const

const published = { article: { status: 'PUBLISHED' as const } }
const rowSelect = { article: { select: { id: true, title: true, slug: true, readingTimeMinutes: true } } } as const

async function getFrontPage() {
  try {
    const [featured, popular, latest, count, tags, contents] = await Promise.all([
      prisma.article.findFirst({ where: { status: 'PUBLISHED', isFeatured: true }, orderBy: { createdAt: 'desc' }, select: cardSelect }),
      prisma.article.findFirst({ where: { status: 'PUBLISHED' }, orderBy: { viewCount: 'desc' }, select: cardSelect }),
      prisma.article.findMany({ where: { status: 'PUBLISHED' }, orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }], take: 6, select: cardSelect }),
      prisma.article.count({ where: { status: 'PUBLISHED' } }),
      prisma.tag.findMany({
        where: { articleTags: { some: { article: { status: 'PUBLISHED' } } } },
        orderBy: { name: 'asc' },
        select: { id: true, name: true, _count: { select: { articleTags: true } } },
      }),
      prisma.navMenu.findMany({
        where: { isVisible: true },
        orderBy: { order: 'asc' },
        select: {
          id: true,
          subMenus: {
            where: { isVisible: true },
            orderBy: { order: 'asc' },
            select: { id: true, title: true, slug: true, articles: { where: published, orderBy: { orderIndex: 'asc' }, select: rowSelect } },
          },
          menuArticles: { where: published, orderBy: { orderIndex: 'asc' }, select: rowSelect },
        },
      }),
    ])
    return { featured: featured ?? popular, latest, count, tags, contents }
  } catch (err) {
    logger.error('[GET /] DB error loading front page', err)
    return { featured: null, latest: [], count: 0, tags: [], contents: [] }
  }
}

function getPlates() {
  try {
    const dir = path.join(process.cwd(), 'public')
    return fs.readdirSync(dir).filter((f) => /\.html?$/.test(f)).map((f) => {
      let title = f.replace(/\.(html|htm)$/, '').replace(/[-_]/g, ' ')
      let description: string | null = null
      try {
        const html = fs.readFileSync(path.join(dir, f), 'utf8')
        const t = html.match(/<title[^>]*>([^<]+)<\/title>/i)
        if (t) title = t[1].trim()
        const d = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i)
        if (d) description = d[1].trim()
      } catch { /* fall back to the file name */ }
      return { file: f, title, description, href: `/${f}` }
    })
  } catch {
    return []
  }
}

export default async function FrontPage() {
  const [modules, { featured, latest, count, tags, contents }] = await Promise.all([getNetwork(), getFrontPage()])
  const plates = getPlates()
  const moduleOf = (a: Parameters<typeof menuIdsOf>[0]) => resolveLine(modules, menuIdsOf(a))
  const totalMinutes = modules.reduce((s, m) => s + m.minutes, 0)
  const first = modules[0]
  const featMod = featured ? moduleOf(featured) : null
  const index = Object.entries(
    tags.reduce<Record<string, typeof tags>>((acc, t) => {
      const k = t.name.charAt(0).toUpperCase()
      ;(acc[/[A-Z]/.test(k) ? k : '#'] ??= []).push(t)
      return acc
    }, {}),
  ).sort(([a], [b]) => a.localeCompare(b))
  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <>
      {/* ── Masthead hero ─────────────────────────────────────────── */}
      <section className="f-wrap f-hero" aria-labelledby="front-title">
        <div className="f-hero__issue">
          <span className="f-kicker">{today}</span>
          <span className="f-kicker">{plural(modules.length, 'module')}</span>
          <span className="f-kicker">{plural(count, 'essay')}</span>
          {totalMinutes > 0 && <span className="f-kicker">{Math.round(totalMinutes / 60)} hours of reading</span>}
        </div>
        <TitleReveal text="Learn agentic AI the way you read a good book." highlight="good book" className="f-display" />
        <div className="f-hero__foot">
          <p className="f-dek">{heroContent.subheadline} Free, structured, and written to be read slowly.</p>
          <div className="f-ctas">
            {first && <Link href={`/${first.slug}`} className="f-btn f-btn--ink">Begin with chapter I <ArrowRight size={17} /></Link>}
            <a href="#contents" className="f-btn">Browse the contents</a>
          </div>
        </div>
      </section>

      <ContinueShelf />

      {/* ── Featured essay ────────────────────────────────────────── */}
      {featured && (
        <section className="f-wrap f-sec" aria-labelledby="feature-title">
          <div className="f-sec-head">
            <span className="f-kicker f-kicker--accent">The essay to read first</span>
          </div>
          <Link href={`/articles/${featured.slug}`} className="f-spread" style={{ '--c': featMod?.color ?? 'var(--accent)', '--fg': featMod?.fg ?? '#fff' } as React.CSSProperties} data-reveal>
            <div className="f-spread__cover">
              {featured.coverImage?.url
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={featured.coverImage.url} alt="" loading="lazy" />
                : <><span className="pat" aria-hidden="true" /><span className="big" aria-hidden="true">{featMod ? toRoman(featMod.number) : '§'}</span></>}
            </div>
            <div className="f-spread__text">
              {featMod && <span className="f-kicker" style={{ color: 'var(--c)' }}>Chapter {toRoman(featMod.number)} · {featMod.title}</span>}
              <h3 id="feature-title">{featured.title}</h3>
              {featured.summary && <p>{featured.summary}</p>}
              <span className="f-meta">
                {featured.readingTimeMinutes ? <span><Clock size={14} /> {featured.readingTimeMinutes} min read</span> : null}
                {featured.viewCount > 0 && <span>{featured.viewCount.toLocaleString()} readers</span>}
                <ReadMark slug={featured.slug} />
              </span>
            </div>
          </Link>
        </section>
      )}

      {/* ── Contents ──────────────────────────────────────────────── */}
      <section id="contents" className="f-wrap f-sec" aria-labelledby="contents-title" style={{ scrollMarginTop: 'calc(var(--top-h) + 12px)' }}>
        <div className="f-sec-head">
          <span className="f-kicker f-kicker--accent">The course</span>
          <h2 id="contents-title" className="f-display">Contents</h2>
          <p>Each module is a chapter. Open one to see its sections and essays, or read straight through from the beginning.</p>
        </div>
        {modules.length > 0 ? (
          <ol className="f-toc">
            {modules.map((m, i) => {
              const data = contents.find((c) => c.id === m.id)
              return (
                <li key={m.id} style={{ '--c': m.color } as React.CSSProperties} data-reveal>
                  <details open={i === 0}>
                    <summary>
                      <span className="roman">{toRoman(m.number)}.</span>
                      <span className="ttl">{m.title}</span>
                      <span className="mins">{m.minutes > 0 ? formatJourney(m.minutes) : plural(m.stops, 'essay')} <Plus size={16} aria-hidden="true" /></span>
                    </summary>
                    <div className="f-toc__body">
                      {m.description && <p>{m.description}</p>}
                      {data?.subMenus.map((z) => (
                        <div key={z.id} className="f-toc__chap">
                          <h4 className="f-kicker">{z.title}</h4>
                          <ol className="f-rows">
                            {z.articles.map(({ article: a }, k) => (
                              <li key={a.id}>
                                <Link href={`/articles/${a.slug}`}>
                                  <span className="n">{k + 1}</span>
                                  <span className="t"><b>{a.title}</b><i aria-hidden="true" /></span>
                                  <span className="m"><ReadMark slug={a.slug} />{a.readingTimeMinutes ? `${a.readingTimeMinutes} min` : ''}</span>
                                </Link>
                              </li>
                            ))}
                          </ol>
                        </div>
                      ))}
                      {data && data.menuArticles.length > 0 && (
                        <ol className="f-rows">
                          {data.menuArticles.map(({ article: a }, k) => (
                            <li key={a.id}>
                              <Link href={`/articles/${a.slug}`}>
                                <span className="n">{k + 1}</span>
                                <span className="t"><b>{a.title}</b><i aria-hidden="true" /></span>
                                <span className="m">{a.readingTimeMinutes ? `${a.readingTimeMinutes} min` : ''}</span>
                              </Link>
                            </li>
                          ))}
                        </ol>
                      )}
                      <div className="f-toc__actions">
                        <Link href={`/${m.slug}`} className="f-btn f-btn--quiet f-btn--sm">Open chapter {toRoman(m.number)} <ArrowRight size={15} /></Link>
                      </div>
                    </div>
                  </details>
                </li>
              )
            })}
          </ol>
        ) : (
          <div className="f-empty"><h3>The first chapters are being written</h3><p>Check back soon.</p></div>
        )}
      </section>

      {/* ── Recently added ────────────────────────────────────────── */}
      {latest.length > 0 && (
        <section className="f-wrap f-sec" aria-labelledby="latest-title">
          <div className="f-sec-head f-sec-head--row">
            <div style={{ display: 'grid', gap: 8 }}>
              <span className="f-kicker f-kicker--accent">New on the shelf</span>
              <h2 id="latest-title" className="f-display">Recently added</h2>
            </div>
            <Link href="/search" className="f-btn f-btn--quiet f-btn--sm">All essays <ArrowRight size={15} /></Link>
          </div>
          <ol className="f-lessons">
            {latest.map((a) => {
              const m = moduleOf(a)
              return (
                <li key={a.id} data-reveal style={{ '--c': m?.color } as React.CSSProperties}>
                  <Link href={`/articles/${a.slug}`}>
                    <span className="n" aria-hidden="true">{m ? toRoman(m.number) : '§'}</span>
                    <h3>{a.title}</h3>
                    {a.summary && <p>{a.summary}</p>}
                    <span className="row">
                      {a.publishedAt && <span>{formatDate(a.publishedAt)}</span>}
                      {a.readingTimeMinutes ? <span>{a.readingTimeMinutes} min read</span> : null}
                      <ReadMark slug={a.slug} />
                    </span>
                  </Link>
                </li>
              )
            })}
          </ol>
        </section>
      )}

      {/* ── Index of topics ───────────────────────────────────────── */}
      {index.length > 0 && (
        <section className="f-wrap f-sec" aria-labelledby="index-title">
          <div className="f-sec-head">
            <span className="f-kicker f-kicker--accent">Back of the book</span>
            <h2 id="index-title" className="f-display">Index</h2>
            <p>Every topic covered, A to Z. The number shows how many essays discuss it.</p>
          </div>
          <div className="f-index" data-reveal>
            {index.map(([letter, items]) => (
              <section key={letter}>
                <h4>{letter}</h4>
                {items.map((t) => (
                  <Link key={t.id} href={`/search?q=${encodeURIComponent(t.name)}`}>{t.name}<span>{t._count.articleTags}</span></Link>
                ))}
              </section>
            ))}
          </div>
        </section>
      )}

      {/* ── Plates (slide decks) ──────────────────────────────────── */}
      {plates.length > 0 && (
        <section className="f-wrap f-sec" aria-labelledby="plates-title">
          <div className="f-sec-head">
            <span className="f-kicker f-kicker--accent">Illustrated plates</span>
            <h2 id="plates-title" className="f-display">Slide decks</h2>
            <p>Visual companions to the essays. They open in a new tab.</p>
          </div>
          <div className="f-plates">
            {plates.map((p, i) => {
              const sw = swatch(i + 1)
              return (
                <a key={p.file} href={p.href} target="_blank" rel="noopener noreferrer" className="f-plate" style={{ '--c': sw.color, '--fg': sw.fg } as React.CSSProperties} data-reveal>
                  <span className="f-plate__art" aria-hidden="true">{toRoman(i + 1)}</span>
                  <span style={{ minWidth: 0 }}>
                    <h3>{p.title}</h3>
                    {p.description && <p>{p.description}</p>}
                  </span>
                  <ArrowRight size={18} aria-hidden="true" />
                </a>
              )
            })}
          </div>
        </section>
      )}

      {/* ── The letter ────────────────────────────────────────────── */}
      <section className="f-wrap" aria-labelledby="letter-title">
        <div className="f-letter" data-reveal>
          <span className="f-kicker f-kicker--accent">The letter</span>
          <h2 id="letter-title" className="f-display">One new essay, <em>delivered</em>.</h2>
          <p>{newsletterContent.subheadline}</p>
          <NewsletterForm />
        </div>
      </section>
    </>
  )
}
