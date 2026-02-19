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
import { StaggerContainer, FadeIn } from '@/components/public/ScrollAnimations'
import { formatDate } from '@/lib/utils'
import { Clock, Eye, Calendar, ArrowLeft, Tag } from 'lucide-react'
import type { Metadata } from 'next'

interface Props { params: { id: string } }

export const revalidate = 300

export async function generateStaticParams() {
  const articles = await prisma.article.findMany({
    where: { status: 'PUBLISHED' },
    select: { slug: true },
  })
  return articles.map((a) => ({ id: a.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await prisma.article.findUnique({
    where: { slug: params.id },
    select: { title: true, summary: true, seoTitle: true, seoDescription: true, coverImage: true },
  })
  if (!article) return {}
  return {
    title: article.seoTitle ?? article.title,
    description: article.seoDescription ?? article.summary ?? undefined,
    openGraph: article.coverImage ? { images: [article.coverImage] } : undefined,
  }
}

export default async function ArticleDetailPage({ params }: Props) {
  const article = await prisma.article.findUnique({
    where: { slug: params.id, status: 'PUBLISHED' },
    include: {
      module: { select: { id: true, name: true, slug: true, color: true, icon: true } },
      tags: { include: { tag: { select: { id: true, name: true } } } },
      topicArticles: {
        include: {
          topic: {
            select: {
              id: true, name: true, slug: true,
              topicArticles: {
                where: { article: { status: 'PUBLISHED' } },
                take: 4,
                include: {
                  article: {
                    include: {
                      module: { select: { name: true, color: true } },
                      tags: { include: { tag: true } },
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

  const color = article.module?.color ?? '#6C3DFF'
  const tags = article.tags.map((t) => t.tag)
  const topics = article.topicArticles.map((ta) => ta.topic)

  // Collect related articles from same topics (exclude self)
  const relatedMap = new Map<string, typeof article>()
  for (const topic of topics) {
    for (const ta of topic.topicArticles) {
      if (ta.article.id !== article.id) {
        relatedMap.set(ta.article.id, ta.article as any)
      }
    }
  }
  const related = Array.from(relatedMap.values()).slice(0, 3)

  return (
    <>
      <ReadingProgressBar />

      <div className="min-h-screen">
        {/* Cover image */}
        {article.coverImage && (
          <div className="relative w-full h-64 md:h-96 overflow-hidden">
            <Image
              src={article.coverImage}
              alt={article.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 40%, var(--bg-page))' }} />
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Main content */}
            <article className="flex-1 min-w-0">
              <FadeIn>
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm mb-6 flex-wrap" style={{ color: 'var(--text-muted)' }}>
                  <Link href="/" className="hover:opacity-80">Home</Link>
                  {article.module && (
                    <>
                      <span>/</span>
                      <Link href={`/modules/${article.module.slug}`} className="hover:opacity-80">
                        {article.module.name}
                      </Link>
                    </>
                  )}
                  <span>/</span>
                  <span className="line-clamp-1" style={{ color: 'var(--text-primary)' }}>{article.title}</span>
                </nav>

                {/* Module badge */}
                {article.module && (
                  <Link
                    href={`/modules/${article.module.slug}`}
                    className="inline-flex items-center gap-2 text-sm font-medium px-3 py-1 rounded-full mb-4"
                    style={{ background: color + '25', color }}
                  >
                    {article.module.icon} {article.module.name}
                  </Link>
                )}

                {/* Title */}
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4"
                  style={{ color: 'var(--text-primary)' }}>
                  {article.title}
                </h1>

                {/* Summary */}
                {article.summary && (
                  <p className="text-lg leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>
                    {article.summary}
                  </p>
                )}

                {/* Meta row */}
                <div className="flex flex-wrap items-center gap-4 text-sm pb-6 mb-8"
                  style={{ borderBottom: '1px solid var(--bg-border)', color: 'var(--text-muted)' }}>
                  {article.publishedAt && (
                    <span className="flex items-center gap-1.5">
                      <Calendar size={14} />
                      {formatDate(article.publishedAt.toString())}
                    </span>
                  )}
                  {article.readingTime && (
                    <span className="flex items-center gap-1.5">
                      <Clock size={14} />
                      {article.readingTime} min read
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Eye size={14} />
                    {article.viewCount.toLocaleString()} views
                  </span>
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
              {article.content && <ArticleContent content={article.content} />}

              {/* Related Articles */}
              {related.length > 0 && (
                <RelatedArticles
                  articles={related.map((a) => ({
                    ...a,
                    tags: (a as any).tags?.map((t: any) => ({ id: t.tag.id, name: t.tag.name })) ?? [],
                  }))}
                />
              )}
            </article>

            {/* Sidebar TOC */}
            {article.content && (
              <aside className="hidden lg:block w-72 flex-shrink-0">
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
