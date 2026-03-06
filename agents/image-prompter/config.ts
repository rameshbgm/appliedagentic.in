// agents/image-prompter/config.ts
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
   * OpenAI models:  gpt-4o | gpt-4o-mini | ...
   * Gemini models:  gemini-1.5-pro | gemini-2.0-flash-exp | ...
   */
  textModel: 'gpt-4o',

  /** Higher temperature for creative, varied image prompt descriptions */
  temperature: 0.8,

  /** Prompt descriptions are short; 300 tokens is sufficient */
  maxTokens: 300,
  streaming: false,
}
