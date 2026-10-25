// app/(public)/page.tsx — home: hero under the aurora, paths, picks and the topic constellation
import Link from 'next/link'
import fs from 'fs'
import path from 'path'
import type { Metadata } from 'next'
import { ArrowRight, ArrowUpRight, Clock } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { formatDate } from '@/lib/utils'
import { getNetwork, resolveLine, articleLineSelect, menuIdsOf, formatJourney, plural } from '@/lib/catalog'
import TitleReveal from '@/components/aurora/TitleReveal'
import ContinueShelf from '@/components/aurora/ContinueShelf'
import ReadMark from '@/components/aurora/ReadMark'
import CountUp from '@/components/aurora/CountUp'
import Constellation from '@/components/aurora/Constellation'
import { StarMark } from '@/components/aurora/Sky'
import NewsletterForm from '@/components/aurora/NewsletterForm'
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

async function getFrontPage() {
  try {
    const [featured, popular, latest, count, tags] = await Promise.all([
      prisma.article.findFirst({ where: { status: 'PUBLISHED', isFeatured: true }, orderBy: { createdAt: 'desc' }, select: cardSelect }),
      prisma.article.findFirst({ where: { status: 'PUBLISHED' }, orderBy: { viewCount: 'desc' }, select: cardSelect }),
      prisma.article.findMany({ where: { status: 'PUBLISHED' }, orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }], take: 6, select: cardSelect }),
      prisma.article.count({ where: { status: 'PUBLISHED' } }),
      prisma.tag.findMany({
        where: { articleTags: { some: { article: { status: 'PUBLISHED' } } } },
        orderBy: { name: 'asc' },
        select: { id: true, name: true, _count: { select: { articleTags: true } } },
      }),
    ])
    return { featured: featured ?? popular, latest, count, tags }
  } catch (err) {
    logger.error('[GET /] DB error loading front page', err)
    return { featured: null, latest: [], count: 0, tags: [] }
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

export default async function HomePage() {
  const [modules, { featured, latest, count, tags }] = await Promise.all([getNetwork(), getFrontPage()])
  const plates = getPlates()
  const moduleOf = (a: Parameters<typeof menuIdsOf>[0]) => resolveLine(modules, menuIdsOf(a))
  const totalMinutes = modules.reduce((s, m) => s + m.minutes, 0)
  const first = modules[0]
  const picks = [featured, ...latest.filter((a) => a.id !== featured?.id)].filter((a): a is NonNullable<typeof a> => !!a).slice(0, 6)
  const topics = tags.map((t) => ({ id: t.id, name: t.name, count: t._count.articleTags }))
  const two = (n: number) => String(n).padStart(2, '0')

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="a-wrap a-hero" aria-labelledby="home-title">
        <span className="a-pill"><span className="star"><StarMark size={14} /></span> A free, structured course on agentic AI</span>
        <TitleReveal text="Learn agentic AI, one calm read at a time." highlight="calm read" className="a-display" />
        <p className="a-dek">{heroContent.subheadline}</p>
        <div className="a-ctas">
          {first && <Link href={`/${first.slug}`} className="a-btn a-btn--accent">Start path 01 <ArrowRight size={17} /></Link>}
          <a href="#paths" className="a-btn">Explore all paths</a>
        </div>
        <div className="a-stats">
          <div className="a-stat a-glass"><CountUp value={modules.length} /><span>{modules.length === 1 ? 'Path' : 'Paths'}</span></div>
          <div className="a-stat a-glass"><CountUp value={count} /><span>{count === 1 ? 'Essay' : 'Essays'}</span></div>
          <div className="a-stat a-glass"><CountUp value={Math.max(1, Math.round(totalMinutes / 60))} suffix="h" /><span>Of reading</span></div>
          <div className="a-stat a-glass"><CountUp value={tags.length} /><span>Topics</span></div>
        </div>
      </section>

      <ContinueShelf />

      {/* ── Paths ─────────────────────────────────────────────────── */}
      <section id="paths" className="a-wrap a-sec" aria-labelledby="paths-title" style={{ scrollMarginTop: 'calc(var(--top-h) + 12px)' }}>
        <div className="a-sec-head a-sec-head--row">
          <div style={{ display: 'grid', gap: 10 }}>
            <span className="a-kicker a-kicker--accent">Learning paths</span>
            <h2 id="paths-title" className="a-display">Pick a <em>path</em></h2>
          </div>
          <p>Each path is a short course. Read its essays in order, or jump to whatever you need today.</p>
        </div>
        {modules.length > 0 ? (
          <div className="a-carousel" role="list">
            {modules.map((m) => (
              <Link key={m.id} href={`/${m.slug}`} role="listitem" className="a-path a-glass" style={{ '--c': m.color, '--fg': m.fg } as React.CSSProperties}>
                <span className="a-path__num" aria-hidden="true">{two(m.number)}</span>
                <div style={{ display: 'grid', gap: 10 }}>
                  <h3>{m.title}</h3>
                  {m.description && <p>{m.description}</p>}
                </div>
                <div className="a-path__foot">
                  <span className="a-meta">
                    <span>{plural(m.stops, 'essay')}</span>
                    {m.minutes > 0 && <span><Clock size={14} /> {formatJourney(m.minutes)}</span>}
                  </span>
                  <span className="a-path__go" aria-hidden="true"><ArrowRight size={20} /></span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="a-empty"><h3>The first paths are being written</h3><p>Check back soon.</p></div>
        )}
      </section>

      {/* ── Picks ─────────────────────────────────────────────────── */}
      {picks.length > 0 && (
        <section className="a-wrap a-sec" aria-labelledby="picks-title">
          <div className="a-sec-head a-sec-head--row">
            <div style={{ display: 'grid', gap: 10 }}>
              <span className="a-kicker a-kicker--accent">Fresh from the desk</span>
              <h2 id="picks-title" className="a-display">Worth reading <em>tonight</em></h2>
            </div>
            <Link href="/search" className="a-btn a-btn--quiet a-btn--sm">All essays <ArrowRight size={15} /></Link>
          </div>
          <div className="a-cards">
            {picks.map((a, i) => {
              const m = moduleOf(a)
              return (
                <Link key={a.id} href={`/articles/${a.slug}`} className="a-card" style={{ '--c': m?.color } as React.CSSProperties} data-reveal>
                  {a.coverImage?.url && (
                    <span className="a-card__img">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={a.coverImage.url} alt="" loading="lazy" />
                    </span>
                  )}
                  <span className="a-kicker" style={{ color: 'var(--c, var(--accent))' }}>
                    {i === 0 && featured ? 'Start here' : m ? `Path ${two(m.number)} · ${m.title}` : 'Essay'}
                  </span>
                  <h3>{a.title}</h3>
                  {a.summary && <p>{a.summary}</p>}
                  <span className="a-meta">
                    {a.readingTimeMinutes ? <span><Clock size={14} /> {a.readingTimeMinutes} min</span> : null}
                    {a.publishedAt && <span>{formatDate(a.publishedAt)}</span>}
                    <ReadMark slug={a.slug} />
                  </span>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* ── Topic constellation ───────────────────────────────────── */}
      {topics.length > 1 && (
        <section className="a-wrap a-sec" aria-labelledby="topics-title">
          <div className="a-sec-head">
            <span className="a-kicker a-kicker--accent">Map of ideas</span>
            <h2 id="topics-title" className="a-display">Every topic, <em>connected</em></h2>
            <p>Brighter stars appear in more essays. Neighbouring stars are ideas that sit close together.</p>
          </div>
          <div data-reveal><Constellation topics={topics} /></div>
        </section>
      )}

      {/* ── Slide decks ───────────────────────────────────────────── */}
      {plates.length > 0 && (
        <section className="a-wrap a-sec" aria-labelledby="decks-title">
          <div className="a-sec-head">
            <span className="a-kicker a-kicker--accent">Visual companions</span>
            <h2 id="decks-title" className="a-display">Slide decks</h2>
            <p>Illustrated decks that go with the essays. They open in a new tab.</p>
          </div>
          <ol className="a-lessons">
            {plates.map((p, i) => (
              <li key={p.file} data-reveal style={{ '--c': `var(--m${(i % 8) + 1})` } as React.CSSProperties}>
                <a href={p.href} target="_blank" rel="noopener noreferrer">
                  <span className="n" aria-hidden="true">{i + 1}</span>
                  <h3>{p.title}</h3>
                  {p.description && <p>{p.description}</p>}
                  <span className="row"><span>Opens in a new tab</span><ArrowUpRight size={14} aria-hidden="true" /></span>
                </a>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* ── The letter ────────────────────────────────────────────── */}
      <section className="a-wrap" aria-labelledby="letter-title">
        <div className="a-letter a-glass" data-reveal>
          <span className="a-kicker a-kicker--accent">The letter</span>
          <h2 id="letter-title" className="a-display">New essays, <em>quietly</em> delivered.</h2>
          <p>{newsletterContent.subheadline}</p>
          <NewsletterForm />
        </div>
      </section>
    </>
  )
}
