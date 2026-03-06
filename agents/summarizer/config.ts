// agents/summarizer/config.ts
// To switch provider: change `provider` and update `textModel`.
import type { AgentConfig } from '../types'

export const config: AgentConfig = {
  /**
   * 'openai' | 'gemini'
   * OpenAI API key  → OPENAI_API_KEY in .env.local
   * Gemini API key  → GOOGLE_GENAI_API_KEY in .env.local
   */
  provider: 'openai',

  /**
   * OpenAI models:  gpt-4o-mini | gpt-4o | ...
   * Gemini models:  gemini-1.5-flash | gemini-1.5-pro | ...
   */
  textModel: 'gpt-4o-mini',

  /** Lower temperature for more deterministic, factual summaries */
  temperature: 0.3,

  maxTokens: 800,
  streaming: false,
}
