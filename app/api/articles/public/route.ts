// app/api/articles/public/route.ts
// Public endpoint for fetching published articles — used by the infinite scroll loader
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const offset = Math.max(0, parseInt(searchParams.get('offset') ?? '0'))
    const limit  = Math.min(100, Math.max(1, parseInt(searchParams.get('limit')  ?? '50')))
    const tag    = searchParams.get('tag') ?? ''

    const where = {
      status: 'PUBLISHED' as const,
      ...(tag ? { articleTags: { some: { tag: { name: tag } } } } : {}),
    }

    const [articles, totalCount] = await Promise.all([
      prisma.article.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
        select: {
          id: true,
          title: true,
          slug: true,
          summary: true,
          readingTimeMinutes: true,
          viewCount: true,
          createdAt: true,
          publishedAt: true,
          articleTags: { include: { tag: { select: { name: true } } } },
          topicArticles: {
            take: 1,
            include: {
              topic: { select: { module: { select: { name: true, color: true } } } },
            },
          },
        },
      }),
      prisma.article.count({ where }),
    ])

    return NextResponse.json({
      articles,
      totalCount,
      hasMore: offset + articles.length < totalCount,
    })
  } catch (err) {
    logger.error('[GET /api/articles/public]', err)
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 })
  }
}
