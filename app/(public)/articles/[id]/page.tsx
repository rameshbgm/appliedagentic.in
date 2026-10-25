// app/(public)/articles/[id]/page.tsx — the reader ("the ride")
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { Prisma } from '@prisma/client'
import { ArrowLeft, ArrowRight, Calendar, Clock, Eye } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { auth } from '@/lib/auth'
import { getSiteSettings } from '@/lib/site-settings'
import { formatDate } from '@/lib/utils'
import { getNetwork, resolveLine, articleLineSelect, menuIdsOf } from '@/lib/transit'
import ArticleContent from '@/components/public/ArticleContent'
import ArticleAudioPlayer from '@/components/public/ArticleAudioPlayer'
import { ArticleAudioProvider } from '@/components/public/ArticleAudioContext'
import SectionBlock from '@/components/transit/SectionBlock'
import ListenButton from '@/components/transit/ListenButton'
import ShareRow from '@/components/transit/ShareRow'
import ReaderTools from '@/components/transit/ReaderTools'
import StopCard from '@/components/transit/StopCard'
import { RideProvider, RideBar, RideSideMap, RideFab } from '@/components/transit/Ride'

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
        status: true,
        summary: true,
        seoTitle: true,
        seoDescription: true,
        seoKeywords: true,
        seoCanonicalUrl: true,
        ogTitle: true,
        ogDescription: true,
        twitterTitle: true,
        twitterDescription: true,
        aiContentDeclaration: true,
        coverImage: { select: { url: true, width: true, height: true } },
      },
    })
    if (!article) return {}
    if (article.status !== 'PUBLISHED' && !await auth()) return { title: 'Article not found', robots: { index: false, follow: false } }

    const resolvedTitle = article.seoTitle ?? article.title
    const resolvedDescription = article.seoDescription ?? article.summary ?? undefined
    const ogTitle = article.ogTitle || resolvedTitle
    const ogDesc = article.ogDescription || resolvedDescription
    const twitterTitle = article.twitterTitle || ogTitle
    const twitterDesc = article.twitterDescription || ogDesc
    const keywords = article.seoKeywords ? article.seoKeywords.split(',').map((k) => k.trim()).filter(Boolean) : undefined
    const { showArticleImages } = await getSiteSettings()
    const coverImages = showArticleImages && article.coverImage
      ? [{ url: article.coverImage.url, width: article.coverImage.width ?? undefined, height: article.coverImage.height ?? undefined }]
      : undefined

    return {
      title: resolvedTitle,
      description: resolvedDescription,
      keywords,
      alternates: { canonical: article.seoCanonicalUrl || `/articles/${id}` },
      robots: article.status === 'PUBLISHED'
        ? { index: true, follow: true }
        : { index: false, follow: false },
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
        coverImage: { select: { url: true, altText: true } },
        author: { select: { name: true } },
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
  if (isDraft && !await auth()) notFound()

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
  const color = line?.color ?? 'var(--l2)'
  const tags = article.articleTags.map((t) => t.tag)

  // Keep the zone's related stops; continue the journey across zones for path-only lessons.
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
      if (!article.topicArticles[0]) {
        const pathRows = await prisma.subMenuArticle.findMany({
          where: {
            subMenu: { menuId: nav.subMenu.menu.id, isVisible: true },
            article: { status: 'PUBLISHED' },
          },
          orderBy: [{ subMenu: { order: 'asc' } }, { orderIndex: 'asc' }, { id: 'asc' }],
          select: { article: { select: relatedSelect } },
        })
        order = pathRows.map((r) => r.article)
      }
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

  const { siteUrl, showArticleImages } = await getSiteSettings()
  const articleUrl = `${siteUrl}/articles/${article.slug}`
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.seoDescription || article.summary,
    mainEntityOfPage: article.seoCanonicalUrl || articleUrl,
    datePublished: article.publishedAt?.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    author: { '@type': 'Person', name: article.author.name },
    publisher: { '@type': 'Organization', name: 'Applied Agentic AI', url: siteUrl },
    ...(showArticleImages && article.coverImage ? { image: new URL(article.coverImage.url, siteUrl).href } : {}),
    ...(article.audioUrl ? { audio: { '@type': 'AudioObject', contentUrl: new URL(article.audioUrl, siteUrl).href, encodingFormat: article.audioUrl.endsWith('.mp3') ? 'audio/mpeg' : 'audio/wav', name: `${article.title}: AI-generated narration` } } : {}),
    keywords: tags.map((tag) => tag.name),
    inLanguage: 'en',
  }
  const fullContent = sections.length > 0 ? sections.map((s) => s.content).join('\n') : article.content
  const audioSections = sections.some((s) => s.audioUrl)
    ? sections.map((s) => ({ id: s.id, title: s.title, audioUrl: s.audioUrl }))
    : article.audioUrl
      ? [{ id: 0, title: article.title, audioUrl: article.audioUrl }]
      : []
  const minutes = article.readingTimeMinutes ?? 0
  const otherLines = network.filter((l) => l.id !== line?.id).slice(0, 4)
  const tools = <ReaderTools content={fullContent} title={article.title} />

  return (
    <ArticleAudioProvider key={article.slug} sections={audioSections}>
      {!isDraft && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }} />}
      <RideProvider key={article.slug} slug={article.slug} title={article.title} minutes={minutes}>
        <div style={{ '--c': color } as React.CSSProperties}>
          {isDraft && <div className="tr-draft">Draft preview · this article is not published</div>}
          <RideBar />

          <div className="tr-wrap">
            <header className="tr-art-head">
              <nav className="tr-crumbs" aria-label="Breadcrumb">
                <Link href="/">Network</Link>
                {line && (<><span aria-hidden="true">›</span><Link href={`/${line.slug}`}>Line {line.number}</Link></>)}
                {line && zone && (<><span aria-hidden="true">›</span><Link href={`/${line.slug}/${zone.slug}`}>{zone.title}</Link></>)}
              </nav>

              {line && (
                <span className="tr-line-tag" style={{ color }}>
                  <span className="tr-roundel">{line.number}</span>
                  <span>
                    {line.title}
                    {zone ? ` · Zone ${zoneIndex + 1}` : ''}
                    {pos >= 0 && order.length > 1 ? ` · Stop ${pos + 1} of ${order.length}` : ''}
                  </span>
                </span>
              )}

              <h1 className="tr-display">{article.title}</h1>
              {article.summary && <p className="standfirst">{article.summary}</p>}

              <div className="tr-art-meta">
                {minutes > 0 && <span><Clock size={14} /> {minutes} min ride</span>}
                {article.publishedAt && <span><Calendar size={14} /> {formatDate(article.publishedAt)}</span>}
                <span><Eye size={14} /> {article.viewCount.toLocaleString()} riders</span>
              </div>

              {tags.length > 0 && (
                <div className="tr-art-tags">
                  {tags.map((t) => <Link key={t.id} href={`/search?q=${encodeURIComponent(t.name)}`}>{t.name}</Link>)}
                </div>
              )}

              <div className="tr-art-actions">
                <ListenButton />
                <ShareRow url={articleUrl} title={article.title} />
              </div>
            </header>

            {showArticleImages && article.coverImage && (
              <div className="tr-cover" style={{ maxWidth: 1000 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={article.coverImage.url} alt={article.coverImage.altText || article.title} fetchPriority="high" />
              </div>
            )}

            <div className="tr-read-grid">
              <aside className="tr-read-side" aria-label="Reading tools and contents">
                <div className="tr-side-card">
                  <span className="tr-eyebrow">Reader tools</span>
                  {tools}
                </div>
                <RideSideMap />
              </aside>

              <article className="tr-read-main" data-ride-root>
                {sections.length > 0 ? (
                  sections.map((section, idx) => (
                    <SectionBlock key={section.id} section={section} index={idx} total={sections.length} showImages={showArticleImages} />
                  ))
                ) : article.content ? (
                  <ArticleContent content={article.content} showImages={showArticleImages} />
                ) : (
                  <div className="tr-empty"><h2>Stop under construction</h2><p>This article has no content yet.</p></div>
                )}
              </article>

              {(prev || next) && (
                <nav className="tr-nextprev tr-reader-nextprev" aria-label="Previous and next stop" style={{ maxWidth: 720 }}>
                  {prev ? (
                    <Link href={`/articles/${prev.slug}`} className="tr-np tr-np--prev">
                      <span className="arrow"><ArrowLeft size={20} /></span>
                      <div><span className="tr-eyebrow">Previous stop</span><h3>{prev.title}</h3></div>
                    </Link>
                  ) : <span className="tr-desktop-only" />}
                  {next && (
                    <Link href={`/articles/${next.slug}`} className="tr-np tr-np--next">
                      <div><span className="tr-eyebrow">Next stop</span><h3>{next.title}</h3></div>
                      <span className="arrow"><ArrowRight size={20} /></span>
                    </Link>
                  )}
                </nav>
              )}
            </div>

            {relatedCards.length > 0 && (
              <section className="tr-sec" aria-labelledby="related-title">
                <div className="tr-sec-head">
                  <h2 id="related-title" className="tr-display">Also on this route</h2>
                </div>
                <div className="tr-cards">
                  {relatedCards.map((r) => {
                    const l = resolveLine(network, menuIdsOf(r))
                    return (
                      <StopCard
                        key={r.id}
                        slug={r.slug}
                        title={r.title}
                        summary={r.summary}
                        minutes={r.readingTimeMinutes}
                        views={r.viewCount}
                        label={l ? `Line ${l.number} · ${l.title}` : null}
                        color={l?.color}
                      />
                    )
                  })}
                </div>
              </section>
            )}

            {otherLines.length > 0 && (
              <div className="tr-change" style={{ padding: '28px 0 40px' }}>
                Change here for
                {otherLines.map((l) => (
                  <Link key={l.id} href={`/${l.slug}`} style={{ '--c': l.color } as React.CSSProperties}>
                    <span className="tr-roundel" style={{ '--s': '24px' } as React.CSSProperties}>{l.number}</span>{l.title}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <RideFab tools={tools} />
          <ArticleAudioPlayer />
        </div>
      </RideProvider>
    </ArticleAudioProvider>
  )
}
