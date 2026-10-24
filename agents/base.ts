// agents/base.ts
// Factory: creates the right LangChain LLM instance from an AgentConfig.
// SERVER-SIDE ONLY — never import in client components.

import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import type { AgentConfig, AgentInput, AgentOutput } from './types'
import { logger } from '@/lib/logger'
import { getOpenAIClient } from '@/lib/openai'

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
  const temperature = input.temperature ?? config.temperature ?? 0.7
  const maxTokens   = input.maxTokens   ?? config.maxTokens

  // ── LLM ──────────────────────────────────────────────────────────────────
  const llm = config.provider === 'gemini'
      ? new ChatGoogleGenerativeAI({
          model:           config.textModel,
          temperature,
          maxOutputTokens: maxTokens,
          streaming:       config.streaming,
          apiKey:          process.env.GOOGLE_GENAI_API_KEY,
        })
      : null

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
  const t0 = Date.now()
  let rawMsg
  try {
    if (llm) {
      rawMsg = await promptTemplate.pipe(llm).invoke({
        prompt: input.prompt,
        ...(input.context ? { context: input.context } : {}),
      })
    } else {
      // Responses supports GPT-6 reasoning directly; sampling temperature is
      // unsupported with high reasoning. Reserve output space for thinking.
      const response = await getOpenAIClient().responses.create({
        model: config.textModel,
        instructions: fullSystem,
        input: input.context ? `Context:\n${input.context}\n\n---\n\n${input.prompt}` : input.prompt,
        reasoning: { effort: config.reasoningEffort ?? 'high' },
        max_output_tokens: Math.max(16384, maxTokens + 8192),
        store: false,
      })
      if (response.status !== 'completed' || !response.output_text?.trim()) {
        throw new Error(`OpenAI returned ${response.status ?? 'no text'}: ${response.incomplete_details?.reason ?? 'generation did not complete'}`)
      }
      rawMsg = {
        content: response.output_text,
        response_metadata: { usage_metadata: response.usage },
      }
    }
  } catch (err) {
    logger.ai(
      config.provider,
      config.textModel,
      input.prompt.slice(0, 120),
      undefined,
      Date.now() - t0,
      'error',
    )
    throw err
  }

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

  // ── Log AI call ──────────────────────────────────────────────────────────
  logger.ai(
    config.provider,
    config.textModel,
    input.prompt.slice(0, 120),
    usage ? { input: usage.inputTokens, output: usage.outputTokens } : undefined,
    Date.now() - t0,
    'success',
  )

  return { text, provider: config.provider, model: config.textModel, usage }
}

// Note: agent name is derived from `config.textModel` in the log — callers can
// pass a custom agentName via config.textModel for more readable AI log entries.
