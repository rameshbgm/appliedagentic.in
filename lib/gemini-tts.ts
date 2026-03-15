// lib/gemini-tts.ts
// Gemini native TTS via @google/generative-ai (already installed).
// The TTS-specific generationConfig fields (responseModalities, speechConfig)
// are not typed in this SDK version, so we pass them via `as any`.
// The underlying HTTP call to the Gemini API is identical to @google/genai.
// SERVER-SIDE ONLY.

import { GoogleGenerativeAI } from '@google/generative-ai'

export const GEMINI_TTS_MODEL = 'gemini-2.5-flash-preview-tts'

/** Gemini prebuilt TTS voices — Title-cased, distinct from OpenAI voices */
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

/**
 * Call Gemini TTS and return a WAV buffer.
 * The raw PCM response (24 kHz, 16-bit, mono) is wrapped in a RIFF/WAV
 * container — no extra libraries needed.
 */
export async function geminiTextToSpeech(text: string, voice: string): Promise<Buffer> {
  const apiKey = process.env.GOOGLE_GENAI_API_KEY
  if (!apiKey) throw new Error('GOOGLE_GENAI_API_KEY env variable is not set')

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: GEMINI_TTS_MODEL })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await (model.generateContent as any)({
    contents: [{ role: 'user', parts: [{ text }] }],
    generationConfig: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } },
      },
    },
  })

  const candidate = result?.response?.candidates?.[0]
  const part = candidate?.content?.parts?.[0]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const inline = (part as any)?.inlineData
  if (!inline?.data) {
    throw new Error(
      `Gemini TTS returned no audio. Finish reason: ${candidate?.finishReason ?? 'unknown'}`
    )
  }

  const pcm = Buffer.from(inline.data, 'base64')
  return pcmToWav(pcm, 24000, 1, 16)
}

/** Wrap raw PCM bytes in a minimal RIFF/WAV container (44-byte header). */
function pcmToWav(pcm: Buffer, sampleRate: number, channels: number, bitDepth: number): Buffer {
  const header = Buffer.alloc(44)
  header.write('RIFF', 0)
  header.writeUInt32LE(36 + pcm.length, 4)   // file size - 8
  header.write('WAVE', 8)
  header.write('fmt ', 12)
  header.writeUInt32LE(16, 16)               // PCM chunk size
  header.writeUInt16LE(1, 20)               // PCM format
  header.writeUInt16LE(channels, 22)
  header.writeUInt32LE(sampleRate, 24)
  header.writeUInt32LE(sampleRate * channels * (bitDepth / 8), 28)  // byte rate
  header.writeUInt16LE(channels * (bitDepth / 8), 32)               // block align
  header.writeUInt16LE(bitDepth, 34)
  header.write('data', 36)
  header.writeUInt32LE(pcm.length, 40)
  return Buffer.concat([header, pcm])
}
