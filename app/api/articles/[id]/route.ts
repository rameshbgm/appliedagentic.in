// app/api/articles/[id]/route.ts
import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/slugify'
import { calculateReadingTime } from '@/lib/readingTime'
import { apiSuccess, apiError } from '@/lib/utils'
import { z } from 'zod'
import { ArticleStatus } from '@prisma/client'

const UpdateSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  slug: z.string().optional(),
  summary: z.string().optional(),
  content: z.string().optional(),
  status: z.nativeEnum(ArticleStatus).optional(),
  topicIds: z.array(z.number().int()).optional(),
  tagIds: z.array(z.number().int()).optional(),
  coverImageId: z.number().int().optional().nullable(),
  readingTimeMinutes: z.number().int().optional().nullable(),
  isFeatured: z.boolean().optional(),
  publishedAt: z.string().optional().nullable(),
  scheduledAt: z.string().optional().nullable(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoCanonicalUrl: z.string().optional(),
  ogImageUrl: z.string().optional(),
  audioUrl: z.string().optional().nullable(),
})

const articleInclude = {
  author: { select: { id: true, name: true, email: true } },
  topicArticles: {
    include: {
      topic: {
        include: {
          module: { select: { id: true, name: true, slug: true, color: true, order: true, icon: true } },
        },
      },
    },
    orderBy: { orderIndex: 'asc' as const },
  },
  articleTags: { include: { tag: true } },
  coverImage: { select: { id: true, url: true, altText: true, width: true, height: true } },
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = parseInt((await params).id)
    const session = await auth()

    const article = await prisma.article.findFirst({
      where: {
        id,
        ...(!session ? { status: ArticleStatus.PUBLISHED } : {}),
      },
      include: articleInclude,
    })

    if (!article) return apiError('Article not found', 404)

    // Increment view count for published articles on public access
    if (!session && article.status === ArticleStatus.PUBLISHED) {
      await prisma.article.update({
        where: { id },
        data: { viewCount: { increment: 1 } },
      })
    }

    return apiSuccess(article)
  } catch (err) {
    return apiError('Failed to fetch article', 500)
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return apiError('Unauthorized', 401)

  try {
    const id = parseInt((await params).id)
    const body = await req.json()
    const data = UpdateSchema.parse(body)

    if (data.title && !data.slug) data.slug = slugify(data.title)

    // Check slug uniqueness if changing
    if (data.slug) {
      const existing = await prisma.article.findFirst({
        where: { slug: data.slug, NOT: { id } },
      })
      if (existing) return apiError('Slug already in use', 409)
    }

    const readingTime = data.content
      ? (data.readingTimeMinutes ?? calculateReadingTime(data.content))
      : data.readingTimeMinutes

    const article = await prisma.$transaction(async (tx) => {
      // Update topic relationships if provided
      if (data.topicIds !== undefined) {
        await tx.topicArticle.deleteMany({ where: { articleId: id } })
        await tx.topicArticle.createMany({
          data: data.topicIds.map((topicId, i) => ({ topicId, articleId: id, orderIndex: i })),
        })
      }

      // Update tag relationships if provided
      if (data.tagIds !== undefined) {
        await tx.articleTag.deleteMany({ where: { articleId: id } })
        if (data.tagIds.length > 0) {
          await tx.articleTag.createMany({
            data: data.tagIds.map((tagId) => ({ articleId: id, tagId })),
          })
        }
      }

      return tx.article.update({
        where: { id },
        data: {
          ...(data.title && { title: data.title }),
          ...(data.slug && { slug: data.slug }),
          ...(data.summary !== undefined && { summary: data.summary }),
          ...(data.content !== undefined && { content: data.content }),
          ...(data.status !== undefined && { status: data.status }),
          ...(data.isFeatured !== undefined && { isFeatured: data.isFeatured }),
          ...(data.coverImageId !== undefined && { coverImageId: data.coverImageId }),
          ...(data.audioUrl !== undefined && { audioUrl: data.audioUrl }),
          ...(readingTime !== undefined && { readingTimeMinutes: readingTime }),
          ...(data.publishedAt !== undefined && { publishedAt: data.publishedAt ? new Date(data.publishedAt) : null }),
          ...(data.scheduledAt !== undefined && { scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null }),
          ...(data.seoTitle !== undefined && { seoTitle: data.seoTitle }),
          ...(data.seoDescription !== undefined && { seoDescription: data.seoDescription }),
          ...(data.seoCanonicalUrl !== undefined && { seoCanonicalUrl: data.seoCanonicalUrl }),
          ...(data.ogImageUrl !== undefined && { ogImageUrl: data.ogImageUrl }),
          updatedBy: parseInt((session.user as { id: string }).id),
        },
        include: articleInclude,
      })
    })

    return apiSuccess(article)
  } catch (err) {
    if (err instanceof z.ZodError) return apiError(err.issues[0].message, 422)
    console.error('[PUT /api/articles/[id]]', err)
    return apiError('Failed to update article', 500)
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return apiError('Unauthorized', 401)
  try {
    await prisma.article.delete({ where: { id: parseInt((await params).id) } })
    return apiSuccess({ deleted: true })
  } catch (err) {
    return apiError('Failed to delete article', 500)
  }
}
