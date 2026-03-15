// app/api/ai/audio-job/route.ts
// GET  ?articleId=X  → current job status
// POST { articleId } → create / reset job, returns { total }
import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiSuccess, apiError } from '@/lib/utils'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return apiError('Unauthorized', 401)

  try {
    const articleId = parseInt(req.nextUrl.searchParams.get('articleId') ?? '')
    if (!articleId) return apiError('articleId required', 400)

    const job = await prisma.audioJob.findUnique({ where: { articleId } })
    if (!job) return apiSuccess({ status: 'idle', total: 0, completed: 0, failed: 0 })

    return apiSuccess({
      status: job.status,
      total: job.total,
      completed: job.completed,
      failed: job.failed,
    })
  } catch (err) {
    return apiError('[GET /api/ai/audio-job] ' + (err instanceof Error ? err.message : 'Unknown error'), 500, err)
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return apiError('Unauthorized', 401)

  try {
    const { articleId, sectionId } = await req.json()
    if (!articleId) return apiError('articleId required', 400)

    // When regenerating a specific section: clear its old audio first
    if (sectionId) {
      const section = await prisma.articleSection.findFirst({
        where: { id: parseInt(String(sectionId)), articleId },
        select: { audioUrl: true },
      })
      if (section?.audioUrl) {
        // Delete old MediaAsset to avoid orphaned records
        await prisma.mediaAsset.deleteMany({ where: { url: section.audioUrl } })
        // Clear section audioUrl so the process route picks it up
        await prisma.articleSection.updateMany({
          where: { id: parseInt(String(sectionId)), articleId },
          data: { audioUrl: null },
        })
      }
    }

    // Count sections that need audio — scoped to the target section when provided
    const total = await prisma.articleSection.count({
      where: {
        articleId,
        ...(sectionId ? { id: parseInt(String(sectionId)) } : {}),
        audioUrl: null,
        content: { not: '' },
      },
    })
    if (total === 0) return apiError('No sections need audio', 400)

    // Upsert — reset any previous job to pending
    const job = await prisma.audioJob.upsert({
      where: { articleId },
      create: { articleId, status: 'pending', total, completed: 0, failed: 0 },
      update: { status: 'pending', total, completed: 0, failed: 0 },
    })

    return apiSuccess({ jobId: job.id, status: job.status, total: job.total })
  } catch (err) {
    return apiError('[POST /api/ai/audio-job] ' + (err instanceof Error ? err.message : 'Unknown error'), 500, err)
  }
}
