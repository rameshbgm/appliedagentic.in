import { AI_MODELS } from '@/lib/ai-models'
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
  provider: 'openai',

  /** OpenAI text generation via Responses API with high reasoning. */
  textModel: process.env.OPENAI_TEXT_MODEL ?? AI_MODELS.openai.text,

  reasoningEffort: 'high',

  /** Maximum output tokens — full articles need large limits */
  maxTokens: 4000,

  /** Streaming disabled by default; enable if API route supports it */
  streaming: false,
}
