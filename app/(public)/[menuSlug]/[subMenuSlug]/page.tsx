// app/(public)/[menuSlug]/[subMenuSlug]/page.tsx
// Public page for a sub-menu: lists its articles
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import ArticlesView from './ArticlesView'

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
  try {
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
  } catch (err) {
    logger.error('[generateMetadata /[menuSlug]/[subMenuSlug]]', err)
    return {}
  }
}

export default async function SubMenuPage({ params }: Props) {
  const { menuSlug, subMenuSlug } = await params

  let subMenu
  try {
    subMenu = await prisma.navSubMenu.findUnique({
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
  } catch (err) {
    logger.error(`[GET /${menuSlug}/${subMenuSlug}] DB error loading sub-menu`, err)
    throw err
  }

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
            <p className="text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {subMenu.description}
            </p>
          )}
        </div>
      </div>

      {/* Articles — list/grid toggle */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-10">
        <ArticlesView articles={articles} />
      </div>
    </div>
  )
}
