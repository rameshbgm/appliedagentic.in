// app/(public)/articles/[id]/page.tsx — the reader
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { Prisma } from '@prisma/client'
import { ArrowLeft, ArrowRight, Calendar, Clock, Eye } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { formatDate } from '@/lib/utils'
import { getNetwork, resolveLine, articleLineSelect, menuIdsOf } from '@/lib/catalog'
import ArticleContent from '@/components/public/ArticleContent'
import ArticleAudioPlayer from '@/components/public/ArticleAudioPlayer'
import { ArticleAudioProvider } from '@/components/public/ArticleAudioContext'
import SectionBlock from '@/components/aurora/SectionBlock'
import ListenButton from '@/components/aurora/ListenButton'
import TitleReveal from '@/components/aurora/TitleReveal'
import LessonList from '@/components/aurora/LessonList'
import AiSummaryButton from '@/components/aurora/AiSummaryButton'
import { ReaderProvider, ProgressLine, ResumeBanner, LearnCard, MarginToc, MarginNotes, Highlighter, Ruler, Orbit, FinishCard } from '@/components/aurora/Reader'

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
  const color = line?.color ?? 'var(--accent)'
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
  const chapterLabel = line ? `Path ${String(line.number).padStart(2, '0')}` : null
  const learn = sections.filter((s) => s.title?.trim()).map((s) => ({ id: `section-${s.id}`, label: s.title }))

  return (
    <ArticleAudioProvider sections={audioSections}>
      <ReaderProvider slug={article.slug} title={article.title} minutes={minutes} color={color} module={chapterLabel ?? undefined}>
        <div style={{ '--c': color } as React.CSSProperties}>
          <ProgressLine />

          <header className="a-wrap a-art-head">
            {isDraft && <div className="a-draft">Draft preview · this essay is not published</div>}
            <nav className="a-crumbs" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              {line && (<><span aria-hidden="true">/</span><Link href={`/${line.slug}`}>{chapterLabel}</Link></>)}
              {line && zone && (<><span aria-hidden="true">/</span><Link href={`/${line.slug}/${zone.slug}`}>{zone.title}</Link></>)}
            </nav>
            {line && (
              <span className="a-kicker" style={{ color }}>
                {line.title}{pos >= 0 && order.length > 1 ? ` · Essay ${pos + 1} of ${order.length}` : ''}
              </span>
            )}
            <TitleReveal text={article.title} className="a-display" />
            {article.summary && <p className="a-dek">{article.summary}</p>}
            <div className="a-byline">
              {minutes > 0 && <span><Clock size={14} /> {minutes} min read</span>}
              {article.publishedAt && <span><Calendar size={14} /> {formatDate(article.publishedAt)}</span>}
              <span><Eye size={14} /> {article.viewCount.toLocaleString()} readers</span>
            </div>
            {tags.length > 0 && (
              <div className="a-tags">{tags.map((t) => <Link key={t.id} href={`/search?q=${encodeURIComponent(t.name)}`}>{t.name}</Link>)}</div>
            )}
            <div className="a-ctas" style={{ justifyContent: 'center' }}>
              <ListenButton />
              <AiSummaryButton content={fullContent} title={article.title} />
            </div>
          </header>

          {article.coverImage && (
            <div className="a-wrap">
              <figure className="a-figure">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={article.coverImage.url} alt="" fetchPriority="high" />
              </figure>
            </div>
          )}

          <div className="a-wrap a-reader">
            <div className="a-reader__left"><MarginToc /></div>

            <article className="a-reader__main" data-read-root>
              <ResumeBanner />
              <LearnCard items={learn} />
              {sections.length > 0 ? (
                sections.map((section, idx) => (
                  <SectionBlock key={section.id} section={section} index={idx} total={sections.length} />
                ))
              ) : article.content ? (
                <div className="a-dropcap"><ArticleContent content={article.content} /></div>
              ) : (
                <div className="a-empty"><h2>Being written</h2><p>This essay has no text yet.</p></div>
              )}

              <FinishCard>
                <h2 className="a-display">{next ? <>You made it. <em>Next?</em></> : <>You made it to <em>the end</em>.</>}</h2>
                <p>{next ? `Next in ${zone?.title ?? 'this path'}: ${next.title}.` : 'That was the last essay in this milestone. Pick another path to keep going.'}</p>
                <div className="a-ctas" style={{ justifyContent: 'center' }}>
                  {next
                    ? <Link href={`/articles/${next.slug}`} className="a-btn a-btn--accent">Read the next essay <ArrowRight size={17} /></Link>
                    : <Link href="/#paths" className="a-btn a-btn--accent">See all paths</Link>}
                  <Link href="/library" className="a-btn a-btn--quiet">Your library</Link>
                </div>
              </FinishCard>
            </article>

            <div className="a-reader__right"><MarginNotes /></div>
          </div>

          <div className="a-wrap a-narrow">
            {(prev || next) && (
              <nav className="a-nextprev" aria-label="Previous and next essay">
                {prev ? (
                  <Link href={`/articles/${prev.slug}`} className="a-next a-next--quiet a-next--prev a-glass">
                    <span className="go" aria-hidden="true"><ArrowLeft size={20} /></span>
                    <div><span className="a-kicker">Previous</span><h3>{prev.title}</h3></div>
                  </Link>
                ) : <span className="a-desktop-only" />}
                {next && (
                  <Link href={`/articles/${next.slug}`} className="a-next a-glass">
                    <div><span className="a-kicker">Next</span><h3>{next.title}</h3></div>
                    <span className="go" aria-hidden="true"><ArrowRight size={20} /></span>
                  </Link>
                )}
              </nav>
            )}

            {relatedCards.length > 0 && (
              <section className="a-sec" aria-labelledby="related-title">
                <div className="a-sec-head">
                  <span className="a-kicker a-kicker--accent">Further reading</span>
                  <h2 id="related-title" className="a-display">You might read next</h2>
                </div>
                <LessonList
                  lessons={relatedCards.map((r) => ({ id: r.id, slug: r.slug, title: r.title, summary: r.summary, minutes: r.readingTimeMinutes, imageUrl: r.coverImage?.url }))}
                  showThumbs
                />
              </section>
            )}
          </div>

          <Highlighter />
          <Ruler />
          <Orbit listen={<ListenButton variant="toolbar" />} />
          <ArticleAudioPlayer />
        </div>
      </ReaderProvider>
    </ArticleAudioProvider>
  )
}
