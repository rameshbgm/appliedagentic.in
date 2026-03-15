// agents/audio-narrator/config.ts
// To switch provider: change `provider` and update `textModel`.
import type { AgentConfig } from '../types'

export const config: AgentConfig = {
  /**
   * 'openai' | 'gemini'
   * OpenAI API key  → OPENAI_API_KEY in .env.local
   * Gemini API key  → GOOGLE_GENAI_API_KEY in .env.local
   */
  provider: 'gemini',

  /**
   * OpenAI models:  gpt-4o-mini | gpt-4o | ...
   * Gemini models:  gemini-3-flash-preview | gemini-2.0-flash | gemini-1.5-pro | ...
   */
  textModel: 'gemini-3-flash-preview',

  /** Lower temperature for predictable, clean prose output */
  temperature: 0.3,

  maxTokens: 4000,
  streaming: false,
}

/** TTS-specific config (used by the audio route, not by the LLM chain) */
export const ttsConfig = {
  /**
   * OpenAI TTS model.
   * Options: tts-1 (faster, lower cost) | tts-1-hd (higher quality)
   */
  model: 'tts-1' as string,

  /**
   * Voice for text-to-speech.
   * Options: alloy | echo | fable | onyx | nova | shimmer
   */
  voice: 'nova' as 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer',

  /**
   * Maximum characters per TTS chunk.
   * OpenAI TTS API hard limit is 4096 chars per request.
   */
  maxCharsPerChunk: 4096,
}
