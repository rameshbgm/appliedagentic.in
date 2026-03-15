// app/(public)/articles/[articleSlug]/page.tsx
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { notFound } from 'next/navigation'
import LazyImage from '@/components/shared/LazyImage'
import Link from 'next/link'
import ArticleContent from '@/components/public/ArticleContent'
import ArticleAudioPlayer from '@/components/public/ArticleAudioPlayer'
import RelatedArticles from '@/components/public/RelatedArticles'
import ReadingProgressBar from '@/components/public/ReadingProgressBar'
import TableOfContents from '@/components/public/TableOfContents'
import ArticleReaderTools from '@/components/public/ArticleReaderTools'
import MobileArticlePanel from '@/components/public/MobileArticlePanel'
import ShareButtons from '@/components/public/ShareButtons'
import SectionCard from '@/components/public/SectionCard'
import { formatDate } from '@/lib/utils'
import { Clock, Eye, Calendar, ArrowLeft, ArrowRight, ChevronRight } from 'lucide-react'
import type { Metadata } from 'next'

type ArticleSection = { id: number; articleId: number; title: string; content: string; order: number; createdAt: Date; updatedAt: Date }

interface Props { params: Promise<{ id: string }> }

export const revalidate = 300
export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
  try {
    const articles = await prisma.article.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true },
    })
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

    const resolvedTitle       = article.seoTitle       ?? article.title
    const resolvedDescription = article.seoDescription ?? article.summary ?? undefined
    const ogTitle             = article.ogTitle         || resolvedTitle
    const ogDesc              = article.ogDescription   || resolvedDescription
    const twitterTitle        = article.twitterTitle    || ogTitle
    const twitterDesc         = article.twitterDescription || ogDesc

    const keywords = article.seoKeywords
      ? article.seoKeywords.split(',').map((k) => k.trim()).filter(Boolean)
      : undefined

    const coverImages = article.coverImage
      ? [{ url: article.coverImage.url, width: article.coverImage.width ?? undefined, height: article.coverImage.height ?? undefined }]
      : undefined

    return {
      title: resolvedTitle,
      description: resolvedDescription,
      keywords,
      openGraph: {
        title: ogTitle,
        description: ogDesc,
        ...(coverImages ? { images: coverImages } : {}),
      },
      twitter: {
        card: 'summary_large_image',
        title: twitterTitle,
        description: twitterDesc,
        ...(coverImages ? { images: coverImages.map((i) => i.url) } : {}),
      },
      other: {
        ...(article.aiContentDeclaration
          ? { 'ai-content-declaration': article.aiContentDeclaration }
          : {}),
        ...(article.seoKeywords
          ? { 'x-topic-keywords': article.seoKeywords }
          : {}),
      },
    }
  } catch (err) {
    logger.error('[generateMetadata /articles/[id]]', err)
    return {}
  }
}

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
                id: true, title: true, slug: true,
                menu: { select: { id: true, title: true, slug: true } },
              },
            },
          },
        },
        topicArticles: {
          include: {
            topic: {
              select: {
                id: true, name: true, slug: true,
                module: { select: { id: true, name: true, slug: true, color: true, icon: true } },
                topicArticles: {
                  where: { article: { status: 'PUBLISHED' } },
                  take: 4,
                  include: {
                    article: {
                      include: {
                        articleTags: { include: { tag: { select: { name: true } } } },
                        topicArticles: {
                          take: 1,
                          include: {
                            topic: { select: { module: { select: { name: true, color: true } } } },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    })
  } catch (err) {
    logger.error(`[GET /articles/${id}] DB error loading article`, err)
    throw err
  }

  if (!article) notFound()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sections: ArticleSection[] = (article as any).sections ?? []
  const isDraft = article.status !== 'PUBLISHED'

  // Increment view count (best-effort, noncritical)
  prisma.article.update({ where: { id: article.id }, data: { viewCount: { increment: 1 } } }).catch(() => {})

  const articleModule = article.topicArticles[0]?.topic?.module ?? null
  const tags = article.articleTags.map((t) => t.tag)
  const topics = article.topicArticles.map((ta) => ta.topic)

  // Navigation assignments
  const navAssignments = (article as any).subMenuArticles?.map((sma: any) => ({
    menuId: sma.subMenu.menu.id,
    menuTitle: sma.subMenu.menu.title,
    menuSlug: sma.subMenu.menu.slug,
    subMenuId: sma.subMenu.id,
    subMenuTitle: sma.subMenu.title,
    subMenuSlug: sma.subMenu.slug,
  })) ?? []

  // Collect related articles from same topics (exclude self)
  const relatedMap = new Map<number, (typeof article.topicArticles[0]['topic']['topicArticles'][0]['article'])>()
  for (const topic of topics) {
    for (const ta of topic.topicArticles) {
      if (ta.article.id !== article.id) {
        relatedMap.set(ta.article.id, ta.article)
      }
    }
  }
  const related = Array.from(relatedMap.values()).slice(0, 3)

  // Prev/Next article in same topic
  const topicId = article.topicArticles[0]?.topic?.id
  let prevArticle: { title: string; slug: string } | null = null
  let nextArticle: { title: string; slug: string } | null = null

  if (topicId) {
    const allTopicArticles = await prisma.topicArticle.findMany({
      where: { topicId, article: { status: 'PUBLISHED' } },
      orderBy: { orderIndex: 'asc' },
      include: { article: { select: { id: true, title: true, slug: true } } },
    })
    const idx = allTopicArticles.findIndex((ta) => ta.article.id === article.id)
    if (idx > 0) prevArticle = allTopicArticles[idx - 1].article
    if (idx >= 0 && idx < allTopicArticles.length - 1) nextArticle = allTopicArticles[idx + 1].article
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://appliedagentic.in'
  const articleUrl = `${siteUrl}/articles/${article.slug}`
  const truncate = (text: string, max = 15) => text.length > max ? `${text.slice(0, max)}…` : text
  const firstNav = navAssignments[0] ?? null
  const fullContent = sections.length > 0
    ? sections.map(s => s.content).join('\n')
    : article.content

  return (
    <>
      <ReadingProgressBar />

      <div className="min-h-screen article-page">

        {/* Draft banner */}
        {isDraft && (
          <div
            className="w-full py-2.5 px-4 text-center text-sm font-semibold"
            style={{ background: '#7C3AED22', borderBottom: '1px solid #7C3AED55', color: '#A78BFA' }}
          >
            Draft Preview — this article is not published
          </div>
        )}

        {/* ─── Cover Image (full-bleed on mobile) ──────────────────── */}
        {article.coverImage && (
          <div className="article-cover-wrapper">
            <LazyImage
              src={article.coverImage.url}
              alt={article.title}
              priority
              aspectClass="aspect-video"
              className="object-cover"
            />
            <div className="article-cover-gradient" />
          </div>
        )}

        {/* ─── Article Hero ──────────────────────────────────────── */}
        <header className="article-hero">
          <div className="article-hero-inner">

            {/* Breadcrumb */}
            <nav className="article-breadcrumb">
              <Link href="/" className="hover:text-(--green) transition-colors">Home</Link>
              {firstNav ? (
                <>
                  <ChevronRight size={12} className="opacity-40" />
                  <Link
                    href={`/${firstNav.menuSlug}`}
                    title={firstNav.menuTitle.length > 15 ? firstNav.menuTitle : undefined}
                    className="hover:text-(--green) transition-colors"
                  >
                    {truncate(firstNav.menuTitle)}
                  </Link>
                  <ChevronRight size={12} className="opacity-40" />
                  <Link
                    href={`/${firstNav.menuSlug}/${firstNav.subMenuSlug}`}
                    title={firstNav.subMenuTitle.length > 15 ? firstNav.subMenuTitle : undefined}
                    className="hover:text-(--green) transition-colors"
                  >
                    {truncate(firstNav.subMenuTitle)}
                  </Link>
                </>
              ) : (
                <>
                  <ChevronRight size={12} className="opacity-40" />
                  <Link href="/articles" className="hover:text-(--green) transition-colors">Articles</Link>
                </>
              )}
              <ChevronRight size={12} className="opacity-40" />
              <span
                className="article-breadcrumb-current"
                title={article.title.length > 15 ? article.title : undefined}
              >
                {truncate(article.title)}
              </span>
            </nav>

            {/* Module badge */}
            {articleModule && (
              <div className="mb-3">
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                  style={{ background: (articleModule.color ?? '#7C3AED') + '18', color: articleModule.color ?? '#7C3AED' }}
                >
                  {articleModule.icon && <span>{articleModule.icon}</span>}
                  {articleModule.name}
                </span>
              </div>
            )}

            {/* Title */}
            <h1 className="article-title">
              {article.title}
            </h1>

            {/* Summary */}
            {article.summary && (
              <p className="article-summary">
                {article.summary}
              </p>
            )}

            {/* Meta row */}
            <div className="article-meta-row">
              {article.publishedAt && (
                <span className="article-meta-item">
                  <Calendar size={14} />
                  {formatDate(article.publishedAt.toString())}
                </span>
              )}
              {article.readingTimeMinutes && (
                <span className="article-meta-item">
                  <Clock size={14} />
                  {article.readingTimeMinutes} min read
                </span>
              )}
              <span className="article-meta-item">
                <Eye size={14} />
                {article.viewCount.toLocaleString()} views
              </span>
            </div>

            {/* Tag pills */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {tags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/articles?tag=${encodeURIComponent(tag.name)}`}
                    className="article-tag-pill"
                  >
                    {tag.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Navigation assignments: Main Menu > Sub Menu pills */}
            {navAssignments.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {navAssignments.map((nav: { menuId: number; menuTitle: string; menuSlug: string; subMenuId: number; subMenuTitle: string; subMenuSlug: string }) => (
                  <Link
                    key={`${nav.menuId}-${nav.subMenuId}`}
                    href={`/${nav.menuSlug}/${nav.subMenuSlug}`}
                    className="article-nav-pill"
                  >
                    <span style={{ color: 'var(--text-secondary)' }}>{nav.menuTitle}</span>
                    <ChevronRight size={10} className="opacity-40" />
                    <span>{nav.subMenuTitle}</span>
                  </Link>
                ))}
              </div>
            )}

            {/* Share buttons */}
            <ShareButtons url={articleUrl} title={article.title} />
          </div>
        </header>

        {/* ─── Body: TOC sidebar (left) + Article content (right) ── */}
        <div className="article-body-wrapper">

          {/* Mobile floating panel (icon -> slide-in) */}
          {(sections.length > 0 || article.content) && (
            <div className="lg:hidden">
              <MobileArticlePanel
                sections={sections}
                content={fullContent}
              />
            </div>
          )}

          <div className="article-body-grid">

            {/* Sidebar — Reader Tools + TOC (desktop only) */}
            {(sections.length > 0 || article.content) && (
              <aside className="article-sidebar">
                <div className="article-sidebar-card">
                  <p className="article-sidebar-label">Reader Tools</p>
                  <ArticleReaderTools
                    content={fullContent}
                    inline
                  />
                </div>

                <div className="flex flex-col flex-1 min-h-0">
                  <TableOfContents
                    sections={sections.length > 0
                      ? sections
                      : [{ id: 0, title: '', content: article.content, order: 0 }]}
                  />
                </div>
              </aside>
            )}

            {/* Main article column */}
            <article className="article-main-col">

              {/* Article body — multi-section or legacy single content */}
              {sections.length > 0 ? (
                <div className="article-sections-container">
                  {sections.map((section, idx) => (
                    <SectionCard
                      key={section.id}
                      section={section}
                      index={idx}
                      gradientIndex={idx % 8}
                      totalSections={sections.length}
                    />
                  ))}
                </div>
              ) : (
                article.content && (
                  <ArticleContent content={article.content} />
                )
              )}

              {/* Audio player */}
              {article.audioUrl && (
                <div className="mt-8">
                  <ArticleAudioPlayer audioUrl={article.audioUrl} title={article.title} />
                </div>
              )}

              {/* Prev / Next */}
              {(prevArticle || nextArticle) && (
                <nav className="article-prev-next">
                  {prevArticle ? (
                    <Link
                      href={`/articles/${prevArticle.slug}`}
                      className="article-prev-next-card group"
                    >
                      <ArrowLeft size={16} className="mt-0.5 shrink-0 group-hover:text-(--green) transition-colors" style={{ color: 'var(--text-muted)' }} />
                      <div className="min-w-0">
                        <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Previous</p>
                        <p className="text-sm font-semibold line-clamp-2 group-hover:text-(--green) transition-colors" style={{ color: 'var(--text-primary)' }}>
                          {prevArticle.title}
                        </p>
                      </div>
                    </Link>
                  ) : <div />}
                  {nextArticle ? (
                    <Link
                      href={`/articles/${nextArticle.slug}`}
                      className="article-prev-next-card group text-right justify-end"
                    >
                      <div className="min-w-0">
                        <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Next</p>
                        <p className="text-sm font-semibold line-clamp-2 group-hover:text-(--green) transition-colors" style={{ color: 'var(--text-primary)' }}>
                          {nextArticle.title}
                        </p>
                      </div>
                      <ArrowRight size={16} className="mt-0.5 shrink-0 group-hover:text-(--green) transition-colors" style={{ color: 'var(--text-muted)' }} />
                    </Link>
                  ) : <div />}
                </nav>
              )}

              {/* Related Articles */}
              {related.length > 0 && (
                <RelatedArticles
                  articles={related.map((a) => ({
                    id: String(a.id),
                    title: a.title,
                    slug: a.slug,
                    summary: a.summary,
                    readingTime: a.readingTimeMinutes,
                    viewCount: a.viewCount,
                    publishedAt: a.publishedAt,
                    module: a.topicArticles[0]?.topic?.module
                      ? { name: a.topicArticles[0].topic.module.name, color: a.topicArticles[0].topic.module.color ?? '#1E293B' }
                      : null,
                  }))}
                />
              )}
            </article>

          </div>
        </div>
      </div>
    </>
  )
}
