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
    <div className="min-h-screen" style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>
      {/* ── Search hero ── */}
      <div
        className="pt-24 pb-10 px-4"
        style={{ borderBottom: '1px solid var(--bg-border)' }}
      >
        <div className="max-w-2xl mx-auto">
          <FadeIn>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] mb-3 text-center" style={{ color: 'var(--text-muted)' }}>
              {q ? `${totalCount} result${totalCount !== 1 ? 's' : ''} for` : 'Search'}
            </p>
            {q ? (
              <h1 className="text-3xl font-bold text-center mb-8 leading-tight" style={{ color: 'var(--text-primary)' }}>
                &ldquo;{q}&rdquo;
              </h1>
            ) : (
              <h1 className="text-3xl font-bold text-center mb-8" style={{ color: 'var(--text-primary)' }}>
                What are you looking for?
              </h1>
            )}
            <SearchBar placeholder="Search articles, topics, modules..." autoFocus fullPage />
          </FadeIn>
        </div>
      </div>

      {/* ── Results ── */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        {articles.length > 0 ? (
          <div className="flex flex-col divide-y" style={{ borderTop: '1px solid var(--bg-border)', borderBottom: '1px solid var(--bg-border)' }}>
            {articles.map((a) => {
              const href = `/articles/${a.slug}`
              const moduleName: string | undefined = a.topicArticles[0]?.topic?.module?.name
              const moduleColor: string | undefined = a.topicArticles[0]?.topic?.module?.color
              const tags: string[] = a.articleTags.map((at: { tag: { name: string } }) => at.tag.name)
              return (
                <NavLink
                  key={a.id}
                  href={href}
                  className="group flex gap-4 py-5 transition-colors"
                  style={{ textDecoration: 'none', borderColor: 'var(--bg-border)' }}
                >
                  {/* Thumbnail */}
                  <div className="shrink-0 rounded-xl overflow-hidden hidden sm:block" style={{ width: 96, height: 68, background: 'var(--bg-elevated)' }}>
                    {a.coverImage?.url ? (
                      <LazyImage src={a.coverImage.url} alt={a.title} className="object-cover w-full h-full" wrapperClassName="w-full h-full" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl" style={{ background: 'var(--bg-elevated)' }}>📄</div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      {moduleName && (
                        <span
                          className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: moduleColor ? `${moduleColor}18` : 'var(--bg-elevated)', color: moduleColor ?? 'var(--text-muted)' }}
                        >
                          {moduleName}
                        </span>
                      )}
                    </div>

                    <h3 className="font-semibold text-[15px] leading-snug mb-1.5 line-clamp-2 transition-colors group-hover:text-[#3b82f6]" style={{ color: 'var(--text-primary)' }}>
                      {a.title}
                    </h3>

                    {a.summary && (
                      <p className="text-sm leading-relaxed line-clamp-2 mb-2" style={{ color: 'var(--text-muted)' }}>
                        {a.summary}
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-xs flex-wrap" style={{ color: 'var(--text-muted)' }}>
                      {tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="px-2 py-0.5 rounded-full" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--bg-border)' }}>
                          {tag}
                        </span>
                      ))}
                      <span className="flex items-center gap-1 ml-auto">
                        {a.readingTimeMinutes && <><Clock size={10} /> {a.readingTimeMinutes} min</>}
                      </span>
                      {a.viewCount > 0 && (
                        <span className="flex items-center gap-1">
                          <Eye size={10} /> {a.viewCount.toLocaleString()}
                        </span>
                      )}
                      <span className="flex items-center gap-1 font-medium opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: '#3b82f6' }}>
                        Read <ArrowRight size={11} />
                      </span>
                    </div>
                  </div>
                </NavLink>
              )
            })}
          </div>
        ) : q ? (
          <div className="text-center py-20" style={{ color: 'var(--text-muted)' }}>
            <p className="text-4xl mb-4">🔍</p>
            <p className="text-base font-medium mb-1" style={{ color: 'var(--text-primary)' }}>No results found</p>
            <p className="text-sm mb-6">Try different keywords or browse by module</p>
            <Link href="/modules" className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: '#3b82f6' }}>
              Browse learning modules <ArrowRight size={13} />
            </Link>
          </div>
        ) : (
          <div className="text-center py-20" style={{ color: 'var(--text-muted)' }}>
            <p className="text-4xl mb-4">🔎</p>
            <p className="text-sm">Type above to find articles, topics &amp; modules</p>
          </div>
        )}
      </div>
    </div>
  )
}
