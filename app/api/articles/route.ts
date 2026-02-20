// app/api/articles/route.ts
import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/slugify'
import { calculateReadingTime } from '@/lib/readingTime'
import { apiSuccess, apiError } from '@/lib/utils'
import { z } from 'zod'
import { ArticleStatus } from '@prisma/client'

const ArticleSchema = z.object({
  title: z.string().min(1).max(300),
  slug: z.string().optional(),
  summary: z.string().optional(),
  content: z.string().default(''),
  status: z.nativeEnum(ArticleStatus).optional(),
  topicIds: z.array(z.number().int()).min(1),
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
  coverImage: {
    select: { id: true, url: true, altText: true, width: true, height: true },
  },
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const session = await auth()
    const isAdmin = !!session

    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const search = searchParams.get('search') || ''
    const topicId = searchParams.get('topicId')
    const moduleId = searchParams.get('moduleId')
    const status = searchParams.get('status') as ArticleStatus | null
    const featured = searchParams.get('featured') === 'true'
    const tag = searchParams.get('tag')

    const where: Record<string, unknown> = {}

    // Non-admins only see published articles
    if (!isAdmin) {
      where.status = ArticleStatus.PUBLISHED
    } else if (status) {
      where.status = status
    }

    if (featured) where.isFeatured = true

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { summary: { contains: search } },
      ]
    }

    if (topicId) {
      where.topicArticles = { some: { topicId: parseInt(topicId) } }
    }

    if (moduleId) {
      where.topicArticles = {
        some: {
          topic: { moduleId: parseInt(moduleId) },
        },
      }
    }

    if (tag) {
      where.articleTags = { some: { tag: { slug: tag } } }
    }

    const [total, articles] = await prisma.$transaction([
      prisma.article.count({ where }),
      prisma.article.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: articleInclude,
      }),
    ])

    return apiSuccess({
      items: articles,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (err) {
    console.error('[GET /api/articles]', err)
    return apiError('Failed to fetch articles', 500)
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return apiError('Unauthorized', 401)

  try {
    const body = await req.json()
    const data = ArticleSchema.parse(body)
    const slug = data.slug || slugify(data.title)

    const existing = await prisma.article.findUnique({ where: { slug } })
    if (existing) return apiError('Slug already in use', 409)

    const readingTime = data.readingTimeMinutes ?? calculateReadingTime(data.content)
    const authorId = parseInt((session.user as { id: string }).id)

    const article = await prisma.article.create({
      data: {
        title: data.title,
        slug,
        summary: data.summary,
        content: data.content,
        status: data.status ?? ArticleStatus.DRAFT,
        isFeatured: data.isFeatured ?? false,
        coverImageId: data.coverImageId ?? undefined,
        audioUrl: data.audioUrl,
        readingTimeMinutes: readingTime,
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : undefined,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        seoCanonicalUrl: data.seoCanonicalUrl,
        ogImageUrl: data.ogImageUrl,
        authorId,
        topicArticles: {
          create: data.topicIds.map((topicId, i) => ({ topicId, orderIndex: i })),
        },
        articleTags: data.tagIds
          ? { create: data.tagIds.map((tagId) => ({ tagId })) }
          : undefined,
      },
      include: articleInclude,
    })

    return apiSuccess(article, 201)
  } catch (err) {
    if (err instanceof z.ZodError) return apiError(err.issues[0].message, 422)
    console.error('[POST /api/articles]', err)
    return apiError('Failed to create article', 500)
  }
}
