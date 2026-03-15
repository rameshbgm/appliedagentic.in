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
   * Which TTS provider to use for voice synthesis.
   * 'gemini' → Gemini 2.5 Flash TTS (via GOOGLE_GENAI_API_KEY, no extra package)
   * 'openai' → OpenAI TTS (via OPENAI_API_KEY)
   *
   * Note: the voice picker in the editor auto-detects the provider from
   * the voice name — Gemini voices are Title-cased (e.g. "Kore"),
   * OpenAI voices are lowercase (e.g. "nova").
   */
  ttsProvider: 'gemini' as 'gemini' | 'openai',

  /**
   * Default voice.
   * Gemini voices: Zephyr | Puck | Charon | Kore | Fenrir | Aoede | Leda | Orus | Schedar | Laomedeia
   * OpenAI voices: alloy | ash | ballad | coral | echo | fable | nova | onyx | sage | shimmer | verse
   */
  voice: 'Kore' as string,

  /**
   * OpenAI TTS model (used only when ttsProvider === 'openai').
   * Options: tts-1 (faster) | tts-1-hd (higher quality)
   */
  openaiModel: 'tts-1' as string,

  /**
   * Maximum characters per TTS chunk.
   * OpenAI hard limit: 4096. Gemini handles longer text but we keep parity.
   */
  maxCharsPerChunk: 4096,
}
