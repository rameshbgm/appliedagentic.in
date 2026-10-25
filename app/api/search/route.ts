// app/api/search/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiSuccess, apiError } from '@/lib/utils'
import { positiveInteger, searchWhere } from '@/lib/search'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const q = (searchParams.get('q') || '').trim().slice(0, 200)
    const moduleId = searchParams.get('moduleId')
    const topicId = searchParams.get('topicId')
    const page = positiveInteger(searchParams.get('page'), 1, 10000)
    const limit = positiveInteger(searchParams.get('limit'), 10, 100)

    if (!q.trim()) return apiSuccess({ items: [], total: 0, page, limit, totalPages: 0 })

    const where = searchWhere(q, positiveInteger(moduleId, 0), positiveInteger(topicId, 0))

    const [total, articles] = await prisma.$transaction([
      prisma.article.count({ where }),
      prisma.article.findMany({
        where,
        orderBy: [{ publishedAt: 'desc' }, { id: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          title: true,
          slug: true,
          summary: true,
          publishedAt: true,
          readingTimeMinutes: true,
          coverImage: { select: { url: true } },
          articleTags: {
            take: 4,
            include: { tag: { select: { name: true } } },
          },
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
