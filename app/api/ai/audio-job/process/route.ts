// app/api/ai/audio-job/process/route.ts
// Fire-and-forget: processes all missing-audio sections for an article.
// Continues running on the server even after the browser closes (keepalive fetch).
import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { getOpenAIClient } from '@/lib/openai'
import { prisma } from '@/lib/prisma'
import { prepareAsset } from '@/lib/storage'
import { apiSuccess, apiError } from '@/lib/utils'
import { logger } from '@/lib/logger'
import { runAudioNarrator, ttsConfig } from '@/agents/audio-narrator/agent'
import { geminiTextToSpeech, isGeminiVoice, GEMINI_TTS_MODEL } from '@/lib/gemini-tts'

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
    const voice: string = typeof body.voice === 'string' && body.voice ? body.voice : ttsConfig.voice
    const sectionId: number | null = body.sectionId ? parseInt(String(body.sectionId), 10) : null

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

    // Re-count and fetch fresh — scoped to a single section when sectionId is provided
    const sections = await prisma.articleSection.findMany({
      where: {
        articleId,
        ...(sectionId ? { id: sectionId } : {}),
        audioUrl: null,
        content: { not: '' },
      },
      orderBy: { order: 'asc' },
      select: { id: true, content: true, order: true, title: true },
    })

    // Update total to reflect actual count (may differ if sections were added/removed)
    await prisma.audioJob.update({
      where: { articleId },
      data: { total: sections.length, completed: 0, failed: 0 },
    })

    // Determine provider from voice name — Gemini voices are Title-cased
    const useGemini = isGeminiVoice(voice)
    const ttsModel = useGemini ? GEMINI_TTS_MODEL : ttsConfig.openaiModel
    const openai = useGemini ? null : getOpenAIClient()

    logger.info(`[audio-job] articleId=${articleId} voice="${voice}" provider=${useGemini ? 'gemini' : 'openai'} sections=${sections.length}`)

    let completed = 0
    let failed = 0
    let sectionsSinceLastProgressUpdate = 0
    const PROGRESS_UPDATE_EVERY = 3 // write progress to DB every N sections to reduce connections

    for (const section of sections) {
      if (!section.content?.trim()) {
        failed++
        sectionsSinceLastProgressUpdate++
      } else {
        try {
          // Step 1: Clean markdown → TTS-ready prose via LangChain/Gemini LLM
          const narratorResult = await runAudioNarrator({ prompt: section.content })

          // Step 2: Synthesise audio — Gemini TTS or OpenAI TTS
          let combined: Buffer
          let mimeType: string

          if (useGemini) {
            // Gemini TTS: returns a WAV buffer directly (PCM wrapped in RIFF header)
            const wavBuffers: Buffer[] = []
            for (const chunk of narratorResult.chunks) {
              wavBuffers.push(await geminiTextToSpeech(chunk, voice))
            }
            combined = Buffer.concat(wavBuffers)
            mimeType = 'audio/wav'
          } else {
            // OpenAI TTS: returns MP3
            const mp3Buffers: Buffer[] = []
            for (const chunk of narratorResult.chunks) {
              const mp3 = await openai!.audio.speech.create({
                model: ttsConfig.openaiModel,
                voice: voice as 'alloy' | 'ash' | 'ballad' | 'coral' | 'echo' | 'fable' | 'nova' | 'onyx' | 'sage' | 'shimmer' | 'verse',
                input: chunk,
                speed: 1.0,
              })
              mp3Buffers.push(Buffer.from(await mp3.arrayBuffer()))
            }
            combined = Buffer.concat(mp3Buffers)
            mimeType = 'audio/mpeg'
          }

          const { url, filename } = prepareAsset({ mimeType, subDir: 'audio' })

          // Save binary to DB
          await prisma.mediaAsset.create({
            data: {
              filename,
              url,
              data: new Uint8Array(combined) as Uint8Array<ArrayBuffer>,
              type: 'AUDIO',
              mimeType,
              aiPrompt: section.content.slice(0, 200),
              sizeBytes: combined.length,
              createdByUserId: userId,
            },
          })

          // Use updateMany — never throws P2025 if section was concurrently deleted
          await prisma.articleSection.updateMany({
            where: { id: section.id, articleId },
            data: { audioUrl: url },
          })

          // Fire-and-forget usage log — don't hold a connection for this
          prisma.aIUsageLog.create({
            data: {
              userId,
              articleId,
              type: 'AUDIO_GENERATION',
              model: ttsModel,
              promptSnippet: section.content.slice(0, 200),
              status: 'success',
            },
          }).catch(() => {})

          completed++
          sectionsSinceLastProgressUpdate++
        } catch (err) {
          failed++
          sectionsSinceLastProgressUpdate++
          // Log the actual error so failures are debuggable in server logs
          logger.error(
            `[audio-job] section id=${section.id} order=${section.order} failed`,
            err,
            { articleId, voice, sectionTitle: section.title }
          )
        }
      }

      // Write progress every PROGRESS_UPDATE_EVERY sections to reduce DB connections
      if (sectionsSinceLastProgressUpdate >= PROGRESS_UPDATE_EVERY) {
        await prisma.audioJob.update({ where: { articleId }, data: { completed, failed } })
        sectionsSinceLastProgressUpdate = 0
      }
    }

    // Final progress flush
    if (sectionsSinceLastProgressUpdate > 0) {
      await prisma.audioJob.update({ where: { articleId }, data: { completed, failed } })
    }

    const finalStatus = sections.length === 0 ? 'done' : completed === 0 ? 'error' : 'done'
    await prisma.audioJob.update({ where: { articleId }, data: { status: finalStatus } })

    logger.info(`[audio-job] done articleId=${articleId} completed=${completed} failed=${failed}`)
    return apiSuccess({ completed, failed })
  } catch (err) {
    return apiError('[POST /api/ai/audio-job/process] ' + (err instanceof Error ? err.message : 'Unknown error'), 500, err)
  }
}
