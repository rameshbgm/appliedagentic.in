// app/api/articles/[id]/duplicate/route.ts
import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiSuccess, apiError } from '@/lib/utils'
import { ArticleStatus } from '@prisma/client'
import { nanoid } from 'nanoid'

export async function POST(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return apiError('Unauthorized', 401)

  try {
    const id = parseInt(params.id)
    const source = await prisma.article.findUnique({
      where: { id },
      include: {
        topicArticles: true,
        articleTags: true,
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
        seoTitle: source.seoTitle,
        seoDescription: source.seoDescription,
        authorId,
        topicArticles: {
          create: source.topicArticles.map((ta) => ({ topicId: ta.topicId, orderIndex: ta.orderIndex })),
        },
        articleTags: {
          create: source.articleTags.map((at) => ({ tagId: at.tagId })),
        },
      },
    })

    return apiSuccess(duplicate, 201)
  } catch (err) {
    return apiError('Failed to duplicate article', 500)
  }
}
