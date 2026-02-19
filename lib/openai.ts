// lib/openai.ts
// SERVER-SIDE ONLY — never import in client components
import OpenAI from 'openai'
import { prisma } from './prisma'

let _openaiClient: OpenAI | null = null

export function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey || apiKey === 'sk-your-api-key-here') {
    throw new Error('OPENAI_API_KEY is not configured. Set it in .env.local or Admin → Settings → AI Config.')
  }
  if (!_openaiClient) {
    _openaiClient = new OpenAI({ apiKey })
  }
  return _openaiClient
}

export interface OpenAIConfig {
  textModel: string
  imageModel: string
  audioModel: string
  temperature: number
  maxTokens: number
  imageSize: '1024x1024' | '1792x1024' | '1024x1792' | '256x256' | '512x512'
  imageQuality: 'standard' | 'hd'
  ttsVoice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer'
}

/** Merge env vars + DB settings — env takes precedence except API key always from env */
export async function getAIConfig(): Promise<OpenAIConfig> {
  let settings = null
  try {
    settings = await prisma.siteSettings.findFirst()
  } catch {
    // DB may not be ready yet
  }

  return {
    textModel: process.env.OPENAI_TEXT_MODEL ?? settings?.openaiTextModel ?? 'gpt-4o',
    imageModel: process.env.OPENAI_IMAGE_MODEL ?? settings?.openaiImageModel ?? 'dall-e-3',
    audioModel: process.env.OPENAI_AUDIO_MODEL ?? settings?.openaiAudioModel ?? 'tts-1',
    temperature: parseFloat(process.env.OPENAI_TEMPERATURE ?? String(settings?.openaiTemperature ?? 0.7)),
    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS ?? String(settings?.openaiMaxTokens ?? 2000)),
    imageSize: (process.env.OPENAI_IMAGE_SIZE ?? settings?.openaiImageSize ?? '1024x1024') as OpenAIConfig['imageSize'],
    imageQuality: (process.env.OPENAI_IMAGE_QUALITY ?? settings?.openaiImageQuality ?? 'standard') as 'standard' | 'hd',
    ttsVoice: (process.env.OPENAI_TTS_VOICE ?? settings?.openaiTtsVoice ?? 'nova') as OpenAIConfig['ttsVoice'],
  }
}
