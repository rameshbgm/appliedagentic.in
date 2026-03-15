// app/api/media/cleanup/route.ts
// GET  — returns a preview of all unused media assets (no deletion yet)
// POST — deletes all unused media assets and returns a summary report
import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiSuccess, apiError } from '@/lib/utils'

interface UnusedAsset {
  id: number
  filename: string
  url: string
  type: string
  mimeType: string | null
  sizeBytes: number | null
  createdAt: Date
}

/** Fetch every media asset that has no usage anywhere. */
async function findUnusedAssets(): Promise<UnusedAsset[]> {
  // 1. All assets
  const all = await prisma.mediaAsset.findMany({
    select: {
      id: true, filename: true, url: true, type: true,
      mimeType: true, sizeBytes: true, createdAt: true,
      _count: { select: { articles: true } },
    },
  })

  // 2. URLs used as audioUrl in articles or sections
  const [articleAudioUrls, sectionAudioUrls] = await Promise.all([
    prisma.article.findMany({
      where: { audioUrl: { not: null } },
      select: { audioUrl: true },
    }),
    prisma.articleSection.findMany({
      where: { audioUrl: { not: null } },
      select: { audioUrl: true },
    }),
  ])

  const usedAudioUrls = new Set<string>([
    ...articleAudioUrls.map((a) => a.audioUrl!),
    ...sectionAudioUrls.map((s) => s.audioUrl!),
  ])

  // 3. Filter: no cover-image FK usage AND no audio URL usage
  return all
    .filter((a) => a._count.articles === 0 && !usedAudioUrls.has(a.url))
    .map(({ _count: _c, ...rest }) => rest)
}

/** GET — dry-run: preview which assets would be deleted */
export async function GET(_: NextRequest) {
  const session = await auth()
  if (!session) return apiError('Unauthorized', 401)

  try {
    const unused = await findUnusedAssets()
    const totalBytes = unused.reduce((s, a) => s + (a.sizeBytes ?? 0), 0)
    return apiSuccess({ count: unused.length, totalBytes, items: unused })
  } catch (err) {
    return apiError('Failed to scan for unused media', 500, err)
  }
}

/** POST — delete all unused assets and return a report */
export async function POST(_: NextRequest) {
  const session = await auth()
  if (!session) return apiError('Unauthorized', 401)

  try {
    const unused = await findUnusedAssets()
    if (unused.length === 0) {
      return apiSuccess({ deleted: 0, freedBytes: 0, ids: [] })
    }

    const ids = unused.map((a) => a.id)
    const freedBytes = unused.reduce((s, a) => s + (a.sizeBytes ?? 0), 0)

    await prisma.mediaAsset.deleteMany({ where: { id: { in: ids } } })

    return apiSuccess({ deleted: ids.length, freedBytes, ids })
  } catch (err) {
    return apiError('Failed to clean up unused media', 500, err)
  }
}
