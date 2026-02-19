// app/api/ai/generate-image/route.ts
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
    const { prompt, size, quality, style, model: reqModel } = body

    if (!prompt) return apiError('Prompt is required', 422)

    const config = await getAIConfig()
    const openai = getOpenAIClient()

    const model = reqModel || config.imageModel
    const imageSize = size || config.imageSize
    const imageQuality = quality || config.imageQuality

    const response = await openai.images.generate({
      model,
      prompt,
      size: imageSize as '1024x1024' | '1792x1024' | '1024x1792',
      quality: imageQuality as 'standard' | 'hd',
      style: style || 'vivid',
      response_format: 'url',
      n: 1,
    })

    const imageUrl = response.data?.[0]?.url
    const revisedPrompt = response.data?.[0]?.revised_prompt

    if (!imageUrl) return apiError('No image was generated', 500)

    // Download and save the image
    const imageResponse = await fetch(imageUrl)
    const buffer = Buffer.from(await imageResponse.arrayBuffer())
    const { url } = await saveFile({ buffer, mimeType: 'image/png', subDir: 'ai' })

    // Create MediaAsset record
    const userId = parseInt((session.user as { id: string }).id)
    const asset = await prisma.mediaAsset.create({
      data: {
        filename: url.split('/').pop() || 'ai-image.png',
        url,
        type: 'IMAGE',
        mimeType: 'image/png',
        aiPrompt: prompt,
        createdByUserId: userId,
      },
    })

    // Log usage
    await prisma.aIUsageLog.create({
      data: {
        userId,
        type: 'IMAGE_GENERATION',
        model,
        promptSnippet: prompt.slice(0, 200),
        status: 'success',
      },
    }).catch(() => {})

    return apiSuccess({ url, revisedPrompt, mediaAssetId: asset.id })
  } catch (err: unknown) {
    console.error('[POST /api/ai/generate-image]', err)
    const message = err instanceof Error ? err.message : 'AI image generation failed'
    return apiError(message, 500)
  }
}
