// app/(admin)/admin/menus/[id]/articles/page.tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import MenuArticleLinker from './MenuArticleLinker'

export const metadata: Metadata = { title: 'Menu Articles' }
export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export default async function MenuArticlesPage({ params }: Props) {
  const { id } = await params
  const menu = await prisma.navMenu.findUnique({
    where: { id: parseInt(id) },
    include: {
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

  return (
    <MenuArticleLinker
      menuId={menu.id}
      menuTitle={menu.title}
      initialArticles={menu.menuArticles.map((a) => ({
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
      }))}
    />
  )
}
