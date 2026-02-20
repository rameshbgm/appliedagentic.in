// app/(public)/topics/[topicSlug]/page.tsx
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import ArticleCard from '@/components/public/ArticleCard'
import { StaggerContainer, FadeIn } from '@/components/public/ScrollAnimations'
import Link from 'next/link'
import { ArrowLeft, FileText } from 'lucide-react'
import type { Metadata } from 'next'

interface Props { params: Promise<{ id: string }> }

export const revalidate = 60

export async function generateStaticParams() {
  try {
    const topics = await prisma.topic.findMany({ where: { isPublished: true }, select: { slug: true } })
    return topics.map((t) => ({ id: t.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const topic = await prisma.topic.findUnique({ where: { slug: id } })
  if (!topic) return {}
  return { title: topic.name, description: topic.description ?? undefined }
}

export default async function TopicDetailPage({ params }: Props) {
  const { id } = await params
  const topic = await prisma.topic.findUnique({
    where: { slug: id, isPublished: true },
    include: {
      module: { select: { id: true, name: true, slug: true, color: true, icon: true } },
      topicArticles: {
        where: { article: { status: 'PUBLISHED' } },
        orderBy: { orderIndex: 'asc' },
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
  })

  if (!topic) notFound()

  const articles = topic.topicArticles.map((ta) => ta.article)
  const color = topic.module?.color ?? '#6C3DFF'

  return (
    <div className="min-h-screen">
      {/* Topic Hero */}
      <div
        className="py-16 px-4 md:px-8 relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${color}18, ${color}05)` }}
      >
        <div className="max-w-7xl mx-auto relative">
          <div className="flex items-center gap-2 mb-6 text-sm" style={{ color: 'var(--text-muted)' }}>
            <Link href="/modules" className="hover:opacity-80">Modules</Link>
            <span>/</span>
            {topic.module && (
              <>
                <Link href={`/modules/${topic.module.slug}`} className="hover:opacity-80">
                  {topic.module.name}
                </Link>
                <span>/</span>
              </>
            )}
            <span style={{ color: 'var(--text-primary)' }}>{topic.name}</span>
          </div>

          <FadeIn>
            <div className="max-w-3xl">
              {topic.module && (
                <Link
                  href={`/modules/${topic.module.slug}`}
                  className="inline-flex items-center gap-2 text-sm font-medium px-3 py-1 rounded-full mb-4"
                  style={{ background: color + '25', color }}
                >
                  {topic.module.icon} {topic.module.name}
                </Link>
              )}
              <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                {topic.name}
              </h1>
              {topic.description && (
                <p className="text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {topic.description}
                </p>
              )}
              <p className="mt-3 text-sm flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                <FileText size={14} />
                {articles.length} {articles.length === 1 ? 'article' : 'articles'}
              </p>
            </div>
          </FadeIn>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-14">
        {articles.length > 0 ? (
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((a) => (
              <ArticleCard
                key={a.id}
                title={a.title}
                slug={a.slug}
                summary={a.summary}
                readingTime={a.readingTimeMinutes}
                viewCount={a.viewCount}
                createdAt={a.createdAt}
                tags={a.articleTags.map((at) => ({ name: at.tag.name }))}
                moduleName={a.topicArticles[0]?.topic?.module?.name}
                moduleColor={a.topicArticles[0]?.topic?.module?.color}
              />
            ))}
          </StaggerContainer>
        ) : (
          <div className="text-center py-24" style={{ color: 'var(--text-muted)' }}>
            <p className="text-5xl mb-4">📝</p>
            <p className="text-lg">Articles coming soon</p>
          </div>
        )}
      </div>
    </div>
  )
}
