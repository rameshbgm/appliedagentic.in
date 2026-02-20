// app/(admin)/admin/submenus/[id]/articles/page.tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ArticleLinker from './ArticleLinker'

export const metadata: Metadata = { title: 'Sub-Menu Articles' }
export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export default async function SubMenuArticlesPage({ params }: Props) {
  const { id } = await params
  const subMenu = await prisma.navSubMenu.findUnique({
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
  })

  if (!subMenu) notFound()

  return (
    <ArticleLinker
      subMenuId={subMenu.id}
      subMenuTitle={subMenu.title}
      menuTitle={subMenu.menu.title}
      initialArticles={subMenu.articles.map((a) => ({
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
      }))}
    />
  )
}
