// agents/content-writer/config.ts
// Agent configuration for the Content Writer.
// To switch provider: change `provider` and update `textModel` to a model name
// supported by that provider. Only API keys live in .env.local.
import type { AgentConfig } from '../types'

export const config: AgentConfig = {
  /**
   * 'openai' | 'gemini' — controls which LLM is used.
   * OpenAI API key  → OPENAI_API_KEY in .env.local
   * Gemini API key  → GOOGLE_GENAI_API_KEY in .env.local
   */
  provider: 'gemini',

  /**
   * Model name for the selected provider.
   * OpenAI models:  gpt-4o | gpt-4o-mini | gpt-4-turbo | ...
   * Gemini models:  gemini-3-flash-preview | gemini-2.0-flash | gemini-1.5-pro
   */
  textModel: 'gemini-3-flash-preview',

  /** Sampling temperature — higher = more creative (0.0 – 2.0) */
  temperature: 0.75,

  /** Maximum output tokens — full articles need large limits */
  maxTokens: 4000,

  /** Streaming disabled by default; enable if API route supports it */
  streaming: false,
}
