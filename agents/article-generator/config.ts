// agents/article-generator/config.ts
// Configuration for the Full Article Generator agent.
import type { AgentConfig } from '../types'

export const config: AgentConfig = {
  /**
   * 'gemini' | 'openai'
   * Gemini API key  → GOOGLE_GENAI_API_KEY in .env.local
   * OpenAI API key  → OPENAI_API_KEY in .env.local
   */
  provider: 'gemini',

  /**
   * Gemini models:  gemini-3-flash-preview | gemini-2.0-flash | gemini-1.5-pro
   * OpenAI models:  gpt-4o | gpt-4o-mini | ...
   */
  textModel: 'gemini-3-flash-preview',

  /** Balanced temperature for creative but structured output */
  temperature: 0.7,

  /** Fallback token budget — overridden per-length in the agent (2500/4500/7000/10000/14000) */
  maxTokens: 8000,

  streaming: false,
}
