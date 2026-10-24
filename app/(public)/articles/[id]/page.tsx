// app/(public)/articles/[id]/page.tsx — the reader
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { Prisma } from '@prisma/client'
import { ArrowLeft, ArrowRight, Calendar, Clock, Eye } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { formatDate } from '@/lib/utils'
import { getNetwork, resolveLine, articleLineSelect, menuIdsOf, swatch } from '@/lib/catalog'
import ArticleContent from '@/components/public/ArticleContent'
import ArticleAudioPlayer from '@/components/public/ArticleAudioPlayer'
import { ArticleAudioProvider } from '@/components/public/ArticleAudioContext'
import SectionBlock from '@/components/pulse/SectionBlock'
import ListenButton from '@/components/pulse/ListenButton'
import ShareRow from '@/components/pulse/ShareRow'
import ReaderTools from '@/components/pulse/ReaderTools'
import Tile from '@/components/pulse/Tile'
import { ReadingProvider, ReadingBar, SectionCards, ReadingSide, ReadingPill, FinishLine } from '@/components/pulse/Reading'

interface Props { params: Promise<{ id: string }> }

export const revalidate = 300
export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
  try {
    const articles = await prisma.article.findMany({ where: { status: 'PUBLISHED' }, select: { slug: true } })
    return articles.map((a) => ({ id: a.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { id } = await params
    const article = await prisma.article.findUnique({
      where: { slug: id },
      select: {
        title: true,
        summary: true,
        seoTitle: true,
        seoDescription: true,
        seoKeywords: true,
        ogTitle: true,
        ogDescription: true,
        twitterTitle: true,
        twitterDescription: true,
        aiContentDeclaration: true,
        coverImage: { select: { url: true, width: true, height: true } },
      },
    })
    if (!article) return {}

    const resolvedTitle = article.seoTitle ?? article.title
    const resolvedDescription = article.seoDescription ?? article.summary ?? undefined
    const ogTitle = article.ogTitle || resolvedTitle
    const ogDesc = article.ogDescription || resolvedDescription
    const twitterTitle = article.twitterTitle || ogTitle
    const twitterDesc = article.twitterDescription || ogDesc
    const keywords = article.seoKeywords ? article.seoKeywords.split(',').map((k) => k.trim()).filter(Boolean) : undefined
    const coverImages = article.coverImage
      ? [{ url: article.coverImage.url, width: article.coverImage.width ?? undefined, height: article.coverImage.height ?? undefined }]
      : undefined

    return {
      title: resolvedTitle,
      description: resolvedDescription,
      keywords,
      openGraph: { title: ogTitle, description: ogDesc, ...(coverImages ? { images: coverImages } : {}) },
      twitter: {
        card: 'summary_large_image',
        title: twitterTitle,
        description: twitterDesc,
        ...(coverImages ? { images: coverImages.map((i) => i.url) } : {}),
      },
      other: {
        ...(article.aiContentDeclaration ? { 'ai-content-declaration': article.aiContentDeclaration } : {}),
        ...(article.seoKeywords ? { 'x-topic-keywords': article.seoKeywords } : {}),
      },
    }
  } catch (err) {
    logger.error('[generateMetadata /articles/[id]]', err)
    return {}
  }
}

const relatedSelect = {
  id: true,
  title: true,
  slug: true,
  summary: true,
  readingTimeMinutes: true,
  viewCount: true,
  status: true,
  coverImage: { select: { url: true } },
  ...articleLineSelect,
} as const

type RelatedArticle = Prisma.ArticleGetPayload<{ select: typeof relatedSelect }>

export default async function ArticleDetailPage({ params }: Props) {
  const { id } = await params
  let article
  try {
    article = await prisma.article.findUnique({
      where: { slug: id },
      include: {
        coverImage: { select: { url: true } },
        articleTags: { include: { tag: { select: { id: true, name: true } } } },
        sections: { orderBy: { order: 'asc' } },
        subMenuArticles: {
          include: {
            subMenu: {
              select: {
                id: true, title: true, slug: true, isVisible: true,
                menu: { select: { id: true, title: true, slug: true, isVisible: true } },
              },
            },
          },
        },
        menuArticles: { select: { menuId: true } },
        topicArticles: { select: { topicId: true }, take: 1 },
      },
    })
  } catch (err) {
    logger.error(`[GET /articles/${id}] DB error loading article`, err)
    throw err
  }
  if (!article) notFound()

  const sections = article.sections
  const isDraft = article.status !== 'PUBLISHED'

  // Best-effort view counter
  prisma.article.update({ where: { id: article.id }, data: { viewCount: { increment: 1 } } }).catch(() => {})

  const network = await getNetwork()
  const nav = article.subMenuArticles.find((s) => s.subMenu.isVisible && s.subMenu.menu.isVisible) ?? null
  const line = resolveLine(network, [
    nav?.subMenu.menu.id,
    ...article.subMenuArticles.map((s) => s.subMenu.menu.id),
    ...article.menuArticles.map((m) => m.menuId),
  ])
  const zone = nav && line ? line.zones.find((z) => z.id === nav.subMenu.id) ?? null : null
  const zoneIndex = zone && line ? line.zones.indexOf(zone) : -1
  const color = line?.color ?? 'var(--cobalt)'
  const tags = article.articleTags.map((t) => t.tag)

  // Neighbouring stops: the zone's running order, else the topic's
  let order: RelatedArticle[] = []
  let related: RelatedArticle[] = []
  try {
    if (nav) {
      const rows = await prisma.subMenuArticle.findMany({
        where: { subMenuId: nav.subMenu.id, article: { status: 'PUBLISHED' } },
        orderBy: { orderIndex: 'asc' },
        select: { article: { select: relatedSelect } },
      })
      order = rows.map((r) => r.article)
      related = rows.map((r) => r.article).filter((a) => a.id !== article.id)
    } else if (article.topicArticles[0]) {
      const rows = await prisma.topicArticle.findMany({
        where: { topicId: article.topicArticles[0].topicId, article: { status: 'PUBLISHED' } },
        orderBy: { orderIndex: 'asc' },
        select: { article: { select: relatedSelect } },
      })
      order = rows.map((r) => r.article)
      related = rows.map((r) => r.article).filter((a) => a.id !== article.id)
    }
    if (related.length < 3 && tags.length > 0) {
      const more = await prisma.article.findMany({
        where: {
          status: 'PUBLISHED',
          id: { notIn: [article.id, ...related.map((r) => r.id)] },
          articleTags: { some: { tagId: { in: tags.map((t) => t.id) } } },
        },
        take: 3 - related.length,
        orderBy: { viewCount: 'desc' },
        select: relatedSelect,
      })
      related = [...related, ...more]
    }
  } catch (err) {
    logger.error(`[GET /articles/${id}] DB error loading neighbours`, err)
  }
  const pos = order.findIndex((a) => a.id === article.id)
  const prev = pos > 0 ? order[pos - 1] : null
  const next = pos >= 0 && pos < order.length - 1 ? order[pos + 1] : null
  const relatedCards = related.filter((r) => r.id !== next?.id && r.id !== prev?.id).slice(0, 3)

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://appliedagentic.in'
  const articleUrl = `${siteUrl}/articles/${article.slug}`
  const fullContent = sections.length > 0 ? sections.map((s) => s.content).join('\n') : article.content
  const audioSections = sections.some((s) => s.audioUrl)
    ? sections.map((s) => ({ id: s.id, title: s.title, audioUrl: s.audioUrl }))
    : article.audioUrl
      ? [{ id: 0, title: article.title, audioUrl: article.audioUrl }]
      : []
  const minutes = article.readingTimeMinutes ?? 0
  const tools = <ReaderTools content={fullContent} title={article.title} />
  const modNum = line ? String(line.number).padStart(2, '0') : null
  const fg = line?.fg ?? 'var(--on-dark)'
  const sectionCards = sections
    .map((sec, i) => ({ sec, i }))
    .filter(({ sec }) => sec.title?.trim())
    .map(({ sec, i }) => ({ id: `section-${sec.id}`, title: sec.title, color: swatch(i + 1).color, fg: swatch(i + 1).fg }))

  return (
    <ArticleAudioProvider sections={audioSections}>
      <ReadingProvider slug={article.slug} title={article.title}>
        <div style={{ '--c': color, '--fg': fg } as React.CSSProperties}>
          <ReadingBar />

          <header className="p-art-cover">
            <div className="p-wrap p-art-cover__inner">
              {isDraft && <div className="p-draft">Draft preview · this article is not published</div>}
              <nav className="p-crumbs" aria-label="Breadcrumb">
                <Link href="/">Home</Link>
                {line && (<><span aria-hidden="true">/</span><Link href={`/${line.slug}`}>Module {modNum}</Link></>)}
                {line && zone && (<><span aria-hidden="true">/</span><Link href={`/${line.slug}/${zone.slug}`}>{zone.title}</Link></>)}
              </nav>
              {line && (
                <span className="p-label">
                  {line.title}{pos >= 0 && order.length > 1 ? ` · Lesson ${pos + 1} of ${order.length}` : ''}
                </span>
              )}
              <h1 className="p-display">{article.title}</h1>
              {article.summary && <p className="stand">{article.summary}</p>}
              <div className="p-cover__stats">
                {minutes > 0 && <span><Clock size={14} /> {minutes} min read</span>}
                {article.publishedAt && <span><Calendar size={14} /> {formatDate(article.publishedAt)}</span>}
                <span><Eye size={14} /> {article.viewCount.toLocaleString()} reads</span>
              </div>
              {tags.length > 0 && (
                <div className="p-tagrow">
                  {tags.map((t) => <Link key={t.id} href={`/search?q=${encodeURIComponent(t.name)}`}>#{t.name}</Link>)}
                </div>
              )}
              <div className="p-art-actions">
                <ListenButton />
                <ShareRow url={articleUrl} title={article.title} />
              </div>
            </div>
          </header>

          <div className="p-wrap">
            {article.coverImage && (
              <div className="p-art-image">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={article.coverImage.url} alt="" fetchPriority="high" />
              </div>
            )}

            <SectionCards sections={sectionCards} />

            <div className="p-read-grid">
              <article className="p-read-main" data-read-root>
                {sections.length > 0 ? (
                  sections.map((section, idx) => (
                    <SectionBlock key={section.id} section={section} index={idx} total={sections.length} />
                  ))
                ) : article.content ? (
                  <div className="p-first"><ArticleContent content={article.content} /></div>
                ) : (
                  <div className="p-empty"><h2>Coming soon</h2><p>This lesson has no content yet.</p></div>
                )}

                <FinishLine>
                  <h2 className="p-display">Lesson complete.</h2>
                  <p>{next ? 'Nice work. The next lesson is ready when you are.' : 'Nice work. You have reached the end of this chapter.'}</p>
                  {next && (
                    <Link href={`/articles/${next.slug}`} className="p-btn" style={{ color: 'var(--bg)', borderColor: 'var(--bg)' }}>
                      Next lesson <ArrowRight size={18} />
                    </Link>
                  )}
                </FinishLine>
              </article>

              <aside className="p-read-side" aria-label="Reading progress and tools">
                <ReadingSide minutes={minutes} />
                <div className="p-side-card">
                  <span className="p-label">Reading tools</span>
                  {tools}
                </div>
              </aside>
            </div>

            {(prev || next) && (
              <nav className="p-nextprev" aria-label="Previous and next lesson" style={{ maxWidth: 720 }}>
                {prev ? (
                  <Link href={`/articles/${prev.slug}`} className="p-next p-next--soft p-next--prev">
                    <span className="p-next__go" aria-hidden="true"><ArrowLeft size={22} /></span>
                    <div><span className="p-label">Previous lesson</span><h3>{prev.title}</h3></div>
                  </Link>
                ) : <span className="p-desktop-only" />}
                {next && (
                  <Link href={`/articles/${next.slug}`} className="p-next">
                    <div><span className="p-label">Up next</span><h3>{next.title}</h3></div>
                    <span className="p-next__go" aria-hidden="true"><ArrowRight size={22} /></span>
                  </Link>
                )}
              </nav>
            )}

            {relatedCards.length > 0 && (
              <section className="p-sec" aria-labelledby="related-title">
                <div className="p-sec-head">
                  <h2 id="related-title" className="p-display">Keep going</h2>
                  <p>More lessons on the same ideas.</p>
                </div>
                <div className="p-bento">
                  {relatedCards.map((r) => {
                    const m = resolveLine(network, menuIdsOf(r))
                    return (
                      <Tile
                        key={r.id}
                        slug={r.slug}
                        title={r.title}
                        summary={r.summary}
                        minutes={r.readingTimeMinutes}
                        label={m ? `Module ${String(m.number).padStart(2, '0')}` : null}
                        color={m?.color}
                        fg={m?.fg}
                      />
                    )
                  })}
                </div>
              </section>
            )}
          </div>

          <ReadingPill tools={tools} listen={<ListenButton variant="pill" />} />
          <ArticleAudioPlayer />
        </div>
      </ReadingProvider>
    </ArticleAudioProvider>
  )
}
