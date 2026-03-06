// agents/seo-optimizer/config.ts
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
   * Gemini models:  gemini-2.0-flash | gemini-1.5-flash | gemini-1.5-pro | ...
   */
  textModel: 'gemini-2.0-flash',

  /** Low temperature for deterministic, precise SEO output */
  temperature: 0.4,

  /** SEO fields are short; 400 tokens is ample */
  maxTokens: 400,
  streaming: false,
}
