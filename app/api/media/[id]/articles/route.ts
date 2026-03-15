// app/api/media/[id]/articles/route.ts
// Returns all articles that use a specific media asset (cover image OR audio).
import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiSuccess, apiError } from '@/lib/utils'

const ARTICLE_SELECT = {
  id: true,
  title: true,
  slug: true,
  status: true,
  updatedAt: true,
} as const

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return apiError('Unauthorized', 401)

  try {
    const mediaId = parseInt((await params).id)
    if (isNaN(mediaId)) return apiError('Invalid media ID', 400)

    // Fetch asset to determine type and URL
    const asset = await prisma.mediaAsset.findUnique({
      where: { id: mediaId },
      select: { url: true, type: true },
    })
    if (!asset) return apiError('Media not found', 404)

    // Cover-image usage (FK relation)
    const coverArticles = await prisma.article.findMany({
      where: { coverImageId: mediaId },
      select: ARTICLE_SELECT,
      orderBy: { updatedAt: 'desc' },
    })

    let audioArticles: typeof coverArticles = []

    if (asset.type === 'AUDIO') {
      // Articles using this audio as top-level narration
      const narrationArticles = await prisma.article.findMany({
        where: { audioUrl: asset.url },
        select: ARTICLE_SELECT,
        orderBy: { updatedAt: 'desc' },
      })

      // Articles whose sections reference this audio
      const sectionRefs = await prisma.articleSection.findMany({
        where: { audioUrl: asset.url },
        select: { articleId: true },
        distinct: ['articleId'],
      })
      const sectionArticleIds = sectionRefs.map((s) => s.articleId)
      const sectionArticles = sectionArticleIds.length > 0
        ? await prisma.article.findMany({
            where: { id: { in: sectionArticleIds } },
            select: ARTICLE_SELECT,
            orderBy: { updatedAt: 'desc' },
          })
        : []

      // Deduplicate across both sources
      const seen = new Set<number>()
      audioArticles = [...narrationArticles, ...sectionArticles].filter((a) => {
        if (seen.has(a.id)) return false
        seen.add(a.id)
        return true
      })
    }

    // Merge cover + audio usage, deduplicated
    const seen = new Set<number>()
    const combined = [...coverArticles, ...audioArticles].filter((a) => {
      if (seen.has(a.id)) return false
      seen.add(a.id)
      return true
    })

    return apiSuccess(combined)
  } catch (err) {
    return apiError('Failed to fetch articles for media asset', 500, err)
  }
}
