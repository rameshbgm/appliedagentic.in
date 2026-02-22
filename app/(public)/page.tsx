// app/(public)/page.tsx
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import HeroSection from '@/components/public/HeroSection'
import ArticleCard from '@/components/public/ArticleCard'
import NewsletterSection from '@/components/public/NewsletterSection'
import { StaggerContainer, FadeIn, ParallaxSection } from '@/components/public/ScrollAnimations'
import Link from 'next/link'
import { ArrowRight, Sparkles, ChevronRight } from 'lucide-react'
import type { Metadata } from 'next'
import { browseTopicsContent, featuredArticlesContent, ctaBannerContent } from '@/content/home'

export const metadata: Metadata = {
  title: 'Applied Agentic AI — Master AI Agents & LLMs',
  description: 'Your comprehensive, structured guide to understanding and building AI-powered agentic systems.',
}

export const revalidate = 60

// One accent color per menu slot (cycles if more than 6)
const MENU_ACCENTS = [
  '#AAFF00', // lime green
  '#38BDF8', // sky blue
  '#A78BFA', // violet
  '#FB923C', // orange
  '#34D399', // emerald
  '#F472B6', // pink
]

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
      <section className="py-16 sm:py-20 px-4 md:px-8 max-w-7xl mx-auto">
        <ParallaxSection speed={0.25}>
          <FadeIn>
            <div className="flex items-start justify-between mb-10 sm:mb-12 flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={16} style={{ color: '#38BDF8' }} />
                  <span className="text-sm font-medium uppercase tracking-widest" style={{ color: '#38BDF8' }}>
                    {browseTopicsContent.badge}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {browseTopicsContent.headline}{' '}
                  <span className="gradient-text">{browseTopicsContent.headlineAccent}</span>
                </h2>
                <p className="mt-2 text-sm sm:text-base" style={{ color: 'var(--text-secondary)' }}>
                  {browseTopicsContent.subheadline}
                </p>
              </div>
            </div>
          </FadeIn>
        </ParallaxSection>

        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {navMenus.map((menu, i) => {
            const accent = MENU_ACCENTS[i % MENU_ACCENTS.length]
            return (
              <div
                key={menu.id}
                className="group relative rounded-2xl p-6 flex flex-col gap-4 transition-all hover:-translate-y-1 hover:shadow-xl"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--bg-border)',
                  borderTop: `3px solid ${accent}`,
                }}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <Link href={`/${menu.slug}`} className="group/title">
                    <h3
                      className="text-lg font-bold leading-snug transition-colors group-hover/title:text-[var(--green)]"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {menu.title}
                    </h3>
                  </Link>
                  <Link
                    href={`/${menu.slug}`}
                    className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                    style={{ background: accent + '22', color: accent }}
                  >
                    <ArrowRight size={14} />
                  </Link>
                </div>

                {/* Description */}
                {menu.description && (
                  <p className="text-sm leading-relaxed line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                    {menu.description}
                  </p>
                )}

                {/* Sub-menu chips */}
                {menu.subMenus.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-auto pt-2" style={{ borderTop: '1px solid var(--bg-border)' }}>
                    {menu.subMenus.map((sub) => (
                      <Link
                        key={sub.id}
                        href={`/${menu.slug}/${sub.slug}`}
                        className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all hover:scale-105"
                        style={{
                          background: accent + '15',
                          color: accent,
                          border: `1px solid ${accent}30`,
                        }}
                      >
                        <ChevronRight size={10} />
                        {sub.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </StaggerContainer>
      </section>

      {/* ── Featured Articles ── */}
      {featuredArticles.length > 0 && (
        <section className="py-16 sm:py-20 px-4 md:px-8 max-w-7xl mx-auto">
          <ParallaxSection speed={0.2}>
            <FadeIn>
              <div className="flex items-start justify-between mb-8 sm:mb-10 flex-wrap gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={16} style={{ color: '#A78BFA' }} />
                    <span className="text-sm font-medium uppercase tracking-widest" style={{ color: '#A78BFA' }}>
                      {featuredArticlesContent.badge}
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {featuredArticlesContent.headline}{' '}
                    <span className="gradient-text">{featuredArticlesContent.headlineAccent}</span>
                  </h2>
                </div>
                <Link
                  href={featuredArticlesContent.viewAllHref}
                  className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-[#38BDF8]"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {featuredArticlesContent.viewAllLabel} <ArrowRight size={15} />
                </Link>
              </div>
            </FadeIn>
          </ParallaxSection>

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
