// lib/openai.ts
// SERVER-SIDE ONLY — never import in client components
import OpenAI from 'openai'

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

/** Read AI config purely from environment variables */
export async function getAIConfig(): Promise<OpenAIConfig> {
  return {
    textModel:    process.env.OPENAI_TEXT_MODEL    ?? 'gpt-4o',
    imageModel:   process.env.OPENAI_IMAGE_MODEL   ?? 'dall-e-3',
    audioModel:   process.env.OPENAI_AUDIO_MODEL   ?? 'tts-1',
    temperature:  parseFloat(process.env.OPENAI_TEMPERATURE ?? '0.7'),
    maxTokens:    parseInt(process.env.OPENAI_MAX_TOKENS    ?? '2000'),
    imageSize:    (process.env.OPENAI_IMAGE_SIZE    ?? '1024x1024') as OpenAIConfig['imageSize'],
    imageQuality: (process.env.OPENAI_IMAGE_QUALITY ?? 'standard') as 'standard' | 'hd',
    ttsVoice:     (process.env.OPENAI_TTS_VOICE     ?? 'nova')      as OpenAIConfig['ttsVoice'],
  }
}
