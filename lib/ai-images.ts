import { AI_MODELS } from './ai-models'
import { generateGeminiContent } from './gemini'
import { getAIConfig, getOpenAIClient } from './openai'

export type ImageProvider = 'gemini' | 'openai'
export type ImageSize = '1024x1024' | '1536x1024' | '1024x1536'
export type ImageQuality = 'auto' | 'low' | 'medium' | 'high'

export async function generateImage(input: {
  provider: ImageProvider
  prompt: string
  size: ImageSize
  quality: ImageQuality
}): Promise<{ buffer: Buffer; mimeType: string; model: string; revisedPrompt?: string }> {
  if (input.provider === 'gemini') {
    const model = process.env.GOOGLE_IMAGE_MODEL ?? AI_MODELS.gemini.image
    const aspectRatio = input.size === '1536x1024' ? '3:2' : input.size === '1024x1536' ? '2:3' : '1:1'
    const response = await generateGeminiContent(model, {
      contents: [{ role: 'user', parts: [{ text: input.prompt }] }],
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE'],
        imageConfig: { aspectRatio, imageSize: '1K' },
      },
    })
    const image = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData?.mimeType.startsWith('image/'))?.inlineData
    if (!image?.data) throw new Error(`Gemini returned no image (${response.candidates?.[0]?.finishReason ?? 'empty response'})`)
    return { buffer: Buffer.from(image.data, 'base64'), mimeType: image.mimeType, model }
  }

  const config = await getAIConfig()
  const response = await getOpenAIClient().images.generate({
    model: config.imageModel,
    prompt: input.prompt,
    size: input.size,
    quality: input.quality,
    output_format: 'png',
    n: 1,
  })
  const image = response.data?.[0]
  if (!image?.b64_json) throw new Error('OpenAI returned no image')
  return {
    buffer: Buffer.from(image.b64_json, 'base64'),
    mimeType: 'image/png',
    model: config.imageModel,
    revisedPrompt: image.revised_prompt,
  }
}
