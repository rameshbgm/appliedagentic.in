// app/(admin)/admin/submenus/[id]/edit/page.tsx
export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import SubMenuForm from '../../SubMenuForm'
import ArticleLinker from '../articles/ArticleLinker'

export const metadata: Metadata = { title: 'Edit Sub-Menu' }

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditSubMenuPage({ params }: Props) {
  const { id } = await params

  const [subMenu, menus] = await Promise.all([
    prisma.navSubMenu.findUnique({
      where: { id: parseInt(id) },
      include: {
        menu: { select: { id: true, title: true, slug: true } },
        articles: {
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
    }),
    prisma.navMenu.findMany({ orderBy: { order: 'asc' }, select: { id: true, title: true } }),
  ])

  if (!subMenu) notFound()

  const linkedArticles = subMenu.articles.map((a) => ({
    id: a.id,
    subMenuId: a.subMenuId,
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
      <SubMenuForm
        menus={menus}
        initial={{
          id: subMenu.id,
          title: subMenu.title,
          slug: subMenu.slug,
          menuId: subMenu.menuId,
          description: subMenu.description ?? '',
          order: subMenu.order,
          isVisible: subMenu.isVisible,
        }}
      />

      {/* Divider */}
      <div style={{ borderTop: '1px solid var(--bg-border)' }} />

      {/* Linked articles management */}
      <ArticleLinker
        subMenuId={subMenu.id}
        subMenuTitle={subMenu.title}
        menuTitle={subMenu.menu.title}
        initialArticles={linkedArticles}
      />
    </div>
  )
}
