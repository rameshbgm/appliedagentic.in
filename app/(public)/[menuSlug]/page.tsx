// app/(public)/[menuSlug]/page.tsx
// Public page for a top-level menu: lists its sub-menus and directly-assigned articles
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, FileText, Clock } from 'lucide-react'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ menuSlug: string }>
}

export async function generateStaticParams() {
  try {
    const menus = await prisma.navMenu.findMany({
      where: { isVisible: true },
      select: { slug: true },
    })
    return menus.map((m) => ({ menuSlug: m.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { menuSlug } = await params
    const menu = await prisma.navMenu.findUnique({
      where: { slug: menuSlug },
      select: { title: true, description: true },
    })
    if (!menu) return {}
    return {
      title: menu.title,
      description: menu.description ?? undefined,
    }
  } catch (err) {
    logger.error('[generateMetadata /[menuSlug]]', err)
    return {}
  }
}

export default async function MenuPage({ params }: Props) {
  const { menuSlug } = await params
  let menu
  try {
    menu = await prisma.navMenu.findUnique({
      where: { slug: menuSlug, isVisible: true },
      include: {
        subMenus: {
          where: { isVisible: true },
          orderBy: { order: 'asc' },
          include: {
            _count: { select: { articles: true } },
          },
        },
        menuArticles: {
          orderBy: { orderIndex: 'asc' },
          include: {
            article: {
              select: {
                id: true,
                title: true,
                slug: true,
                summary: true,
                readingTimeMinutes: true,
                publishedAt: true,
                status: true,
                coverImage: { select: { url: true, altText: true } },
              },
            },
          },
        },
      },
    })
  } catch (err) {
    logger.error(`[GET /${menuSlug}] DB error loading menu`, err)
    throw err
  }

  if (!menu) notFound()

  // Only show published articles on the public page
  const articles = menu.menuArticles
    .map((ma) => ma.article)
    .filter((a) => a.status === 'PUBLISHED')

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div
        className="w-full px-4 md:px-8 pt-12 pb-14"
        style={{ borderBottom: '1px solid var(--bg-border)' }}
      >
        <div className="max-w-5xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium mb-6 transition-colors hover:text-[var(--green)]"
            style={{ color: 'var(--text-muted)' }}
          >
            ← Back to Home
          </Link>
          <nav className="flex items-center gap-2 text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
            <Link href="/" className="hover:text-(--green) transition-colors">Home</Link>
            <span className="opacity-40">&rsaquo;</span>
            <span style={{ color: 'var(--text-primary)' }}>{menu.title}</span>
          </nav>
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight tracking-tight mb-4"
            style={{ color: 'var(--text-primary)' }}
          >
            {menu.title}
          </h1>
          {menu.description && (
            <p className="text-lg leading-relaxed max-w-2xl" style={{ color: 'var(--text-secondary)' }}>
              {menu.description}
            </p>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-12 space-y-14">

        {/* ── Sub-menus section ── */}
        {menu.subMenus.length > 0 && (
          <section>
            <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
              Topics
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {menu.subMenus.map((sm) => (
                <Link
                  key={sm.id}
                  href={`/${menu.slug}/${sm.slug}`}
                  className="group card p-6 flex flex-col transition-all hover:-translate-y-1"
                >
                  <h3
                    className="font-display font-semibold text-lg mb-2 group-hover:text-(--green) transition-colors"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {sm.title}
                  </h3>
                  {sm.description && (
                    <p className="text-sm leading-relaxed mb-4 flex-1" style={{ color: 'var(--text-secondary)' }}>
                      {sm.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-auto pt-4" style={{ borderTop: '1px solid var(--bg-border)' }}>
                    <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                      <FileText size={12} />
                      {sm._count.articles} article{sm._count.articles !== 1 ? 's' : ''}
                    </span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" style={{ color: 'var(--green)' }} />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── Articles section (directly assigned to this menu) ── */}
        {articles.length > 0 && (
          <section>
            <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
              Articles
            </h2>
            <div className="space-y-4">
              {articles.map((article) => (
                <Link
                  key={article.id}
                  href={`/articles/${article.slug}`}
                  className="group card p-5 flex gap-4 items-start transition-all hover:-translate-y-0.5"
                >
                  {article.coverImage?.url && (
                    <img
                      src={article.coverImage.url}
                      alt={article.coverImage.altText ?? article.title}
                      className="w-20 h-14 rounded-xl object-cover shrink-0 hidden sm:block"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3
                      className="font-semibold text-base mb-1 group-hover:text-(--green) transition-colors line-clamp-2"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {article.title}
                    </h3>
                    {article.summary && (
                      <p className="text-sm line-clamp-2 mb-2" style={{ color: 'var(--text-secondary)' }}>
                        {article.summary}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                      {article.readingTimeMinutes && (
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          {article.readingTimeMinutes} min read
                        </span>
                      )}
                      {article.publishedAt && (
                        <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  <ArrowRight size={16} className="shrink-0 mt-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" style={{ color: 'var(--green)' }} />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {menu.subMenus.length === 0 && articles.length === 0 && (
          <div className="text-center py-20" style={{ color: 'var(--text-muted)' }}>
            <p className="text-lg mb-2" style={{ color: 'var(--text-secondary)' }}>No content yet</p>
            <p className="text-sm">This section is coming soon.</p>
          </div>
        )}
      </div>
    </div>
  )
}

