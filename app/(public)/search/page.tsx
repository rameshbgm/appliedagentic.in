// app/(public)/search/page.tsx
import { prisma } from '@/lib/prisma'
import SearchBar from '@/components/public/SearchBar'
import { FadeIn } from '@/components/public/ScrollAnimations'
import NavLink from '@/components/shared/NavLink'
import LazyImage from '@/components/shared/LazyImage'
import Link from 'next/link'
import { Clock, Eye, ArrowRight } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { Metadata } from 'next'

interface Props { searchParams: Promise<{ q?: string }> }

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams
  return {
    title: q ? `Search: ${q}` : 'Search',
    description: 'Search articles, topics, and modules on Applied Agentic AI.',
  }
}

export default async function SearchPage({ searchParams }: Props) {
  const { q: rawQ } = await searchParams
  const q = rawQ?.trim() ?? ''

  let articles: any[] = []
  let totalCount = 0

  if (q) {
    const where = {
      status: 'PUBLISHED' as const,
      OR: [
        { title: { contains: q } },
        { summary: { contains: q } },
        { articleTags: { some: { tag: { name: { contains: q } } } } },
      ],
    }
    ;[articles, totalCount] = await Promise.all([
      prisma.article.findMany({
        where,
        orderBy: { viewCount: 'desc' },
        take: 24,
        include: {
          coverImage: { select: { url: true } },
          articleTags: { include: { tag: { select: { name: true } } } },
          topicArticles: {
            take: 1,
            include: {
              topic: { select: { module: { select: { name: true, color: true } } } },
            },
          },
        },
      }),
      prisma.article.count({ where }),
    ])
  }

  return (
    <div className="min-h-screen py-16 px-4 md:px-8 max-w-7xl mx-auto">
      <FadeIn>
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
            {q ? (
              <>
                Results for{' '}
                <span className="gradient-text">"{q}"</span>
              </>
            ) : (
              <>Search <span className="gradient-text">Articles</span></>
            )}
          </h1>
          <SearchBar placeholder="Search articles, topics, modules..." autoFocus fullPage />
        </div>
      </FadeIn>

      {q && (
        <FadeIn>
          <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
            {totalCount} result{totalCount !== 1 ? 's' : ''} found
          </p>
        </FadeIn>
      )}

      {articles.length > 0 ? (
        <div className="flex flex-col gap-4">
          {articles.map((a) => {
            const href = `/articles/${a.slug}`
            const moduleName: string | undefined = a.topicArticles[0]?.topic?.module?.name
            const moduleColor: string | undefined = a.topicArticles[0]?.topic?.module?.color
            const tags: string[] = a.articleTags.map((at: { tag: { name: string } }) => at.tag.name)
            return (
              <NavLink
                key={a.id}
                href={href}
                className="group flex gap-4 rounded-2xl p-4 transition-colors hover:bg-(--bg-elevated) border border-transparent hover:border-(--border)"
                style={{ textDecoration: 'none' }}
              >
                {/* Cover image thumbnail */}
                <div
                  className="shrink-0 rounded-xl overflow-hidden"
                  style={{ width: 120, height: 80, background: 'var(--bg-elevated)' }}
                >
                  {a.coverImage?.url ? (
                    <LazyImage
                      src={a.coverImage.url}
                      alt={a.title}
                      className="object-cover w-full h-full"
                      wrapperClassName="w-full h-full"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center text-3xl"
                      style={{ background: 'var(--bg-elevated)' }}
                    >
                      📄
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Module badge */}
                  {moduleName && (
                    <span
                      className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-1.5"
                      style={{
                        background: moduleColor ? `${moduleColor}22` : 'var(--bg-elevated)',
                        color: moduleColor ?? 'var(--text-muted)',
                        border: `1px solid ${moduleColor ?? 'var(--border)'}44`,
                      }}
                    >
                      {moduleName}
                    </span>
                  )}

                  {/* Title */}
                  <h3
                    className="font-semibold text-base leading-snug mb-1 group-hover:text-(--green) transition-colors line-clamp-2"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {a.title}
                  </h3>

                  {/* Summary */}
                  {a.summary && (
                    <p
                      className="text-sm leading-relaxed mb-2 line-clamp-2"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {a.summary}
                    </p>
                  )}

                  {/* Tags */}
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {tags.slice(0, 5).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Meta row */}
                  <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                    {a.readingTimeMinutes && (
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        {a.readingTimeMinutes} min read
                      </span>
                    )}
                    {a.viewCount > 0 && (
                      <span className="flex items-center gap-1">
                        <Eye size={11} />
                        {a.viewCount.toLocaleString()} views
                      </span>
                    )}
                    {a.createdAt && (
                      <span>{formatDate(a.createdAt)}</span>
                    )}
                    <span
                      className="ml-auto flex items-center gap-1 font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: 'var(--green)' }}
                    >
                      Read <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              </NavLink>
            )
          })}
        </div>
      ) : q ? (
        <div className="text-center py-24" style={{ color: 'var(--text-muted)' }}>
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-lg mb-2">No articles found for "{q}"</p>
          <p className="text-sm mb-6">Try a different keyword or browse by module</p>
          <Link href="/modules" className="text-sm font-medium underline" style={{ color: 'var(--green)' }}>
            Browse learning modules →
          </Link>
        </div>
      ) : (
        <div className="text-center py-24" style={{ color: 'var(--text-muted)' }}>
          <p className="text-5xl mb-4">🔎</p>
          <p className="text-lg">Start typing to search articles</p>
        </div>
      )}
    </div>
  )
}
