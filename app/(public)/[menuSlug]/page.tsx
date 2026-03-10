// app/(public)/[menuSlug]/page.tsx
// Public page for a top-level menu: lists its sub-menus and directly-assigned articles
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import SubMenusView from './SubMenusView'
import ArticlesView from './[subMenuSlug]/ArticlesView'

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
                viewCount: true,
                status: true,
                coverImage: { select: { url: true } },
                articleTags: { include: { tag: { select: { id: true, name: true } } } },
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
          <SubMenusView subMenus={menu.subMenus} menuSlug={menu.slug} />
        )}

        {/* ── Articles section (directly assigned to this menu) ── */}
        {articles.length > 0 && (
          <section>
            <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
              Articles
            </h2>
            <ArticlesView articles={articles} />
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

