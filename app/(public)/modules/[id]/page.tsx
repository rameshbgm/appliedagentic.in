// app/(public)/modules/[moduleSlug]/page.tsx
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import TopicCard from '@/components/public/TopicCard'
import ArticleCard from '@/components/public/ArticleCard'
import { StaggerContainer, FadeIn, SlideInLeft } from '@/components/public/ScrollAnimations'
import Link from 'next/link'
import { ArrowLeft, BookOpen, FileText } from 'lucide-react'
import type { Metadata } from 'next'

interface Props { params: { id: string } }

export const revalidate = 60

export async function generateStaticParams() {
  try {
    const modules = await prisma.module.findMany({ where: { isPublished: true }, select: { slug: true } })
    return modules.map((m) => ({ id: m.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const mod = await prisma.module.findUnique({ where: { slug: params.id } })
  if (!mod) return {}
  return {
    title: mod.name,
    description: mod.description ?? undefined,
  }
}

export default async function ModuleDetailPage({ params }: Props) {
  const mod = await prisma.module.findUnique({
    where: { slug: params.id, isPublished: true },
    include: {
      topics: {
        where: { isPublished: true },
        orderBy: { order: 'asc' },
        include: {
          _count: { select: { topicArticles: true } },
        },
      },
    },
  })

  if (!mod) notFound()

  const featuredArticles = await prisma.article.findMany({
    where: {
      status: 'PUBLISHED',
      topicArticles: { some: { topic: { moduleId: mod.id } } },
    },
    orderBy: { viewCount: 'desc' },
    take: 6,
    include: {
      articleTags: { include: { tag: { select: { name: true } } } },
      topicArticles: {
        take: 1,
        include: {
          topic: { select: { module: { select: { name: true, color: true } } } },
        },
      },
    },
  })

  const totalArticles = mod.topics.reduce((sum, t) => sum + t._count.topicArticles, 0)

  return (
    <div className="min-h-screen">
      {/* Module Hero */}
      <div
        className="relative overflow-hidden py-20 px-4 md:px-8"
        style={{ background: `linear-gradient(135deg, ${mod.color}20, ${mod.color}05)` }}
      >
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, ${mod.color} 0%, transparent 70%)`,
        }} />
        <div className="relative max-w-7xl mx-auto">
          <Link href="/modules" className="inline-flex items-center gap-2 text-sm mb-8 hover:opacity-80 transition-opacity"
            style={{ color: 'var(--text-muted)' }}>
            <ArrowLeft size={14} /> Back to modules
          </Link>
          <FadeIn>
            <div className="flex items-start gap-5">
              <div
                className="text-4xl w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: mod.color + '25', border: `2px solid ${mod.color}40` }}
              >
                {mod.icon}
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                  {mod.name}
                </h1>
                {mod.description && (
                  <p className="text-lg max-w-3xl" style={{ color: 'var(--text-secondary)' }}>
                    {mod.description}
                  </p>
                )}
                <div className="flex items-center gap-5 mt-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                  <span className="flex items-center gap-1.5"><BookOpen size={14} /> {mod.topics.length} topics</span>
                  <span className="flex items-center gap-1.5"><FileText size={14} /> {totalArticles} articles</span>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16">
        {/* Topics Grid */}
        {mod.topics.length > 0 && (
          <section className="mb-16">
            <SlideInLeft>
              <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Topics</h2>
            </SlideInLeft>
            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {mod.topics.map((topic) => (
                <TopicCard
                  key={topic.id}
                  topic={{
                    id: topic.id,
                    name: topic.name,
                    slug: topic.slug,
                    description: topic.description,
                    module: { name: mod.name, color: mod.color ?? '#6C3DFF' },
                    articleCount: topic._count.topicArticles,
                  }}
                />
              ))}
            </StaggerContainer>
          </section>
        )}

        {/* Featured Articles */}
        {featuredArticles.length > 0 && (
          <section>
            <SlideInLeft>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Popular Articles</h2>
                <Link href={`/articles?module=${mod.slug}`} className="text-sm font-medium hover:underline"
                  style={{ color: mod.color ?? undefined }}>
                  View all →
                </Link>
              </div>
            </SlideInLeft>
            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredArticles.map((a) => (
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
          </section>
        )}
      </div>
    </div>
  )
}
