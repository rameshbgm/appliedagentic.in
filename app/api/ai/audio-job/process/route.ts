// app/api/ai/audio-job/process/route.ts
// Fire-and-forget: processes all missing-audio sections for an article.
// Continues running on the server even after the browser closes (keepalive fetch).
import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { getOpenAIClient } from '@/lib/openai'
import { prisma } from '@/lib/prisma'
import { prepareAsset } from '@/lib/storage'
import { apiSuccess, apiError } from '@/lib/utils'
import { runAudioNarrator, ttsConfig } from '@/agents/audio-narrator/agent'

// Allow up to 5 min on Vercel Pro / self-hosted
export const maxDuration = 300

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return apiError('Unauthorized', 401)

  try {
    const body = await req.json()
    // Always coerce to number — JSON can preserve type but we want to be certain
    const articleId = parseInt(String(body.articleId), 10)
    if (!articleId || isNaN(articleId)) return apiError('articleId required', 400)

    const userId = parseInt((session.user as { id: string }).id)

    // Idempotency: if already running, do nothing
    const job = await prisma.audioJob.findUnique({ where: { articleId } })
    if (!job) return apiError('Job not found — call POST /api/ai/audio-job first', 404)
    if (job.status === 'running') return apiSuccess({ message: 'Already running' })
    if (job.status === 'done') return apiSuccess({ message: 'Already done' })

    // Atomically claim the job
    await prisma.audioJob.update({
      where: { articleId },
      data: { status: 'running' },
    })

    // Re-count and fetch fresh — use the same filter as the job creation route
    const sections = await prisma.articleSection.findMany({
      where: { articleId, audioUrl: null, content: { not: '' } },
      orderBy: { order: 'asc' },
      select: { id: true, content: true, order: true, title: true },
    })

    // Update total to reflect actual count (may differ if sections were added/removed)
    await prisma.audioJob.update({
      where: { articleId },
      data: { total: sections.length, completed: 0, failed: 0 },
    })

    const openai = getOpenAIClient()
    let completed = 0
    let failed = 0

    for (const section of sections) {
      if (!section.content?.trim()) {
        failed++
        await prisma.audioJob.update({ where: { articleId }, data: { completed, failed } })
        continue
      }

      try {
        // Clean markdown → TTS-ready prose, split into safe chunks
        const narratorResult = await runAudioNarrator({ prompt: section.content })

        const audioBuffers: Buffer[] = []
        for (const chunk of narratorResult.chunks) {
          const mp3 = await openai.audio.speech.create({
            model: ttsConfig.model,
            voice: ttsConfig.voice,
            input: chunk,
            speed: 1.0,
          })
          audioBuffers.push(Buffer.from(await mp3.arrayBuffer()))
        }

        const combined = Buffer.concat(audioBuffers)
        const { url, filename } = prepareAsset({ mimeType: 'audio/mpeg', subDir: 'audio' })

        // Save binary to DB
        await prisma.mediaAsset.create({
          data: {
            filename,
            url,
            data: new Uint8Array(combined) as Uint8Array<ArrayBuffer>,
            type: 'AUDIO',
            mimeType: 'audio/mpeg',
            aiPrompt: section.content.slice(0, 200),
            sizeBytes: combined.length,
            createdByUserId: userId,
          },
        })

        // Use updateMany — never throws P2025 if the section was concurrently deleted
        await prisma.articleSection.updateMany({
          where: { id: section.id, articleId },
          data: { audioUrl: url },
        })

        // Log usage
        await prisma.aIUsageLog.create({
          data: {
            userId,
            articleId,
            type: 'AUDIO_GENERATION',
            model: ttsConfig.model,
            promptSnippet: section.content.slice(0, 200),
            status: 'success',
          },
        }).catch(() => {})

        completed++
      } catch {
        failed++
      }

      // Update progress after every section
      await prisma.audioJob.update({ where: { articleId }, data: { completed, failed } })
    }

    const finalStatus = sections.length === 0 ? 'done' : completed === 0 ? 'error' : 'done'
    await prisma.audioJob.update({ where: { articleId }, data: { status: finalStatus } })

    return apiSuccess({ completed, failed })
  } catch (err) {
    return apiError('[POST /api/ai/audio-job/process] ' + (err instanceof Error ? err.message : 'Unknown error'), 500, err)
  }
}
