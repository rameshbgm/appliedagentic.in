// lib/openai.ts
// SERVER-SIDE ONLY — never import in client components
import OpenAI from 'openai'
import { AI_MODELS } from './ai-models'

let _openaiClient: OpenAI | null = null

export function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey || apiKey === 'sk-your-api-key-here') {
    throw new Error('OPENAI_API_KEY is not configured. Set it in the server environment or .env.local.')
  }
  if (!_openaiClient || _openaiClient.apiKey !== apiKey) {
    _openaiClient = new OpenAI({ apiKey })
  }
  return _openaiClient
}

export interface OpenAIConfig {
  textModel: string
  imageModel: string
  audioModel: string
  imageSize: '1024x1024' | '1536x1024' | '1024x1536'
  imageQuality: 'auto' | 'low' | 'medium' | 'high'
  ttsVoice: string
}

/** Read AI config purely from environment variables */
export async function getAIConfig(): Promise<OpenAIConfig> {
  return {
    textModel:    process.env.OPENAI_TEXT_MODEL    ?? AI_MODELS.openai.text,
    imageModel:   process.env.OPENAI_IMAGE_MODEL   ?? AI_MODELS.openai.image,
    audioModel:   process.env.OPENAI_AUDIO_MODEL   ?? AI_MODELS.openai.audio,
    imageSize:    (process.env.OPENAI_IMAGE_SIZE    ?? '1024x1024') as OpenAIConfig['imageSize'],
    imageQuality: (process.env.OPENAI_IMAGE_QUALITY ?? 'medium') as OpenAIConfig['imageQuality'],
    ttsVoice:     process.env.OPENAI_TTS_VOICE ?? 'marin',
  }
}
