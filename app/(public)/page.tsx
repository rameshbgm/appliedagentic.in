// app/(public)/page.tsx
import { prisma } from '@/lib/prisma'
import HeroSection from '@/components/public/HeroSection'
import ModuleCard from '@/components/public/ModuleCard'
import ArticleCard from '@/components/public/ArticleCard'
import NewsletterSection from '@/components/public/NewsletterSection'
import { StaggerContainer, FadeIn, SlideInLeft } from '@/components/public/ScrollAnimations'
import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Applied Agentic AI — Master AI Agents & LLMs',
  description: 'Your comprehensive, structured guide to understanding and building AI-powered agentic systems.',
}

export const revalidate = 60

async function getData() {
  try {
    const [modules, featuredArticles] = await Promise.all([
      prisma.module.findMany({
        where: { isPublished: true },
        orderBy: { order: 'asc' },
        include: {
          _count: { select: { topics: true } },
          topics: {
            where: { isPublished: true },
            select: {
              _count: { select: { topicArticles: true } },
            },
          },
        },
      }),
      prisma.article.findMany({
        where: { status: 'PUBLISHED' },
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
      }),
    ])
    return { modules, featuredArticles }
  } catch {
    return { modules: [], featuredArticles: [] }
  }
}

export default async function HomePage() {
  const { modules, featuredArticles } = await getData()

  return (
    <>
      <HeroSection />

      {/* Modules Section */}
      <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
        <FadeIn>
          <div className="flex items-start justify-between mb-10 flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={16} className="text-purple-400" />
                <span className="text-sm font-medium uppercase tracking-widest" style={{ color: '#6C3DFF' }}>
                  Learning Modules
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Explore All{' '}
                <span className="gradient-text">8 Modules</span>
              </h2>
              <p className="mt-2 text-base" style={{ color: 'var(--text-secondary)' }}>
                From foundations to advanced multi-agent systems — learn it all
              </p>
            </div>
            <Link
              href="/modules"
              className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-purple-400"
              style={{ color: 'var(--text-secondary)' }}
            >
              View all <ArrowRight size={15} />
            </Link>
          </div>
        </FadeIn>

        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {modules.map((mod, i) => {
            const articleCount = mod.topics.reduce((sum, t) => sum + (t._count.topicArticles ?? 0), 0)
            return (
              <ModuleCard
                key={mod.id}
                id={mod.id}
                name={mod.name}
                slug={mod.slug}
                icon={mod.icon}
                color={mod.color}
                description={mod.description}
                topicCount={mod._count.topics}
                articleCount={articleCount}
                index={i}
              />
            )
          })}
        </StaggerContainer>
      </section>

      {/* Featured Articles */}
      {featuredArticles.length > 0 && (
        <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
          <FadeIn>
            <div className="flex items-start justify-between mb-10 flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={16} className="text-cyan-400" />
                  <span className="text-sm font-medium uppercase tracking-widest" style={{ color: '#00D4FF' }}>
                    Featured Articles
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  Start{' '}
                  <span className="gradient-text">Learning</span>
                </h2>
              </div>
              <Link
                href="/articles"
                className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-cyan-400"
                style={{ color: 'var(--text-secondary)' }}
              >
                All articles <ArrowRight size={15} />
              </Link>
            </div>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredArticles.map((article) => (
              <ArticleCard
                key={article.id}
                title={article.title}
                slug={article.slug}
                summary={article.summary}
                readingTime={article.readingTimeMinutes}
                viewCount={article.viewCount}
                createdAt={article.createdAt}
                tags={article.articleTags.map((at) => ({ name: at.tag.name }))}
                moduleName={article.topicArticles[0]?.topic?.module?.name}
                moduleColor={article.topicArticles[0]?.topic?.module?.color}
              />
            ))}
          </StaggerContainer>
        </section>
      )}

      {/* CTA Banner */}
      <section className="py-20 px-4 md:px-8">
        <FadeIn>
          <div
            className="max-w-4xl mx-auto rounded-3xl p-10 md:p-16 text-center relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(108,61,255,0.15), rgba(0,212,255,0.1))',
              border: '1px solid rgba(108,61,255,0.3)',
            }}
          >
            {/* Glow orbs */}
            <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full blur-3xl opacity-20"
              style={{ background: '#6C3DFF' }} />
            <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-20"
              style={{ background: '#00D4FF' }} />

            <h2 className="relative text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Ready to master{' '}
              <span className="gradient-text">Agentic AI?</span>
            </h2>
            <p className="relative text-lg mb-8 max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
              Structured learning paths, practical examples, and comprehensive coverage of modern AI agent systems.
            </p>
            <div className="relative flex flex-wrap gap-4 justify-center">
              <Link
                href="/modules"
                className="px-8 py-3.5 rounded-full font-semibold text-white transition-all hover:shadow-lg hover:-translate-y-0.5"
                style={{ background: 'linear-gradient(135deg, #6C3DFF, #00D4FF)' }}
              >
                Start Learning
              </Link>
              <Link
                href="/articles"
                className="px-8 py-3.5 rounded-full font-semibold transition-all border hover:bg-white/5"
                style={{ color: 'var(--text-primary)', borderColor: 'var(--bg-border)' }}
              >
                Browse Articles
              </Link>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* Newsletter Section */}
      <NewsletterSection />
    </>
  )
}
