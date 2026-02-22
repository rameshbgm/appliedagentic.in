// app/(admin)/articles/[id]/edit/page.tsx
export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ArticleEditorPage from '../../ArticleEditorPage'

export const metadata: Metadata = { title: 'Edit Article' }

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const articleId = Number(id)

  const [article, menus, tags, subMenuLinks] = await Promise.all([
    prisma.article.findUnique({
      where: { id: articleId },
      include: {
        articleTags: { include: { tag: true } },
        coverImage: { select: { url: true } },
      },
    }),
    prisma.navMenu.findMany({
      orderBy: { order: 'asc' },
      select: {
        id: true,
        title: true,
        subMenus: { orderBy: { order: 'asc' }, select: { id: true, title: true, menuId: true } },
      },
    }),
    prisma.tag.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
    prisma.subMenuArticle.findMany({
      where: { articleId },
      select: { subMenuId: true, subMenu: { select: { menuId: true } } },
    }),
  ])

  if (!article) notFound()

  const subMenuIds = subMenuLinks.map((s) => s.subMenuId)
  const navMenuId = subMenuLinks[0]?.subMenu?.menuId

  return (
    <ArticleEditorPage
      initialArticle={{
        id: article.id,
        title: article.title,
        slug: article.slug,
        summary: article.summary ?? '',
        content: article.content,
        status: article.status,
        scheduledAt: article.scheduledAt?.toISOString().slice(0, 16),
        coverImageUrl: article.coverImage?.url ?? '',
        seoTitle: article.seoTitle ?? '',
        seoDescription: article.seoDescription ?? '',
        audioUrl: article.audioUrl ?? undefined,
        tagNames: article.articleTags.map((at) => at.tag.name),
        subMenuIds,
        navMenuId,
      }}
      menus={menus}
      allTags={tags}
    />
  )
}
