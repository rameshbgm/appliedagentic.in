// app/(public)/search/page.tsx
import { prisma } from '@/lib/prisma'
import ArticleCard from '@/components/public/ArticleCard'
import SearchBar from '@/components/public/SearchBar'
import { StaggerContainer, FadeIn } from '@/components/public/ScrollAnimations'
import Link from 'next/link'
import type { Metadata } from 'next'

interface Props { searchParams: { q?: string } }

export function generateMetadata({ searchParams }: Props): Metadata {
  return {
    title: searchParams.q ? `Search: ${searchParams.q}` : 'Search',
    description: 'Search articles, topics, and modules on Applied Agentic AI.',
  }
}

export default async function SearchPage({ searchParams }: Props) {
  const q = searchParams.q?.trim() ?? ''

  let articles: any[] = []
  let totalCount = 0

  if (q) {
    const where = {
      status: 'PUBLISHED' as const,
      OR: [
        { title: { contains: q } },
        { summary: { contains: q } },
        { tags: { some: { tag: { name: { contains: q } } } } },
      ],
    }
    ;[articles, totalCount] = await Promise.all([
      prisma.article.findMany({
        where,
        orderBy: { viewCount: 'desc' },
        take: 24,
        include: {
          module: { select: { name: true, color: true } },
          tags: { include: { tag: true } },
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
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((a) => (
            <ArticleCard
              key={a.id}
              article={{ ...a, tags: a.tags.map((t: any) => ({ id: t.tag.id, name: t.tag.name })) }}
            />
          ))}
        </StaggerContainer>
      ) : q ? (
        <div className="text-center py-24" style={{ color: 'var(--text-muted)' }}>
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-lg mb-2">No articles found for "{q}"</p>
          <p className="text-sm mb-6">Try a different keyword or browse by module</p>
          <Link href="/modules" className="text-sm font-medium underline" style={{ color: '#6C3DFF' }}>
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
