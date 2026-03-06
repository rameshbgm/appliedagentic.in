// app/(admin)/admin/menus/[id]/edit/page.tsx
export const dynamic = 'force-dynamic'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import MenuForm from '../../MenuForm'
import MenuSubMenusPanel from '../../MenuSubMenusPanel'
import MenuArticleLinker from '../articles/MenuArticleLinker'

export const metadata: Metadata = { title: 'Edit Menu' }

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditMenuPage({ params }: Props) {
  const { id } = await params
  const menu = await prisma.navMenu.findUnique({
    where: { id: parseInt(id) },
    include: {
      subMenus: {
        orderBy: { order: 'asc' },
        select: {
          id: true,
          title: true,
          slug: true,
          isVisible: true,
          order: true,
          _count: { select: { articles: true } },
        },
      },
      menuArticles: {
        orderBy: { orderIndex: 'asc' },
        include: {
          article: {
            select: {
              id: true, title: true, slug: true, summary: true,
              status: true, publishedAt: true, readingTimeMinutes: true,
            },
          },
        },
      },
    },
  })
  if (!menu) notFound()

  const linkedArticles = menu.menuArticles.map((a) => ({
    id: a.id,
    menuId: a.menuId,
    articleId: a.articleId,
    orderIndex: a.orderIndex,
    article: {
      id: a.article.id,
      title: a.article.title,
      slug: a.article.slug,
      summary: a.article.summary,
      status: a.article.status,
      publishedAt: a.article.publishedAt?.toISOString() ?? null,
      readingTimeMinutes: a.article.readingTimeMinutes,
    },
  }))

  return (
    <div className="space-y-10">
      <MenuForm
        initial={{
          id: menu.id,
          title: menu.title,
          slug: menu.slug,
          description: menu.description ?? '',
          order: menu.order,
          isVisible: menu.isVisible,
        }}
      />

      <div style={{ borderTop: '1px solid var(--bg-border)' }} />

      {/* Direct articles linked to this menu */}
      <MenuArticleLinker
        menuId={menu.id}
        menuTitle={menu.title}
        initialArticles={linkedArticles}
        compact
      />

      <div style={{ borderTop: '1px solid var(--bg-border)' }} />

      {/* Sub-menus linked to this menu */}
      <MenuSubMenusPanel
        menuId={menu.id}
        menuTitle={menu.title}
        initialSubMenus={menu.subMenus}
      />
    </div>
  )
}
