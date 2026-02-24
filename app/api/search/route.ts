// app/api/search/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiSuccess, apiError } from '@/lib/utils'
import { ArticleStatus } from '@prisma/client'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q') || ''
    const moduleId = searchParams.get('moduleId')
    const topicId = searchParams.get('topicId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!q.trim()) return apiSuccess({ items: [], total: 0, page, limit, totalPages: 0 })

    const where: Record<string, unknown> = {
      status: ArticleStatus.PUBLISHED,
      OR: [
        { title: { contains: q } },
        { summary: { contains: q } },
        { content: { contains: q } },
      ],
    }

    if (topicId) {
      where.topicArticles = { some: { topicId: parseInt(topicId) } }
    } else if (moduleId) {
      where.topicArticles = { some: { topic: { moduleId: parseInt(moduleId) } } }
    }

    const [total, articles] = await prisma.$transaction([
      prisma.article.count({ where }),
      prisma.article.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          title: true,
          slug: true,
          summary: true,
          publishedAt: true,
          readingTimeMinutes: true,
          topicArticles: {
            take: 1,
            include: {
              topic: { select: { name: true, slug: true, color: true } },
            },
          },
        },
      }),
    ])

    return apiSuccess({ items: articles, total, page, limit, totalPages: Math.ceil(total / limit) })
  } catch (err) {
    return apiError('Search failed', 500, err)
  }
}
