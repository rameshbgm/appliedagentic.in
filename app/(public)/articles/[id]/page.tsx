// app/(public)/articles/[articleSlug]/page.tsx
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import Image from 'next/image'
import Link from 'next/link'
import ArticleContent from '@/components/public/ArticleContent'
import ArticleAudioPlayer from '@/components/public/ArticleAudioPlayer'
import RelatedArticles from '@/components/public/RelatedArticles'
import ReadingProgressBar from '@/components/public/ReadingProgressBar'
import TableOfContents from '@/components/public/TableOfContents'
import ShareButtons from '@/components/public/ShareButtons'
import { StaggerContainer, FadeIn } from '@/components/public/ScrollAnimations'
import { formatDate } from '@/lib/utils'
import { Clock, Eye, Calendar, ArrowLeft, ArrowRight, Tag } from 'lucide-react'
import type { Metadata } from 'next'

interface Props { params: Promise<{ id: string }> }

export const revalidate = 300

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
}

export default async function ArticleDetailPage({ params }: Props) {
  const { id } = await params
  const article = await prisma.article.findUnique({
    where: { slug: id, status: 'PUBLISHED' },
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

  if (!article) notFound()

  // Increment view count (best-effort, noncritical)
  prisma.article.update({ where: { id: article.id }, data: { viewCount: { increment: 1 } } }).catch(() => {})

  const articleModule = article.topicArticles[0]?.topic?.module ?? null
  const color = articleModule?.color ?? '#6C3DFF'
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
        {/* Cover image */}
        {article.coverImage && (
          <div className="relative w-full h-56 sm:h-72 md:h-96 overflow-hidden">
            <Image
              src={article.coverImage.url}
              alt={article.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 40%, var(--bg-page))' }} />
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
          <div className="flex flex-col lg:flex-row gap-8 xl:gap-12">
            {/* Main content */}
            <article className="flex-1 min-w-0">
              <FadeIn>
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm mb-6 flex-wrap" style={{ color: 'var(--text-muted)' }}>
                  <Link href="/" className="hover:opacity-80">Home</Link>
                  {articleModule && (
                    <>
                      <span>/</span>
                      <Link href={`/modules/${articleModule.slug}`} className="hover:opacity-80">
                        {articleModule.name}
                      </Link>
                    </>
                  )}
                  <span>/</span>
                  <span className="line-clamp-1" style={{ color: 'var(--text-primary)' }}>{article.title}</span>
                </nav>

                {/* Module badge */}
                {articleModule && (
                  <Link
                    href={`/modules/${articleModule.slug}`}
                    className="inline-flex items-center gap-2 text-sm font-medium px-3 py-1 rounded-full mb-4"
                    style={{ background: color + '25', color }}
                  >
                    {articleModule.icon} {articleModule.name}
                  </Link>
                )}

                {/* Title */}
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4"
                  style={{ color: 'var(--text-primary)' }}>
                  {article.title}
                </h1>

                {/* Summary */}
                {article.summary && (
                  <p className="text-base sm:text-lg leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>
                    {article.summary}
                  </p>
                )}

                {/* Meta row */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm pb-6 mb-6"
                  style={{ borderBottom: '1px solid var(--bg-border)', color: 'var(--text-muted)' }}>
                  {article.publishedAt && (
                    <span className="flex items-center gap-1.5">
                      <Calendar size={14} />
                      {formatDate(article.publishedAt.toString())}
                    </span>
                  )}
                  {article.readingTimeMinutes && (
                    <span className="flex items-center gap-1.5">
                      <Clock size={14} />
                      {article.readingTimeMinutes} min read
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Eye size={14} />
                    {article.viewCount.toLocaleString()} views
                  </span>
                </div>

                {/* Share buttons */}
                <div className="mb-6">
                  <ShareButtons url={articleUrl} title={article.title} />
                </div>

                {/* Tags */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-8">
                    {tags.map((tag) => (
                      <Link
                        key={tag.id}
                        href={`/articles?tag=${encodeURIComponent(tag.name)}`}
                        className="badge flex items-center gap-1 hover:opacity-80 transition-opacity"
                      >
                        <Tag size={10} />
                        {tag.name}
                      </Link>
                    ))}
                  </div>
                )}
              </FadeIn>

              {/* Article content */}
              {article.content && (
                <>
                  {/* Mobile TOC - shown inline before content */}
                  <div className="lg:hidden mb-6">
                    <TableOfContents content={article.content} />
                  </div>
                  <ArticleContent content={article.content} />
                </>
              )}

              {/* Share + Prev/Next */}
              <div className="mt-10 pt-8 space-y-6" style={{ borderTop: '1px solid var(--bg-border)' }}>
                <ShareButtons url={articleUrl} title={article.title} />

                {/* Prev/Next navigation */}
                {(prevArticle || nextArticle) && (
                  <nav className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {prevArticle ? (
                      <Link
                        href={`/articles/${prevArticle.slug}`}
                        className="group flex items-start gap-3 p-4 rounded-2xl transition-all hover:-translate-y-0.5"
                        style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-border)' }}
                      >
                        <ArrowLeft size={16} className="mt-0.5 shrink-0 group-hover:text-violet-400 transition-colors" style={{ color: 'var(--text-muted)' }} />
                        <div className="min-w-0">
                          <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Previous</p>
                          <p className="text-sm font-semibold line-clamp-2 group-hover:text-violet-400 transition-colors" style={{ color: 'var(--text-primary)' }}>
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
                          <p className="text-sm font-semibold line-clamp-2 group-hover:text-violet-400 transition-colors" style={{ color: 'var(--text-primary)' }}>
                            {nextArticle.title}
                          </p>
                        </div>
                        <ArrowRight size={16} className="mt-0.5 shrink-0 group-hover:text-violet-400 transition-colors" style={{ color: 'var(--text-muted)' }} />
                      </Link>
                    ) : <div />}
                  </nav>
                )}
              </div>

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
                      ? { name: a.topicArticles[0].topic.module.name, color: a.topicArticles[0].topic.module.color ?? '#6C3DFF' }
                      : null,
                  }))}
                />
              )}
            </article>

            {/* Sidebar TOC - desktop only */}
            {article.content && (
              <aside className="hidden lg:block w-64 xl:w-72 shrink-0">
                <div className="sticky top-24">
                  <TableOfContents content={article.content} />
                </div>
              </aside>
            )}
          </div>
        </div>
      </div>

      {/* Audio Player */}
      {article.audioUrl && (
        <ArticleAudioPlayer audioUrl={article.audioUrl} title={article.title} />
      )}
    </>
  )
}
