// app/api/ai/generate-image/route.ts
import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { getAIConfig } from '@/lib/openai'
import { AI_MODELS } from '@/lib/ai-models'
import { generateImage, type ImageProvider, type ImageSize, type ImageQuality } from '@/lib/ai-images'
import { prisma } from '@/lib/prisma'
import { prepareAsset } from '@/lib/storage'
import { apiSuccess, apiError } from '@/lib/utils'
import { runImagePrompter } from '@/agents/image-prompter/agent'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return apiError('Unauthorized', 401)

  try {
    const body = await req.json()
    const {
      prompt,
      size,
      quality,
      provider: reqProvider,
      model: reqModel,
      enhancePrompt = true, // set to false to skip LangChain image-prompter step
      articleId,            // optional — when provided, auto-attaches as article cover image
    } = body

    if (typeof prompt !== 'string' || !prompt.trim()) return apiError('Prompt is required', 422)

    const config = await getAIConfig()
    const geminiModel = process.env.GOOGLE_IMAGE_MODEL ?? AI_MODELS.gemini.image
    const provider: ImageProvider = reqProvider ?? (reqModel === geminiModel ? 'gemini' : 'openai')
    if (provider !== 'gemini' && provider !== 'openai') return apiError('Unsupported image provider', 422)
    const model = provider === 'gemini' ? geminiModel : config.imageModel
    if (reqModel && reqModel !== model) return apiError('Model does not match the configured image provider', 422)
    // Accept older clients' dimensions while sending supported GPT Image sizes.
    const requestedSize = size || config.imageSize
    const imageSize = requestedSize === '1792x1024' ? '1536x1024' : requestedSize === '1024x1792' ? '1024x1536' : requestedSize
    const requestedQuality = quality || config.imageQuality
    const imageQuality = requestedQuality === 'standard' ? 'medium' : requestedQuality === 'hd' ? 'high' : requestedQuality
    if (!['1024x1024', '1536x1024', '1024x1536'].includes(imageSize)) return apiError('Unsupported image size', 422)
    if (!['auto', 'low', 'medium', 'high'].includes(imageQuality)) return apiError('Unsupported image quality', 422)

    // ── Step 1: Enhance the prompt via the image-prompter LangChain agent ──
    let finalPrompt = prompt
    if (enhancePrompt) {
      try {
        const promptResult = await runImagePrompter({
          prompt,
          target: provider,
          aspectRatio: imageSize === '1536x1024' ? '3:2' : imageSize === '1024x1536' ? '2:3' : '1:1',
        })
        finalPrompt = promptResult.imagePrompt
      } catch {
        // If prompt enhancement fails, fall back to original prompt
        finalPrompt = prompt
      }
    }

    const generated = await generateImage({
      provider,
      prompt: finalPrompt,
      size: imageSize as ImageSize,
      quality: imageQuality as ImageQuality,
    })
    const { buffer, mimeType, revisedPrompt } = generated
    const { url, filename } = prepareAsset({ mimeType, subDir: 'ai' })

    // Create MediaAsset record — binary stored in DB
    const userId = parseInt((session.user as { id: string }).id)
    const asset = await prisma.mediaAsset.create({
      data: {
        filename,
        url,
        data: new Uint8Array(buffer) as Uint8Array<ArrayBuffer>,
        type: 'IMAGE',
        mimeType,
        sizeBytes: buffer.length,
        aiPrompt: finalPrompt,
        createdByUserId: userId,
      },
    })

    // Auto-attach as article cover image when articleId is provided
    if (articleId && !isNaN(parseInt(String(articleId), 10))) {
      await prisma.article.update({
        where: { id: parseInt(String(articleId), 10) },
        data: { coverImage: { connect: { id: asset.id } } },
      }).catch(() => {}) // non-fatal — image is already saved in media library
    }

    // Log usage
    await prisma.aIUsageLog.create({
      data: {
        userId,
        type: 'IMAGE_GENERATION',
        model,
        promptSnippet: finalPrompt.slice(0, 200),
        status: 'success',
      },
    }).catch(() => {})

    return apiSuccess({
      url,
      revisedPrompt: revisedPrompt ?? finalPrompt,
      originalPrompt: prompt,
      enhancedPrompt: enhancePrompt ? finalPrompt : undefined,
      mediaAssetId: asset.id,
      provider,
      model,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'AI image generation failed'
    return apiError(`[POST /api/ai/generate-image] ${message}`, 500, err)
  }
}
