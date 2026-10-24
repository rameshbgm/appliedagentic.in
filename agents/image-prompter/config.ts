import { AI_MODELS } from '@/lib/ai-models'
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

  /** OpenAI text generation via Responses API with high reasoning. */
  textModel: process.env.OPENAI_TEXT_MODEL ?? AI_MODELS.openai.text,

  reasoningEffort: 'high',

  /** Prompt descriptions are short; 300 tokens is sufficient */
  maxTokens: 300,
  streaming: false,
}
