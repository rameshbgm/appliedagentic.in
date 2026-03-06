// agents/base.ts
// Factory: creates the right LangChain LLM instance from an AgentConfig.
// SERVER-SIDE ONLY — never import in client components.

import { ChatOpenAI } from '@langchain/openai'
import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import type { AgentConfig, AgentInput, AgentOutput } from './types'

/**
 * Build a LangChain chain (prompt → LLM) and execute it,
 * returning a normalised AgentOutput.
 */
export async function runAgent(
  config: AgentConfig,
  systemPrompt: string,
  guardrails: string,
  input: AgentInput,
): Promise<AgentOutput> {
  const temperature = input.temperature ?? config.temperature
  const maxTokens   = input.maxTokens   ?? config.maxTokens

  // ── LLM ──────────────────────────────────────────────────────────────────
  const llm =
    config.provider === 'gemini'
      ? new ChatGoogleGenerativeAI({
          model:           config.textModel,
          temperature,
          maxOutputTokens: maxTokens,
          streaming:       config.streaming,
          apiKey:          process.env.GOOGLE_GENAI_API_KEY,
        })
      : new ChatOpenAI({
          model:       config.textModel,
          temperature,
          maxTokens,
          streaming:   config.streaming,
          apiKey:      process.env.OPENAI_API_KEY,
        })

  // ── Prompt ───────────────────────────────────────────────────────────────
  // Guardrails are appended to the system prompt as a separate section.
  const fullSystem = `${systemPrompt}\n\n---\n\nGUARDRAILS:\n${guardrails}`

  // Escape literal curly-braces in the system prompt so LangChain's template
  // parser does not treat JSON examples (e.g. { "key": "..." }) as variable
  // placeholders. Only the human message uses real {prompt}/{context} vars.
  const escapedSystem = fullSystem.replace(/\{/g, '{{').replace(/\}/g, '}}')

  const promptTemplate = ChatPromptTemplate.fromMessages([
    ['system', escapedSystem],
    ['human', input.context ? `Context:\n{context}\n\n---\n\n{prompt}` : '{prompt}'],
  ])

  // ── Invoke ───────────────────────────────────────────────────────────────
  const rawMsg = await promptTemplate.pipe(llm).invoke({
    prompt: input.prompt,
    ...(input.context ? { context: input.context } : {}),
  })

  const text = typeof rawMsg.content === 'string'
    ? rawMsg.content
    : JSON.stringify(rawMsg.content)

  // Token usage — available from OpenAI; Gemini may expose usage_metadata
  const meta = (rawMsg as any)?.response_metadata
  let usage: AgentOutput['usage']
  if (meta) {
    const u = meta.tokenUsage ?? meta.usage_metadata
    if (u) {
      usage = {
        inputTokens:  u.promptTokens  ?? u.input_tokens,
        outputTokens: u.completionTokens ?? u.output_tokens,
      }
    }
  }

  return { text, provider: config.provider, model: config.textModel, usage }
}
