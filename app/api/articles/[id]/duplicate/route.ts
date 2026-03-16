// app/api/articles/[id]/duplicate/route.ts
import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiSuccess, apiError } from '@/lib/utils'
import { invalidateCache } from '@/lib/cache'
import { ArticleStatus } from '@prisma/client'
import { nanoid } from 'nanoid'

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return apiError('Unauthorized', 401)

  try {
    const id = parseInt((await params).id, 10)
    if (isNaN(id)) return apiError('Invalid article ID', 400)

    const source = await prisma.article.findUnique({
      where: { id },
      include: {
        topicArticles: { select: { topicId: true, orderIndex: true } },
        articleTags: { select: { tagId: true } },
        subMenuArticles: { select: { subMenuId: true, orderIndex: true } },
        menuArticles: { select: { menuId: true, orderIndex: true } },
        sections: { select: { title: true, content: true, order: true }, orderBy: { order: 'asc' } },
      },
    })

    if (!source) return apiError('Article not found', 404)

    const newSlug = `${source.slug}-copy-${nanoid(4)}`
    const authorId = parseInt((session.user as { id: string }).id)

    const duplicate = await prisma.article.create({
      data: {
        title: `${source.title} (Copy)`,
        slug: newSlug,
        summary: source.summary,
        content: source.content,
        status: ArticleStatus.DRAFT,
        readingTimeMinutes: source.readingTimeMinutes,
        isFeatured: false,
        coverImageId: source.coverImageId,
        seoTitle: source.seoTitle,
        seoDescription: source.seoDescription,
        seoKeywords: source.seoKeywords,
        ogTitle: source.ogTitle,
        ogDescription: source.ogDescription,
        twitterTitle: source.twitterTitle,
        twitterDescription: source.twitterDescription,
        aiContentDeclaration: source.aiContentDeclaration,
        authorId,
        topicArticles: {
          create: source.topicArticles.map((ta) => ({ topicId: ta.topicId, orderIndex: ta.orderIndex })),
        },
        articleTags: {
          create: source.articleTags.map((at) => ({ tagId: at.tagId })),
        },
        subMenuArticles: {
          create: source.subMenuArticles.map((sma) => ({ subMenuId: sma.subMenuId, orderIndex: sma.orderIndex })),
        },
        menuArticles: {
          create: source.menuArticles.map((ma) => ({ menuId: ma.menuId, orderIndex: ma.orderIndex })),
        },
        sections: {
          create: source.sections.map((s) => ({ title: s.title, content: s.content, order: s.order })),
        },
      },
      select: { id: true, slug: true, title: true, status: true },
    })

    invalidateCache('articles', 'articles-list')

    return apiSuccess(duplicate, 201)
  } catch (err) {
    return apiError('Failed to duplicate article', 500, err)
  }
}
