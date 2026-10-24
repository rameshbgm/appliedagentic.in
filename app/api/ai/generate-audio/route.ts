// app/api/ai/generate-audio/route.ts
import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { openaiTextToSpeech } from '@/lib/openai-tts'
import { concatenateWav } from '@/lib/audio'
import { prisma } from '@/lib/prisma'
import { prepareAsset } from '@/lib/storage'
import { apiSuccess, apiError } from '@/lib/utils'
import { runAudioNarrator, ttsConfig } from '@/agents/audio-narrator/agent'
import { geminiTextToSpeech, isGeminiVoice, GEMINI_TTS_MODEL } from '@/lib/gemini-tts'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return apiError('Unauthorized', 401)

  try {
    const body = await req.json()
    const {
      text,
      voice,
      articleId,
      sectionId,
      preprocessMarkdown = false,
    } = body

    if (!text || text.trim().length === 0) return apiError('Text is required', 422)

    const selectedVoice: string = voice || ttsConfig.voice
    const useGemini = isGeminiVoice(selectedVoice)
    const userId = parseInt((session.user as { id: string }).id)

    // ── Prepare text: clean Markdown → TTS-ready prose + safe chunks ─────
    let chunks: string[]
    if (preprocessMarkdown) {
      const narratorResult = await runAudioNarrator({ prompt: text })
      chunks = narratorResult.chunks
    } else {
      if (text.length > 4096) return apiError('Text exceeds 4096 character limit. Enable preprocessMarkdown to handle longer articles.', 422)
      chunks = [text]
    }

    // Both providers produce PCM WAV; merge sample data under one header.
    const audioBuffers: Buffer[] = []
    for (const chunk of chunks) {
      audioBuffers.push(useGemini
        ? await geminiTextToSpeech(chunk, selectedVoice)
        : await openaiTextToSpeech(chunk, selectedVoice))
    }
    const combinedBuffer = concatenateWav(audioBuffers)
    const mimeType = 'audio/wav'
    const { url, filename } = prepareAsset({ mimeType, subDir: 'audio' })

    // Save binary to DB (MediaAsset)
    const asset = await prisma.mediaAsset.create({
      data: {
        filename,
        url,
        data: new Uint8Array(combinedBuffer) as Uint8Array<ArrayBuffer>,
        type: 'AUDIO',
        mimeType,
        aiPrompt: text.slice(0, 200),
        sizeBytes: combinedBuffer.length,
        createdByUserId: userId,
      },
    })

    // Link audio to section or article
    if (sectionId) {
      await prisma.articleSection.updateMany({
        where: { id: parseInt(sectionId), ...(articleId ? { articleId: parseInt(articleId) } : {}) },
        data: { audioUrl: url },
      })
    } else if (articleId) {
      await prisma.article.update({
        where: { id: parseInt(articleId) },
        data: { audioUrl: url },
      }).catch(() => {})
    }

    // Log usage
    prisma.aIUsageLog.create({
      data: {
        userId,
        articleId: articleId ? parseInt(articleId) : null,
        type: 'AUDIO_GENERATION',
        model: useGemini ? GEMINI_TTS_MODEL : ttsConfig.openaiModel,
        promptSnippet: text.slice(0, 200),
        status: 'success',
      },
    }).catch(() => {})

    return apiSuccess({ url, audioUrl: url, mediaAssetId: asset.id, chunks: chunks.length })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'AI audio generation failed'
    return apiError(`[POST /api/ai/generate-audio] ${message}`, 500, err)
  }
}
