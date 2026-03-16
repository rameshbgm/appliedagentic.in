// app/(public)/page.tsx
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import HeroSection from '@/components/public/HeroSection'
import ArticleCard from '@/components/public/ArticleCard'
import NewsletterSection from '@/components/public/NewsletterSection'
import { StaggerContainer, FadeIn, ParallaxSection } from '@/components/public/ScrollAnimations'
import Link from 'next/link'
import { BookOpen, Sparkles, FileText } from 'lucide-react'
import fs from 'fs'
import path from 'path'
import type { Metadata } from 'next'
import { browseTopicsContent, featuredArticlesContent, ctaBannerContent } from '@/content/home'
import ModuleTileGrid from '@/components/public/ModuleTileGrid'
import ScrollBorderWrapper from '@/components/public/ScrollBorderWrapper'

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

// Rich multi-stop text-only gradients — picked by filename hash for variety
const FILE_NAME_GRADIENTS = [
  'linear-gradient(90deg, #34d399 0%, #38bdf8 50%, #818cf8 100%)',
  'linear-gradient(90deg, #f59e0b 0%, #ef4444 50%, #ec4899 100%)',
  'linear-gradient(90deg, #818cf8 0%, #ec4899 50%, #fb923c 100%)',
  'linear-gradient(90deg, #38bdf8 0%, #34d399 50%, #4ade80 100%)',
  'linear-gradient(90deg, #f472b6 0%, #a78bfa 50%, #38bdf8 100%)',
  'linear-gradient(90deg, #4ade80 0%, #f59e0b 50%, #ef4444 100%)',
  'linear-gradient(90deg, #a78bfa 0%, #38bdf8 50%, #34d399 100%)',
  'linear-gradient(90deg, #fb923c 0%, #f59e0b 50%, #4ade80 100%)',
  'linear-gradient(90deg, #ec4899 0%, #818cf8 50%, #38bdf8 100%)',
  'linear-gradient(90deg, #34d399 0%, #a78bfa 50%, #ec4899 100%)',
  'linear-gradient(90deg, #38bdf8 0%, #f472b6 50%, #fb923c 100%)',
  'linear-gradient(90deg, #4ade80 0%, #38bdf8 50%, #a78bfa 100%)',
  'linear-gradient(90deg, #fbbf24 0%, #f472b6 50%, #818cf8 100%)',
  'linear-gradient(90deg, #34d399 0%, #fbbf24 50%, #f472b6 100%)',
  'linear-gradient(90deg, #60a5fa 0%, #34d399 50%, #fbbf24 100%)',
  'linear-gradient(90deg, #f87171 0%, #fbbf24 50%, #4ade80 100%)',
]
function getNameGradient(filename: string): string {
  let h = 0
  for (let i = 0; i < filename.length; i++) h = (h * 31 + filename.charCodeAt(i)) & 0xffffffff
  return FILE_NAME_GRADIENTS[Math.abs(h) % FILE_NAME_GRADIENTS.length]
}

const CARD_GRADIENTS = [
  { gradient: 'linear-gradient(135deg, #34d399 0%, #38bdf8 100%)', icon: '#34d399', glow: 'rgba(52,211,153,0.15)', border: 'rgba(52,211,153,0.25)',  label: '#34d399',  colorA: '#34d399', colorB: '#38bdf8' },
  { gradient: 'linear-gradient(135deg, #818cf8 0%, #ec4899 100%)', icon: '#818cf8', glow: 'rgba(129,140,248,0.15)', border: 'rgba(129,140,248,0.25)', label: '#818cf8', colorA: '#818cf8', colorB: '#ec4899' },
  { gradient: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)', icon: '#f59e0b', glow: 'rgba(245,158,11,0.15)',  border: 'rgba(245,158,11,0.25)',  label: '#f59e0b',  colorA: '#f59e0b', colorB: '#ef4444' },
  { gradient: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)', icon: '#38bdf8', glow: 'rgba(56,189,248,0.15)',  border: 'rgba(56,189,248,0.25)',  label: '#38bdf8',  colorA: '#38bdf8', colorB: '#818cf8' },
  { gradient: 'linear-gradient(135deg, #f472b6 0%, #fb923c 100%)', icon: '#f472b6', glow: 'rgba(244,114,182,0.15)', border: 'rgba(244,114,182,0.25)', label: '#f472b6', colorA: '#f472b6', colorB: '#fb923c' },
  { gradient: 'linear-gradient(135deg, #4ade80 0%, #38bdf8 100%)', icon: '#4ade80', glow: 'rgba(74,222,128,0.15)',  border: 'rgba(74,222,128,0.25)',  label: '#4ade80',  colorA: '#4ade80', colorB: '#38bdf8' },
]

function getStaticFiles() {
  try {
    const publicDir = path.join(process.cwd(), 'public')
    return fs
      .readdirSync(publicDir)
      .filter((f) => f.endsWith('.html') || f.endsWith('.htm'))
      .map((f) => {
        const fallbackName = f.replace(/\.(html|htm)$/, '').replace(/[-_]/g, ' ')
        let title = fallbackName
        let description: string | null = null

        try {
          const html = fs.readFileSync(path.join(publicDir, f), 'utf8')
          const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
          if (titleMatch) title = titleMatch[1].trim()

          // match both single-line and multi-line description meta tags
          const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)
            ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i)
            ?? html.match(/name="description"[\s\S]*?content="([^"]+)"/i)
          if (descMatch) description = descMatch[1].trim()
        } catch {
          // if reading fails, use filename-based fallback
        }

        return { name: fallbackName, title, description, file: f, href: `/${f}` }
      })
  } catch {
    return []
  }
}

export default async function HomePage() {
  const { navMenus, featuredArticles } = await getData()
  const staticFiles = getStaticFiles()

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

      {/* ── Static Resources ── */}
      {staticFiles.length > 0 && (
        <section className="py-16 sm:py-24 px-4 md:px-8 max-w-7xl mx-auto">
          <ParallaxSection speed={0.25}>
            <FadeIn>
              <div className="mb-12 sm:mb-16">
                <div className="flex items-center gap-2 mb-4">
                  <FileText size={15} style={{ color: '#34D399' }} />
                  <span className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: '#34D399' }}>
                    Presentations &amp; Guides
                  </span>
                </div>
                <h2
                  className="font-black leading-[1.08] tracking-tight mb-4"
                  style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontFamily: "'Inter', sans-serif" }}
                >
                  <span style={{ color: 'var(--text-primary)' }}>Explore our </span>
                  <span
                    style={{
                      background: 'linear-gradient(135deg, #34d399 0%, #38bdf8 50%, #818cf8 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    interactive slides
                  </span>
                </h2>
                <p
                  className="text-base sm:text-lg max-w-2xl"
                  style={{ color: 'var(--text-secondary)', fontFamily: "'Literata', 'Source Serif 4', Georgia, serif", fontStyle: 'italic', lineHeight: '1.7' }}
                >
                  Hands-on presentations and visual guides covering agentic AI concepts, architectures, and real-world patterns.
                </p>
              </div>
            </FadeIn>
          </ParallaxSection>

          {/* Mobile: list rows (3 visible + scroll) | Desktop md+: 3-col tile grid (3 rows + scroll) */}
          {/* Scroll container is narrowed; heading stays in full-width section */}
          <div className="max-w-3xl">
          <ScrollBorderWrapper
            className="static-resources-scroll static-resources-responsive"
            style={{
              overflowY: 'auto',
              overflowX: 'hidden',
              borderRadius: '1rem',
            }}
          >
            {/* ── Mobile list (hidden on md+) ── */}
            <div className="flex flex-col md:hidden">
              {staticFiles.map((item, idx) => {
                const palette = CARD_GRADIENTS[idx % CARD_GRADIENTS.length]
                return (
                  <a
                    key={item.file}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 px-4 py-3 transition-colors duration-150 hover:bg-white/5 first:rounded-t-xl last:rounded-b-xl"
                    style={{ borderBottom: '1px solid var(--bg-border)' }}
                  >
                    <div
                      className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg"
                      style={{ background: `linear-gradient(135deg, ${palette.glow.replace('0.15','0.2')} 0%, ${palette.glow.replace('0.15','0.07')} 100%)`, border: `1px solid ${palette.border}` }}
                    >
                      <FileText size={14} style={{ color: palette.icon }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate text-[0.78rem] leading-tight"
                        style={{ background: getNameGradient(item.file), WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontFamily: "'Inter', sans-serif" }}>
                        {item.title}
                      </p>
                      {item.description && (
                        <p className="mt-0.5 truncate text-[0.65rem]"
                          style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                          {item.description}
                        </p>
                      )}
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={palette.icon} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 opacity-40 group-hover:opacity-100 transition-opacity">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </a>
                )
              })}
            </div>

            {/* ── Desktop 3-col tile grid (hidden on mobile) ── */}
            <div className="hidden md:grid grid-cols-3 gap-3 p-1">
              {staticFiles.map((item, idx) => {
                const palette = CARD_GRADIENTS[idx % CARD_GRADIENTS.length]
                return (
                  <div
                    key={item.file}
                    className="module-tile-wrapper relative rounded-xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    {/* Spinning conic-gradient ring — clipped to 1 px by overflow-hidden + margin */}
                    <div
                      className="module-tile-ring"
                      style={{ background: `conic-gradient(from 0deg, ${palette.colorA} 0%, ${palette.colorB} 50%, ${palette.colorA} 100%)` }}
                    />
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative flex flex-col gap-0"
                      style={{ background: 'var(--bg-surface)', display: 'flex', position: 'relative', zIndex: 1, margin: '1px', borderRadius: 'calc(0.75rem - 1px)', padding: '1rem' }}
                    >
                      {/* top-right external icon */}
                      <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={palette.icon} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="absolute top-3 right-3 opacity-30 group-hover:opacity-100 transition-opacity">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                      <p className="font-bold text-[0.92rem] leading-snug pr-4 line-clamp-2 pb-3"
                        style={{ background: getNameGradient(item.file), WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontFamily: "'Inter', sans-serif" }}>
                        {item.title}
                      </p>
                      <div style={{ height: '1px', background: `linear-gradient(90deg, ${palette.colorA}55, ${palette.colorB}33, transparent)` }} />
                      {item.description && (
                        <p className="text-[0.68rem] leading-relaxed line-clamp-2 pt-3"
                          style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                          {item.description}
                        </p>
                      )}
                      <span className="text-[0.6rem] font-semibold uppercase tracking-widest mt-auto pt-3" style={{ color: palette.label }}>
                        Open →
                      </span>
                    </a>
                  </div>
                )
              })}
            </div>
          </ScrollBorderWrapper>
          </div>
        </section>
      )}

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
            <p className="relative text-lg mb-8 max-w-xl mx-auto" style={{ color: 'var(--text-secondary)', fontFamily: "'Lora', Georgia, serif", fontStyle: 'italic' }}>
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
