// app/(public)/[menuSlug]/[subMenuSlug]/page.tsx
// Public page for a sub-menu: lists its articles
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Clock, Eye, ArrowRight, Tag } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ menuSlug: string; subMenuSlug: string }>
}

export async function generateStaticParams() {
  try {
    const subMenus = await prisma.navSubMenu.findMany({
      where: { isVisible: true, menu: { isVisible: true } },
      select: { slug: true, menu: { select: { slug: true } } },
    })
    return subMenus.map((sm) => ({
      menuSlug: sm.menu.slug,
      subMenuSlug: sm.slug,
    }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subMenuSlug } = await params
  const subMenu = await prisma.navSubMenu.findUnique({
    where: { slug: subMenuSlug },
    select: { title: true, description: true, menu: { select: { title: true } } },
  })
  if (!subMenu) return {}
  return {
    title: `${subMenu.title} — ${subMenu.menu.title}`,
    description: subMenu.description ?? undefined,
  }
}

export default async function SubMenuPage({ params }: Props) {
  const { menuSlug, subMenuSlug } = await params

  const subMenu = await prisma.navSubMenu.findUnique({
    where: { slug: subMenuSlug },
    include: {
      menu: { select: { id: true, title: true, slug: true, isVisible: true } },
      articles: {
        orderBy: { orderIndex: 'asc' },
        include: {
          article: {
            include: {
              articleTags: { include: { tag: { select: { id: true, name: true } } } },
              coverImage: { select: { url: true } },
            },
          },
        },
      },
    },
  })

  if (!subMenu || !subMenu.menu.isVisible || !subMenu.isVisible) notFound()
  if (subMenu.menu.slug !== menuSlug) notFound()

  // Only show published articles
  const articles = subMenu.articles
    .filter((a) => a.article.status === 'PUBLISHED')
    .map((a) => a.article)

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div
        className="w-full px-4 md:px-8 pt-12 pb-14"
        style={{ borderBottom: '1px solid var(--bg-border)' }}
      >
        <div className="max-w-5xl mx-auto">
          <nav className="flex items-center gap-2 text-sm mb-6 flex-wrap" style={{ color: 'var(--text-muted)' }}>
            <Link href="/" className="hover:text-(--green) transition-colors">Home</Link>
            <span className="opacity-40">&rsaquo;</span>
            <Link href={`/${subMenu.menu.slug}`} className="hover:text-(--green) transition-colors">
              {subMenu.menu.title}
            </Link>
            <span className="opacity-40">&rsaquo;</span>
            <span style={{ color: 'var(--text-primary)' }}>{subMenu.title}</span>
          </nav>
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight tracking-tight mb-4"
            style={{ color: 'var(--text-primary)' }}
          >
            {subMenu.title}
          </h1>
          {subMenu.description && (
            <p className="text-lg leading-relaxed max-w-2xl" style={{ color: 'var(--text-secondary)' }}>
              {subMenu.description}
            </p>
          )}
          <p className="text-sm mt-4" style={{ color: 'var(--text-muted)' }}>
            {articles.length} article{articles.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Articles list */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-12">
        <div className="space-y-6">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/articles/${article.slug}`}
              className="group card p-6 flex flex-col sm:flex-row gap-5 transition-all hover:-translate-y-0.5"
            >
              {/* Cover thumbnail */}
              {article.coverImage && (
                <div className="w-full sm:w-48 h-32 sm:h-auto rounded-xl overflow-hidden shrink-0">
                  <img
                    src={article.coverImage.url}
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <h2
                  className="font-display font-semibold text-lg mb-2 group-hover:text-(--green) transition-colors line-clamp-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {article.title}
                </h2>

                {article.summary && (
                  <p className="text-sm leading-relaxed mb-3 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                    {article.summary}
                  </p>
                )}

                {/* Tags */}
                {article.articleTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {article.articleTags.slice(0, 4).map(({ tag }) => (
                      <span
                        key={tag.id}
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{ border: '1px solid var(--bg-border)', color: 'var(--text-muted)' }}
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Meta */}
                <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                  {article.publishedAt && (
                    <span className="flex items-center gap-1">
                      <Calendar size={11} />
                      {formatDate(article.publishedAt.toString())}
                    </span>
                  )}
                  {article.readingTimeMinutes && (
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {article.readingTimeMinutes} min
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Eye size={11} />
                    {article.viewCount.toLocaleString()}
                  </span>
                </div>

                <span
                  className="inline-flex items-center gap-1 text-xs font-medium mt-3 group-hover:gap-2 transition-all"
                  style={{ color: 'var(--green)' }}
                >
                  Read more <ArrowRight size={12} />
                </span>
              </div>
            </Link>
          ))}
        </div>

        {articles.length === 0 && (
          <div className="text-center py-20" style={{ color: 'var(--text-muted)' }}>
            <p className="text-lg mb-2" style={{ color: 'var(--text-secondary)' }}>No articles yet</p>
            <p className="text-sm">Articles will appear here once published.</p>
          </div>
        )}
      </div>
    </div>
  )
}
