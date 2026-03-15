// app/api/ai/generate-audio/route.ts
import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { getOpenAIClient } from '@/lib/openai'
import { prisma } from '@/lib/prisma'
import { prepareAsset } from '@/lib/storage'
import { apiSuccess, apiError } from '@/lib/utils'
import { runAudioNarrator, ttsConfig } from '@/agents/audio-narrator/agent'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return apiError('Unauthorized', 401)

  try {
    const body = await req.json()
    const {
      text,
      voice,
      speed,
      model: reqModel,
      articleId,
      sectionId,
      preprocessMarkdown = false, // if true, run through audio-narrator agent first
    } = body

    if (!text || text.trim().length === 0) return apiError('Text is required', 422)

    const openai = getOpenAIClient()
    const ttsModel = reqModel || ttsConfig.model
    const ttsVoice = (voice || ttsConfig.voice) as typeof ttsConfig.voice
    const ttsSpeed = speed ?? 1.0
    const userId = parseInt((session.user as { id: string }).id)

    // ── Prepare text for TTS ──────────────────────────────────────────────
    let chunks: string[]

    if (preprocessMarkdown) {
      // Use the LangChain audio-narrator agent to:
      // 1. Clean Markdown → TTS-ready prose
      // 2. Split into safe ≤ 3800-char chunks at sentence boundaries
      const narratorResult = await runAudioNarrator({ prompt: text })
      chunks = narratorResult.chunks
    } else {
      // Legacy path: single text, enforce 4096-char limit
      if (text.length > 4096) return apiError('Text exceeds 4096 character limit. Enable preprocessMarkdown to handle longer articles.', 422)
      chunks = [text]
    }

    // ── Synthesise each chunk via OpenAI TTS ─────────────────────────────
    const audioBuffers: Buffer[] = []
    for (const chunk of chunks) {
      const mp3Response = await openai.audio.speech.create({
        model: ttsModel,
        voice: ttsVoice,
        input: chunk,
        speed: ttsSpeed,
      })
      const arrayBuffer = await mp3Response.arrayBuffer()
      audioBuffers.push(Buffer.from(arrayBuffer))
    }

    // Concatenate all buffers into one MP3
    const combinedBuffer = Buffer.concat(audioBuffers)
    const { url, filename } = prepareAsset({ mimeType: 'audio/mpeg', subDir: 'audio' })

    // Save to MediaAsset — binary stored in DB
    const asset = await prisma.mediaAsset.create({
      data: {
        filename,
        url,
        data: new Uint8Array(combinedBuffer) as Uint8Array<ArrayBuffer>,
        type: 'AUDIO',
        mimeType: 'audio/mpeg',
        aiPrompt: text.slice(0, 200),
        sizeBytes: combinedBuffer.length,
        createdByUserId: userId,
      },
    })

    // If sectionId provided, update section audioUrl; otherwise fall back to article audioUrl
    if (sectionId) {
      await prisma.articleSection.update({
        where: { id: parseInt(sectionId) },
        data: { audioUrl: url },
      }).catch(() => {})
    } else if (articleId) {
      await prisma.article.update({
        where: { id: parseInt(articleId) },
        data: { audioUrl: url },
      }).catch(() => {})
    }

    // Log usage
    await prisma.aIUsageLog.create({
      data: {
        userId,
        articleId: articleId ? parseInt(articleId) : null,
        type: 'AUDIO_GENERATION',
        model: ttsModel,
        promptSnippet: text.slice(0, 200),
        status: 'success',
      },
    }).catch(() => {})

    return apiSuccess({ url, mediaAssetId: asset.id, chunks: chunks.length })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'AI audio generation failed'
    return apiError(`[POST /api/ai/generate-audio] ${message}`, 500, err)
  }
}
