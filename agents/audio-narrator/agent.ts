// agents/audio-narrator/agent.ts
// Audio Narrator agent.
// Step 1: LLM cleans Markdown → TTS-ready prose.
// Step 2: Splits into ≤ 3800-char chunks on sentence boundaries.
// The actual TTS synthesis (OpenAI TTS API) is performed in the API route.
// SERVER-SIDE ONLY.

import { runAgent }     from '../base'
import { config, ttsConfig } from './config'
import { systemPrompt } from './system-prompt'
import { guardrails }   from './guardrails'
import type { AgentInput, AgentOutput } from '../types'

export interface AudioNarratorInput extends AgentInput {
  /** Raw Markdown article content to convert to TTS narration */
  prompt: string
}

export interface AudioNarratorOutput extends AgentOutput {
  /** LLM-cleaned narration prose (before chunking) */
  cleanedText: string
  /** Array of text chunks, each ≤ ttsConfig.maxCharsPerChunk characters */
  chunks: string[]
  /** Total character count of cleaned text */
  totalChars: number
}

/**
 * Split text into TTS chunks at sentence boundaries, respecting maxChars.
 * Splits on '. ', '! ', '? ' to avoid cutting mid-sentence.
 */
function chunkText(text: string, maxChars: number): string[] {
  if (text.length <= maxChars) return [text]

  const chunks: string[] = []
  let remaining = text

  while (remaining.length > maxChars) {
    // Find the last sentence boundary before maxChars
    const slice = remaining.slice(0, maxChars)
    const lastPeriod = Math.max(
      slice.lastIndexOf('. '),
      slice.lastIndexOf('! '),
      slice.lastIndexOf('? '),
    )
    const cutAt = lastPeriod > maxChars / 2 ? lastPeriod + 2 : maxChars
    chunks.push(remaining.slice(0, cutAt).trim())
    remaining = remaining.slice(cutAt).trim()
  }
  if (remaining.length > 0) chunks.push(remaining.trim())
  return chunks
}

/**
 * Run the Audio Narrator agent.
 *
 * @example
 * const result = await runAudioNarrator({ prompt: markdownContent })
 * // Pass result.chunks to OpenAI TTS API one at a time
 * for (const chunk of result.chunks) {
 *   const audio = await openai.audio.speech.create({ model: ttsConfig.model, voice: ttsConfig.voice, input: chunk })
 * }
 */
export async function runAudioNarrator(
  input: AudioNarratorInput,
): Promise<AudioNarratorOutput> {
  const result = await runAgent(config, systemPrompt, guardrails, {
    ...input,
    prompt: `Convert the following Markdown article to clean TTS narration prose:\n\n${input.prompt}`,
  })

  const cleanedText = result.text.trim()
  const chunks      = chunkText(cleanedText, ttsConfig.maxCharsPerChunk)

  return {
    ...result,
    cleanedText,
    chunks,
    totalChars: cleanedText.length,
  }
}

// Re-export ttsConfig so the API route can read model/voice without importing config directly
export { ttsConfig }
