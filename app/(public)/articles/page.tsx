// app/(public)/articles/page.tsx
import { prisma } from '@/lib/prisma'
import ArticleCard from '@/components/public/ArticleCard'
import { StaggerContainer, FadeIn } from '@/components/public/ScrollAnimations'
import Link from 'next/link'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'All Articles',
  description: 'Browse all published articles on AI agents, LLMs, and agentic systems.',
}

export const revalidate = 60

const PAGE_SIZE = 12

interface Props {
  searchParams: Promise<{ page?: string; module?: string; tag?: string }>
}

export default async function ArticlesPage({ searchParams }: Props) {
  const { page: pageParam, module: moduleSlug, tag: tagName } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1'))

  const [modules, totalCount, articles] = await Promise.all([
    prisma.module.findMany({ where: { isPublished: true }, orderBy: { order: 'asc' }, select: { id: true, name: true, slug: true, color: true } }),
    prisma.article.count({
      where: {
        status: 'PUBLISHED',
        ...(moduleSlug ? { topicArticles: { some: { topic: { module: { slug: moduleSlug } } } } } : {}),
        ...(tagName ? { articleTags: { some: { tag: { name: tagName } } } } : {}),
      },
    }),
    prisma.article.findMany({
      where: {
        status: 'PUBLISHED',
        ...(moduleSlug ? { topicArticles: { some: { topic: { module: { slug: moduleSlug } } } } } : {}),
        ...(tagName ? { articleTags: { some: { tag: { name: tagName } } } } : {}),
      },
      orderBy: { publishedAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
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

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)
  const activeModule = modules.find((m) => m.slug === moduleSlug)

  const buildUrl = (p: number, mod?: string) => {
    const params = new URLSearchParams()
    if (p > 1) params.set('page', String(p))
    if (mod) params.set('module', mod)
    if (tagName) params.set('tag', tagName)
    return `/articles${params.toString() ? '?' + params.toString() : ''}`
  }

  return (
    <div className="min-h-screen py-12 px-[3%]">
      <FadeIn>
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            {activeModule ? activeModule.name : tagName ? `#${tagName}` : 'All'}{' '}
            <span className="gradient-text">Articles</span>
          </h1>
          <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
            {totalCount} article{totalCount !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Module filter chips */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Link
            href="/articles"
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${!moduleSlug ? 'text-black' : 'hover:bg-white/10'}`}
            style={!moduleSlug
              ? { background: 'var(--green)', color: 'var(--bg-page)' }
              : { background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--bg-border)' }
            }
          >
            All
          </Link>
          {modules.map((m) => (
            <Link
              key={m.id}
              href={buildUrl(1, m.slug)}
              className="px-4 py-1.5 rounded-full text-sm font-medium transition-all"
              style={moduleSlug === m.slug
                ? { background: (m.color ?? '#AAFF00') + '25', color: m.color ?? '#AAFF00', border: `1px solid ${(m.color ?? '#AAFF00')}40` }
                : { background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--bg-border)' }
              }
            >
              {m.name}
            </Link>
          ))}
        </div>
      </FadeIn>

      {articles.length > 0 ? (
        <>
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              {page > 1 && (
                <Link href={buildUrl(page - 1, moduleSlug)} className="px-4 py-2 rounded-xl text-sm border transition-all hover:bg-white/5"
                  style={{ borderColor: 'var(--bg-border)', color: 'var(--text-secondary)' }}>
                  ← Prev
                </Link>
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={buildUrl(p, moduleSlug)}
                  className="w-9 h-9 flex items-center justify-center rounded-xl text-sm font-medium transition-all"
                  style={p === page
                    ? { background: 'var(--green)', color: 'var(--bg-page)' }
                    : { color: 'var(--text-secondary)', border: '1px solid var(--bg-border)' }
                  }
                >
                  {p}
                </Link>
              ))}
              {page < totalPages && (
                <Link href={buildUrl(page + 1, moduleSlug)} className="px-4 py-2 rounded-xl text-sm border transition-all hover:bg-white/5"
                  style={{ borderColor: 'var(--bg-border)', color: 'var(--text-secondary)' }}>
                  Next →
                </Link>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-24" style={{ color: 'var(--text-muted)' }}>
          <p className="text-5xl mb-4">📭</p>
          <p className="text-lg">No articles yet in this category</p>
          <Link href="/articles" className="mt-4 inline-block text-sm font-medium" style={{ color: 'var(--green)' }}>
            View all articles →
          </Link>
        </div>
      )}
    </div>
  )
}
