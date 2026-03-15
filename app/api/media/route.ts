// app/api/media/route.ts
import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiSuccess, apiError } from '@/lib/utils'
import { MediaType } from '@prisma/client'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return apiError('Unauthorized', 401)

  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') as MediaType | null
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: Record<string, unknown> = {}
    if (type) where.type = type
    if (search) where.filename = { contains: search }

    const [total, assets] = await prisma.$transaction([
      prisma.mediaAsset.count({ where }),
      prisma.mediaAsset.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        // Never return the binary blob — only metadata
        select: {
          id: true, filename: true, url: true, type: true, mimeType: true,
          altText: true, caption: true, width: true, height: true, sizeBytes: true,
          aiPrompt: true, createdByUserId: true, createdAt: true,
          _count: { select: { articles: true } },
        },
      }),
    ])

    // For audio assets, _count.articles is always 0 (no FK relation).
    // Compute usage by matching Article.audioUrl and ArticleSection.audioUrl.
    const audioAssets = assets.filter((a) => a.type === 'AUDIO')
    const audioUsageCounts: Record<number, number> = {}

    if (audioAssets.length > 0) {
      const audioUrls = audioAssets.map((a) => a.url)

      const [articleNarrations, sectionUsages] = await Promise.all([
        // Articles using this audio as the top-level narration
        prisma.article.groupBy({
          by: ['audioUrl'],
          where: { audioUrl: { in: audioUrls } },
          _count: { _all: true },
        }),
        // Sections using this audio — get distinct articleIds per URL
        prisma.articleSection.findMany({
          where: { audioUrl: { in: audioUrls } },
          select: { audioUrl: true, articleId: true },
          distinct: ['audioUrl', 'articleId'],
        }),
      ])

      const urlCount: Record<string, number> = {}
      for (const r of articleNarrations) {
        if (r.audioUrl) urlCount[r.audioUrl] = (urlCount[r.audioUrl] ?? 0) + r._count._all
      }
      // Count distinct articles per URL coming from sections
      const sectionArticleMap: Record<string, Set<number>> = {}
      for (const s of sectionUsages) {
        if (!s.audioUrl) continue
        if (!sectionArticleMap[s.audioUrl]) sectionArticleMap[s.audioUrl] = new Set()
        sectionArticleMap[s.audioUrl].add(s.articleId)
      }
      for (const [url, ids] of Object.entries(sectionArticleMap)) {
        urlCount[url] = (urlCount[url] ?? 0) + ids.size
      }

      for (const asset of audioAssets) {
        audioUsageCounts[asset.id] = urlCount[asset.url] ?? 0
      }
    }

    const items = assets.map((a) => ({
      ...a,
      audioUsageCount: audioUsageCounts[a.id] ?? 0,
    }))

    return apiSuccess({ items, total, page, limit, totalPages: Math.ceil(total / limit) })
  } catch (err) {
    return apiError('Failed to fetch media', 500, err)
  }
}
