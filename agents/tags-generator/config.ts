import { AI_MODELS } from '@/lib/ai-models'
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
  provider: 'openai',

  /** OpenAI text generation via Responses API with high reasoning. */
  textModel: process.env.OPENAI_TEXT_MODEL ?? AI_MODELS.openai.text,

  reasoningEffort: 'high',

  /** 10 tags in a JSON array — well under 150 tokens; 300 gives safe headroom */
  maxTokens: 300,

  streaming: false,
}
