import { AI_MODELS } from '@/lib/ai-models'
// agents/article-generator/config.ts
// Configuration for the Full Article Generator agent.
import type { AgentConfig } from '../types'

export const config: AgentConfig = {
  /**
   * 'gemini' | 'openai'
   * Gemini API key  → GOOGLE_GENAI_API_KEY in .env.local
   * OpenAI API key  → OPENAI_API_KEY in .env.local
   */
  provider: 'openai',

  /** OpenAI text generation via Responses API with high reasoning. */
  textModel: process.env.OPENAI_TEXT_MODEL ?? AI_MODELS.openai.text,

  reasoningEffort: 'high',

  /** Fallback token budget — overridden per-length in the agent (2500/4500/7000/10000/14000) */
  maxTokens: 8000,

  streaming: false,
}
