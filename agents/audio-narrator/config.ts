import { AI_MODELS } from '@/lib/ai-models'
// agents/audio-narrator/config.ts
// To switch provider: change `provider` and update `textModel`.
import type { AgentConfig } from '../types'

export const config: AgentConfig = {
  /**
   * 'openai' | 'gemini'
   * OpenAI API key  → OPENAI_API_KEY in .env.local
   * Gemini API key  → GOOGLE_GENAI_API_KEY in .env.local
   */
  provider: 'openai',

  /** OpenAI text generation via Responses API with high reasoning. */
  textModel: process.env.OPENAI_TEXT_MODEL ?? AI_MODELS.openai.text,

  reasoningEffort: 'high',

  maxTokens: 4000,
  streaming: false,
}

/** TTS-specific config (used by the audio route, not by the LLM chain) */
export const ttsConfig = {
  /**
   * Which TTS provider to use for voice synthesis.
   * 'gemini' → Gemini 3.8 Flash TTS (via GOOGLE_GENAI_API_KEY, no extra package)
   * 'openai' → OpenAI Realtime audio (via OPENAI_API_KEY)
   *
   * Note: the voice picker in the editor auto-detects the provider from
   * the voice name — Gemini voices are Title-cased (e.g. "Kore"),
   * OpenAI voices are lowercase (e.g. "marin").
   */
  ttsProvider: 'openai' as 'gemini' | 'openai',

  /**
   * Default voice.
   * Gemini voices: Zephyr | Puck | Charon | Kore | Fenrir | Aoede | Leda | Orus | Schedar | Laomedeia
   * OpenAI voices: marin | cedar | alloy | ash | ballad | coral | echo | sage | shimmer | verse
   */
  voice: process.env.OPENAI_TTS_VOICE ?? 'marin',

  /**
   * OpenAI Realtime audio model (used only when ttsProvider === 'openai').
   * Uses the Realtime WebSocket API with PCM audio output.
   */
  openaiModel: process.env.OPENAI_AUDIO_MODEL ?? AI_MODELS.openai.audio,

  /**
   * Maximum characters per TTS chunk.
   * Keep narration chunks short enough for reliable synthesis with either provider.
   */
  maxCharsPerChunk: 4096,
}
