// app/(public)/articles/page.tsx
// Server renders the first 25 articles; the client component handles
// infinite-scroll loading (50 per batch) from /api/articles/public.
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { FadeIn } from '@/components/public/ScrollAnimations'
import Link from 'next/link'
import type { Metadata } from 'next'
import ArticlesInfiniteLoader from './ArticlesInfiniteLoader'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'All Articles',
  description: 'Browse all published articles on AI agents, LLMs, and agentic systems.',
}

const INITIAL_SIZE = 25

interface Props {
  searchParams: Promise<{ tag?: string }>
}

export default async function ArticlesPage({ searchParams }: Props) {
  const { tag: tagName } = await searchParams

  let totalCount = 0
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let articles: any[] = []

  const where = {
    status: 'PUBLISHED' as const,
    ...(tagName ? { articleTags: { some: { tag: { name: tagName } } } } : {}),
  }

  try {
    ;[totalCount, articles] = await Promise.all([
      prisma.article.count({ where }),
      prisma.article.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: INITIAL_SIZE,
        select: {
          id: true,
          title: true,
          slug: true,
          summary: true,
          readingTimeMinutes: true,
          viewCount: true,
          createdAt: true,
          publishedAt: true,
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
  } catch (err) {
    logger.error('[GET /articles] DB error loading articles list', err)
    throw err
  }

  return (
    <div className="min-h-screen py-12 px-[3%]">
      <FadeIn>
        <div className="mb-10">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium mb-5 transition-colors hover:text-[var(--green)]"
            style={{ color: 'var(--text-muted)' }}
          >
            ← Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            {tagName ? `#${tagName}` : 'All'}{' '}
            <span className="gradient-text">Articles</span>
          </h1>
          <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
            {totalCount} article{totalCount !== 1 ? 's' : ''} found
          </p>
        </div>
      </FadeIn>

      {articles.length > 0 ? (
        <ArticlesInfiniteLoader
          initialArticles={articles}
          totalCount={totalCount}
          tag={tagName}
        />
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
