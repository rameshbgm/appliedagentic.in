// app/api/analytics/route.ts
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiSuccess, apiError } from '@/lib/utils'
import { ArticleStatus } from '@prisma/client'

export async function GET() {
  const session = await auth()
  if (!session) return apiError('Unauthorized', 401)

  try {
    const [
      totalModules, totalTopics, publishedArticles, draftArticles, totalMedia,
      aiUsage, totalMenus, totalSubMenus, recentArticles, aiLogs,
    ] = await prisma.$transaction([
      prisma.module.count(),
      prisma.topic.count(),
      prisma.article.count({ where: { status: ArticleStatus.PUBLISHED } }),
      prisma.article.count({ where: { status: ArticleStatus.DRAFT } }),
      prisma.mediaAsset.count(),
      prisma.aIUsageLog.count(),
      prisma.navMenu.count(),
      prisma.navSubMenu.count(),
      prisma.article.findMany({
        orderBy: { updatedAt: 'desc' },
        take: 10,
        select: {
          id: true, title: true, slug: true, status: true,
          updatedAt: true, viewCount: true,
          topicArticles: {
            take: 1,
            select: {
              topic: { select: { name: true, slug: true, color: true } },
            },
          },
        },
      }),
      prisma.aIUsageLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { article: { select: { id: true, title: true } } },
      }),
    ])

    return apiSuccess({
      stats: {
        totalModules,
        totalTopics,
        publishedArticles,
        draftArticles,
        totalMedia,
        aiUsage,
        totalMenus,
        totalSubMenus,
      },
      recentArticles,
      aiLogs,
    })
  } catch (err) {
    return apiError('Failed to fetch analytics', 500, err)
  }
}
