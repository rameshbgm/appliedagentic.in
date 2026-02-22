// app/(public)/articles/[articleSlug]/page.tsx
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import Image from 'next/image'
import Link from 'next/link'
import ArticleContent from '@/components/public/ArticleContent'
import ArticleAudioPlayer from '@/components/public/ArticleAudioPlayer'
import RelatedArticles from '@/components/public/RelatedArticles'
import ReadingProgressBar from '@/components/public/ReadingProgressBar'
import TableOfContents from '@/components/public/TableOfContents'
import ArticleReaderTools from '@/components/public/ArticleReaderTools'
import ShareButtons from '@/components/public/ShareButtons'
import { formatDate } from '@/lib/utils'
import { Clock, Eye, Calendar, ArrowLeft, ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'

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
        title: true, summary: true, seoTitle: true, seoDescription: true,
        coverImage: { select: { url: true, width: true, height: true } },
      },
    })
    if (!article) return {}
    return {
      title: article.seoTitle ?? article.title,
      description: article.seoDescription ?? article.summary ?? undefined,
      openGraph: article.coverImage
        ? { images: [{ url: article.coverImage.url, width: article.coverImage.width ?? undefined, height: article.coverImage.height ?? undefined }] }
        : undefined,
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
  const isDraft = article.status !== 'PUBLISHED'

  // Increment view count (best-effort, noncritical)
  prisma.article.update({ where: { id: article.id }, data: { viewCount: { increment: 1 } } }).catch(() => {})

  const articleModule = article.topicArticles[0]?.topic?.module ?? null
  const tags = article.articleTags.map((t) => t.tag)
  const topics = article.topicArticles.map((ta) => ta.topic)

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

  return (
    <>
      <ReadingProgressBar />

      <div className="min-h-screen">

        {/* Draft banner */}
        {isDraft && (
          <div className="w-full py-2.5 px-4 text-center text-sm font-semibold" style={{ background: '#7C3AED22', borderBottom: '1px solid #7C3AED55', color: '#A78BFA' }}>
            ⚠️ Draft Preview — this article is not published
          </div>
        )}

        {/* ─── Article Hero ──────────────────────────────────────── */}
        <div
          className="w-full px-[3%] pt-6 sm:pt-10 pb-8 sm:pb-12"
          style={{ background: 'var(--bg-page)', borderBottom: '1px solid var(--bg-border)' }}
        >
          <div>

            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm mb-8 flex-wrap" style={{ color: 'var(--text-muted)' }}>
              <Link href="/" className="hover:text-(--green) transition-colors">Home</Link>
              {articleModule && (
                <>
                  <span className="opacity-40">&rsaquo;</span>
                  <Link href={`/modules/${articleModule.slug}`} className="hover:text-(--green) transition-colors">
                    {articleModule.name}
                  </Link>
                </>
              )}
              {topics[0] && (
                <>
                  <span className="opacity-40">&rsaquo;</span>
                  <Link href={`/topics/${topics[0].slug}`} className="hover:text-(--green) transition-colors">
                    {topics[0].name}
                  </Link>
                </>
              )}
              <span className="opacity-40">&rsaquo;</span>
              <span className="line-clamp-1" style={{ color: 'var(--text-secondary)' }}>{article.title}</span>
            </nav>

            {/* Title */}
            <h1
              className="text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.12] tracking-tight mb-4"
              style={{ color: 'var(--text-primary)' }}
            >
              {article.title}
            </h1>

            {/* Summary */}
            {article.summary && (
              <p className="text-sm leading-relaxed mb-5 max-w-2xl" style={{ color: 'var(--text-muted)' }}>
                {article.summary}
              </p>
            )}

            {/* Tag pills */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {tags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/articles?tag=${encodeURIComponent(tag.name)}`}
                    className="px-4 py-1.5 rounded-full text-sm font-medium border transition-colors hover:border-(--green) hover:text-(--green)"
                    style={{ borderColor: 'var(--bg-border)', color: 'var(--text-secondary)' }}
                  >
                    {tag.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-4 text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
              {article.publishedAt && (
                <span className="flex items-center gap-1.5">
                  <Calendar size={13} />
                  {formatDate(article.publishedAt.toString())}
                </span>
              )}
              {article.readingTimeMinutes && (
                <span className="flex items-center gap-1.5">
                  <Clock size={13} />
                  {article.readingTimeMinutes} min read
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Eye size={13} />
                {article.viewCount.toLocaleString()} views
              </span>
            </div>

            {/* Share buttons */}
            <ShareButtons url={articleUrl} title={article.title} />
          </div>
        </div>

        {/* ─── Body: TOC sidebar (left) + Article content (right) ── */}
        <div className="px-[3%] py-6 sm:py-10">

          {/* Mobile TOC — sticky below navbar, capped height on portrait so article content remains visible */}
          {article.content && (
            <div className="lg:hidden sticky top-16 z-40 pb-2 mb-3 max-h-[32vh] overflow-y-auto" style={{ background: 'var(--bg-page)' }}>
              <TableOfContents content={article.content} />
            </div>
          )}

          {/* Mobile reader tools — fixed bottom bar (rendered here to mount the component) */}
          {article.content && (
            <div className="lg:hidden">
              <ArticleReaderTools content={article.content} mobile />
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-8 xl:gap-12 items-start">

            {/* Sidebar TOC — desktop left, fully sticky */}
            {article.content && (
              <aside className="hidden lg:block w-64 xl:w-72 shrink-0 sticky top-20 self-start max-h-[calc(100vh-6rem)] overflow-y-auto">
                <TableOfContents content={article.content} />
              </aside>
            )}

            {/* Main article column */}
            <article className="flex-1 min-w-0 pb-24 lg:pb-0">

              {/* Cover image */}
              {article.coverImage && (
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-6 sm:mb-10" style={{ maxHeight: '60vw' }}>
                  <Image
                    src={article.coverImage.url}
                    alt={article.title}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              )}

              {/* Article body */}
              {article.content && <ArticleContent content={article.content} />}

              {/* Audio player */}
              {article.audioUrl && (
                <div className="mt-8">
                  <ArticleAudioPlayer audioUrl={article.audioUrl} title={article.title} />
                </div>
              )}

              {/* Prev / Next */}
              {(prevArticle || nextArticle) && (
                <nav
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-12 pt-8"
                  style={{ borderTop: '1px solid var(--bg-border)' }}
                >
                  {prevArticle ? (
                    <Link
                      href={`/articles/${prevArticle.slug}`}
                      className="group flex items-start gap-3 p-4 rounded-2xl transition-all hover:-translate-y-0.5"
                      style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-border)' }}
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
                      className="group flex items-start gap-3 p-4 rounded-2xl text-right justify-end transition-all hover:-translate-y-0.5"
                      style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-border)' }}
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
                      ? { name: a.topicArticles[0].topic.module.name, color: a.topicArticles[0].topic.module.color ?? '#AAFF00' }
                      : null,
                  }))}
                />
              )}
            </article>

            {/* Desktop reader tools — right side vertical strip */}
            {article.content && (
              <div className="hidden lg:flex flex-col items-center sticky top-20 self-start shrink-0 ml-2">
                <ArticleReaderTools content={article.content} />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
