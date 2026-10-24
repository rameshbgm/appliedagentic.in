// Server-side Gemini 3.8 speech generation via REST.
import { AI_MODELS } from './ai-models'
import { generateGeminiContent } from './gemini'
import { pcmToWav } from './audio'

export const GEMINI_TTS_MODEL = process.env.GOOGLE_AUDIO_MODEL ?? AI_MODELS.gemini.audio

export const GEMINI_TTS_VOICES = [
  'Zephyr',    // bright, upbeat
  'Puck',      // upbeat
  'Charon',    // informational
  'Kore',      // firm
  'Fenrir',    // excitable
  'Aoede',     // breezy, easy-going
  'Leda',      // youthful
  'Orus',      // firm
  'Schedar',   // even
  'Laomedeia', // upbeat
] as const

export type GeminiTtsVoice = typeof GEMINI_TTS_VOICES[number]

/** Returns true when the voice name belongs to the Gemini voice set */
export function isGeminiVoice(voice: string): boolean {
  return (GEMINI_TTS_VOICES as readonly string[]).includes(voice)
}

/** Return WAV audio, preserving the provider's WAV header when present. */
export async function geminiTextToSpeech(text: string, voice: string): Promise<Buffer> {
  if (!isGeminiVoice(voice)) throw new Error('Unsupported Gemini voice')
  const response = await generateGeminiContent(GEMINI_TTS_MODEL, {
    contents: [{ role: 'user', parts: [{ text }] }],
    generationConfig: {
      responseModalities: ['AUDIO'],
      speechConfig: { voiceConfig: { voice } },
    },
  })
  const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData?.data)
  if (!part?.inlineData?.data) throw new Error('Gemini returned no audio')
  const audio = Buffer.from(part.inlineData.data, 'base64')
  if (audio.toString('ascii', 0, 4) === 'RIFF') return audio
  if (/audio\/(L16|pcm)/i.test(part.inlineData.mimeType)) {
    const sampleRate = Number(part.inlineData.mimeType.match(/rate=(\d+)/)?.[1] ?? 24000)
    return pcmToWav(audio, sampleRate)
  }
  throw new Error('Gemini returned an unsupported audio format')
}
