// agents/content-writer/agent.ts
// Content Writer agent — generates full, publication-ready Markdown articles.
// SERVER-SIDE ONLY.

import { runAgent } from '../base'
import { config }       from './config'
import { systemPrompt } from './system-prompt'
import { guardrails }   from './guardrails'
import type { AgentInput, AgentOutput } from '../types'

export interface ContentWriterInput extends AgentInput {
  /**
   * The article topic, title, or detailed brief.
   * Example: "Write a comprehensive guide to building ReAct agents with LangChain"
   */
  prompt: string
  /**
   * Optional existing draft or outline to expand upon.
   * When provided, the agent will build on this content instead of starting from scratch.
   */
  context?: string
  /** Target word count hint (informational — passed in the prompt) */
  targetWordCount?: number
  /** Tone override: 'professional' | 'conversational' | 'technical' | 'inspirational' */
  tone?: 'professional' | 'conversational' | 'technical' | 'inspirational'
}

export interface ContentWriterOutput extends AgentOutput {
  /** The generated Markdown article */
  text: string
}

const TONE_ADDENDUM: Record<string, string> = {
  professional:   'Write in a professional, authoritative tone suitable for industry practitioners.',
  conversational: 'Write in a warm, conversational tone that is accessible to a broad audience.',
  technical:      'Write in a deeply technical tone targeting ML engineers and AI researchers. Include code examples where useful.',
  inspirational:  'Write in an inspirational, visionary tone that motivates readers to engage with agentic AI.',
}

/**
 * Run the content-writer agent.
 *
 * @example
 * const result = await runContentWriter({
 *   prompt: 'Write an article on tool-use in LLM agents',
 *   tone: 'technical',
 *   targetWordCount: 1200,
 * })
 * console.log(result.text) // Full Markdown article
 */
export async function runContentWriter(
  input: ContentWriterInput,
): Promise<ContentWriterOutput> {
  const toneNote = TONE_ADDENDUM[input.tone ?? 'professional']
  const wordCountNote = input.targetWordCount
    ? `Target length: approximately ${input.targetWordCount} words.`
    : ''

  const enrichedPrompt = [
    input.prompt,
    toneNote,
    wordCountNote,
  ]
    .filter(Boolean)
    .join('\n\n')

  const result = await runAgent(config, systemPrompt, guardrails, {
    ...input,
    prompt: enrichedPrompt,
  })

  return result as ContentWriterOutput
}
