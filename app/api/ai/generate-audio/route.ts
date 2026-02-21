// app/api/ai/generate-audio/route.ts
import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { getOpenAIClient, getAIConfig } from '@/lib/openai'
import { prisma } from '@/lib/prisma'
import { saveFile } from '@/lib/storage'
import { apiSuccess, apiError } from '@/lib/utils'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return apiError('Unauthorized', 401)

  try {
    const body = await req.json()
    const { text, voice, speed, model: reqModel, articleId } = body

    if (!text || text.trim().length === 0) return apiError('Text is required', 422)
    if (text.length > 4096) return apiError('Text exceeds 4096 character limit for TTS', 422)

    const config = await getAIConfig()
    const openai = getOpenAIClient()

    const model = reqModel || config.audioModel
    const ttsVoice = voice || config.ttsVoice
    const ttsSpeed = speed ?? 1.0

    const mp3Response = await openai.audio.speech.create({
      model,
      voice: ttsVoice,
      input: text,
      speed: ttsSpeed,
    })

    const arrayBuffer = await mp3Response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const { url } = await saveFile({ buffer, mimeType: 'audio/mpeg', subDir: 'audio' })

    // Save to MediaAsset
    const userId = parseInt((session.user as { id: string }).id)
    const asset = await prisma.mediaAsset.create({
      data: {
        filename: url.split('/').pop() || 'audio.mp3',
        url,
        type: 'AUDIO',
        mimeType: 'audio/mpeg',
        aiPrompt: text.slice(0, 200),
        sizeBytes: buffer.length,
        createdByUserId: userId,
      },
    })

    // If articleId provided, update article audioUrl
    if (articleId) {
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
        model,
        promptSnippet: text.slice(0, 200),
        status: 'success',
      },
    }).catch(() => {})

    return apiSuccess({ url, mediaAssetId: asset.id })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'AI audio generation failed'
    return apiError(`[POST /api/ai/generate-audio] ${message}`, 500, err)
  }
}
