// agents/types.ts
// Shared types across all LangChain agents

export type LLMProvider = 'openai' | 'gemini'

export interface AgentConfig {
  /** Which LLM provider to use. Change here (not in env) to swap providers. */
  provider: LLMProvider
  /** Text model identifier — resolved from env var with fallback */
  textModel: string
  /** OpenAI reasoning effort; sampling parameters are omitted when enabled. */
  reasoningEffort?: 'high'
  /** Gemini sampling temperature (0–2); ignored for OpenAI high reasoning. */
  temperature?: number
  /** Visible output budget; OpenAI reserves additional tokens for reasoning. */
  maxTokens: number
  /** Enable streaming responses */
  streaming: boolean
}

export interface AgentInput {
  /** Primary user prompt / instruction */
  prompt: string
  /** Optional additional context injected before the user message */
  context?: string
  /** Optional override for max output tokens (per-call) */
  maxTokens?: number
  /** Optional Gemini temperature override; omitted for OpenAI reasoning requests. */
  temperature?: number
}

export interface AgentOutput {
  /** Model's raw text response */
  text: string
  /** Which provider was used */
  provider: LLMProvider
  /** Model name that was called */
  model: string
  /** Approximate token usage (available from OpenAI; Gemini may omit) */
  usage?: {
    inputTokens?: number
    outputTokens?: number
  }
}
