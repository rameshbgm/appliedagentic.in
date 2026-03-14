// app/(public)/page.tsx
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import HeroSection from '@/components/public/HeroSection'
import ArticleCard from '@/components/public/ArticleCard'
import NewsletterSection from '@/components/public/NewsletterSection'
import { StaggerContainer, FadeIn, ParallaxSection } from '@/components/public/ScrollAnimations'
import Link from 'next/link'
import NavLink from '@/components/shared/NavLink'
import { ArrowRight, BookOpen, Sparkles, ChevronRight } from 'lucide-react'
import type { Metadata } from 'next'
import { browseTopicsContent, featuredArticlesContent, ctaBannerContent } from '@/content/home'

export const metadata: Metadata = {
  title: 'Applied Agentic AI — Master AI Agents & LLMs',
  description: 'Your comprehensive, structured guide to understanding and building AI-powered agentic systems.',
}

export const revalidate = 60

// Gradient border pairs per module slot
const TILE_GRADIENTS = [
  ['#3b82f6', '#06b6d4'],   // blue → cyan
  ['#8b5cf6', '#ec4899'],   // violet → pink
  ['#f59e0b', '#ef4444'],   // amber → red
  ['#10b981', '#3b82f6'],   // emerald → blue
  ['#f472b6', '#a78bfa'],   // pink → violet
  ['#06b6d4', '#10b981'],   // cyan → emerald
]
// Legacy accent for chips/arrows (first color of the gradient)
const MENU_ACCENTS = TILE_GRADIENTS.map(([a]) => a)

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

              <p className="text-base sm:text-lg max-w-xl" style={{ color: 'var(--text-secondary)' }}>
                {browseTopicsContent.subheadline}
              </p>
            </div>
          </FadeIn>
        </ParallaxSection>

        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {navMenus.map((menu, i) => {
            const [colorA, colorB] = TILE_GRADIENTS[i % TILE_GRADIENTS.length]
            const accent = MENU_ACCENTS[i % MENU_ACCENTS.length]
            return (
              /* Gradient border wrapper */
              <div
                key={menu.id}
                className="p-[1.5px] rounded-2xl group transition-all hover:scale-[1.015] hover:shadow-2xl"
                style={{
                  background: `linear-gradient(135deg, ${colorA}, ${colorB})`,
                  boxShadow: `0 0 0 0 ${colorA}00`,
                }}
              >
                <div
                  className="rounded-[calc(1rem-1.5px)] p-6 flex flex-col gap-4 h-full"
                  style={{ background: 'var(--bg-surface)' }}
                >
                  {/* Colour pill + arrow */}
                  <div className="flex items-center justify-between">
                    <div
                      className="h-1.5 w-10 rounded-full"
                      style={{ background: `linear-gradient(90deg, ${colorA}, ${colorB})` }}
                    />
                    <NavLink
                      href={`/${menu.slug}`}
                      className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
                      style={{
                        background: `linear-gradient(135deg, ${colorA}22, ${colorB}22)`,
                        border: `1px solid ${colorA}40`,
                        color: colorA,
                      }}
                    >
                      <ArrowRight size={14} />
                    </NavLink>
                  </div>

                  {/* Title */}
                  <NavLink href={`/${menu.slug}`}>
                    <h3
                      className="text-xl font-bold leading-snug transition-colors"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {menu.title}
                    </h3>
                  </NavLink>

                  {/* Description */}
                  {menu.description && (
                    <p className="text-sm leading-relaxed line-clamp-2 flex-1" style={{ color: 'var(--text-secondary)' }}>
                      {menu.description}
                    </p>
                  )}

                  {/* Sub-menu chips — fixed height, thin scrollbar */}
                  {menu.subMenus.length > 0 && (
                    <div
                      className="tile-chips-scroll flex flex-wrap gap-2 pt-3 pr-1"
                      style={{ borderTop: `1px solid ${colorA}18` }}
                    >
                      {menu.subMenus.map((sub) => (
                        <NavLink
                          key={sub.id}
                          href={`/${menu.slug}/${sub.slug}`}
                          className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all hover:scale-105"
                          style={{
                            background: `linear-gradient(135deg, ${colorA}14, ${colorB}14)`,
                            color: colorA,
                            border: `1px solid ${colorA}28`,
                          }}
                        >
                          <ChevronRight size={9} />
                          {sub.title}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
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
              <div className="flex items-end justify-between mb-10 sm:mb-12 flex-wrap gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles size={14} style={{ color: '#A78BFA' }} />
                    <span className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: '#A78BFA' }}>
                      {featuredArticlesContent.badge}
                    </span>
                  </div>
                  {/* Underline-highlight heading — different from modules italic style */}
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
                <Link
                  href={featuredArticlesContent.viewAllHref}
                  className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full transition-all hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, #f59e0b18, #ec489918)',
                    color: '#ef4444',
                    border: '1px solid #f59e0b30',
                  }}
                >
                  {featuredArticlesContent.viewAllLabel} <ArrowRight size={13} />
                </Link>
              </div>
            </FadeIn>
          </ParallaxSection>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
