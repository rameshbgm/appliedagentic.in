// app/(public)/page.tsx
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import HeroSection from '@/components/public/HeroSection'
import ArticleCard from '@/components/public/ArticleCard'
import NewsletterSection from '@/components/public/NewsletterSection'
import { StaggerContainer, FadeIn, ParallaxSection } from '@/components/public/ScrollAnimations'
import Link from 'next/link'
import { BookOpen, Sparkles } from 'lucide-react'
import type { Metadata } from 'next'
import { browseTopicsContent, featuredArticlesContent, ctaBannerContent } from '@/content/home'
import ModuleTileGrid from '@/components/public/ModuleTileGrid'

export const metadata: Metadata = {
  title: 'Applied Agentic AI — Master AI Agents & LLMs',
  description: 'Your comprehensive, structured guide to understanding and building AI-powered agentic systems.',
}

export const revalidate = 60


async function getData() {
  try {
    const [navMenus, featuredArticles] = await Promise.all([
      prisma.navMenu.findMany({
        where: { isVisible: true },
        orderBy: { order: 'asc' },
        include: {
          subMenus: {
            where: { isVisible: true },
            orderBy: { order: 'asc' },
            select: { id: true, title: true, slug: true },
          },
        },
      }),
      prisma.article.findMany({
        where: { status: 'PUBLISHED', isFeatured: true },
        orderBy: { createdAt: 'desc' },
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
    return { navMenus, featuredArticles }
  } catch (err) {
    logger.error('[GET /] DB error loading homepage data', err)
    return { navMenus: [], featuredArticles: [] }
  }
}

export default async function HomePage() {
  const { navMenus, featuredArticles } = await getData()

  return (
    <>
      <HeroSection />

      {/* ── Browse Topics ── */}
      <section id="topics" className="py-16 sm:py-24 px-4 md:px-8 max-w-7xl mx-auto">
        <ParallaxSection speed={0.25}>
          <FadeIn>
            <div className="mb-12 sm:mb-16">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen size={15} style={{ color: '#38BDF8' }} />
                <span className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: '#38BDF8' }}>
                  {browseTopicsContent.badge}
                </span>
              </div>

              {/* Redesigned heading */}
              <h2
                className="font-black leading-[1.08] tracking-tight mb-4"
                style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontFamily: "'Inter', sans-serif" }}
              >
                <span style={{ color: 'var(--text-primary)' }}>{browseTopicsContent.headline} </span>
                <span
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontStyle: 'italic',
                  }}
                >
                  {browseTopicsContent.headlineAccent}
                </span>
              </h2>

              <p className="text-base sm:text-lg max-w-2xl" style={{ color: 'var(--text-secondary)', fontFamily: "'Literata', 'Source Serif 4', Georgia, serif", fontStyle: 'italic', lineHeight: '1.7' }}>
                {browseTopicsContent.subheadline}
              </p>
            </div>
          </FadeIn>
        </ParallaxSection>

        <ModuleTileGrid menus={navMenus} />
      </section>

      {/* ── Featured Articles ── */}
      {featuredArticles.length > 0 && (
        <section className="py-16 sm:py-20 px-4 md:px-8 max-w-7xl mx-auto">
          <ParallaxSection speed={0.2}>
            <FadeIn>
              <div className="mb-10 sm:mb-12">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles size={14} style={{ color: '#A78BFA' }} />
                  <span className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: '#A78BFA' }}>
                    {featuredArticlesContent.badge}
                  </span>
                </div>
                <h2
                  className="font-black leading-[1.05] tracking-tight"
                  style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontFamily: "'Inter', sans-serif" }}
                >
                  <span style={{ color: 'var(--text-primary)' }}>{featuredArticlesContent.headline}{' '}</span>
                  <span className="relative inline-block">
                    <span
                      style={{
                        background: 'linear-gradient(90deg, #f59e0b 0%, #ef4444 50%, #ec4899 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}
                    >
                      {featuredArticlesContent.headlineAccent}
                    </span>
                    <span
                      className="absolute left-0 -bottom-1 w-full h-[3px] rounded-full"
                      style={{ background: 'linear-gradient(90deg, #f59e0b, #ef4444, #ec4899)' }}
                    />
                  </span>
                </h2>
              </div>
            </FadeIn>
          </ParallaxSection>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl">
            {featuredArticles.map((article, idx) => (
              <ArticleCard
                key={article.id}
                index={idx + 1}
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

      {/* ── CTA Banner ── */}
      <section className="py-20 px-4 md:px-8">
        <FadeIn>
          <div
            className="max-w-4xl mx-auto rounded-3xl p-10 md:p-16 text-center relative overflow-hidden"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-border)' }}
          >
            <h2 className="relative text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              {ctaBannerContent.headline}{' '}
              <span className="gradient-text">{ctaBannerContent.headlineAccent}</span>
            </h2>
            <p className="relative text-lg mb-8 max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
              {ctaBannerContent.subheadline}
            </p>
            <div className="relative flex flex-wrap gap-4 justify-center">
              <Link href={ctaBannerContent.primaryCta.href} className="btn-primary px-8 py-3.5 rounded-full">
                {ctaBannerContent.primaryCta.label}
              </Link>
              <Link
                href={ctaBannerContent.secondaryCta.href}
                className="px-8 py-3.5 rounded-full font-semibold transition-all border hover:bg-white/5"
                style={{ color: 'var(--text-primary)', borderColor: 'var(--bg-border)' }}
              >
                {ctaBannerContent.secondaryCta.label}
              </Link>
            </div>
          </div>
        </FadeIn>
      </section>

      <NewsletterSection />
    </>
  )
}
