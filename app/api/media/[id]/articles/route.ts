// app/api/media/[id]/articles/route.ts
// Returns articles that use a specific media asset as their cover image.
import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiSuccess, apiError } from '@/lib/utils'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return apiError('Unauthorized', 401)

  try {
    const mediaId = parseInt((await params).id)
    if (isNaN(mediaId)) return apiError('Invalid media ID', 400)

    const articles = await prisma.article.findMany({
      where: { coverImageId: mediaId },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
    })

    return apiSuccess(articles)
  } catch (err) {
    return apiError('Failed to fetch articles for media asset', 500, err)
  }
}
