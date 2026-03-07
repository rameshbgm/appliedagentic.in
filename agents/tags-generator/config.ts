// agents/tags-generator/config.ts
// To switch provider: change `provider` and update `textModel`.
// Default: Gemini Flash — fast and cheap for short classification tasks.
import type { AgentConfig } from '../types'

export const config: AgentConfig = {
  /**
   * 'gemini' | 'openai'
   * Gemini API key  → GOOGLE_GENAI_API_KEY in .env.local
   * OpenAI API key  → OPENAI_API_KEY in .env.local
   */
  provider: 'gemini',

  /**
   * Gemini models:  gemini-3-flash-preview | gemini-2.0-flash | gemini-1.5-flash-002
   * OpenAI models:  gpt-4o-mini | gpt-4o | ...
   */
  textModel: 'gemini-2.0-flash',

  /** Low temperature for deterministic, repeatable tag lists */
  temperature: 0.3,

  /** 10 tags in a JSON array — well under 150 tokens; 300 gives safe headroom */
  maxTokens: 300,

  streaming: false,
}
