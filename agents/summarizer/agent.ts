// agents/summarizer/agent.ts
// Summarizer agent — generates bullet-point summaries for articles and sections.
// SERVER-SIDE ONLY.

import { runAgent }     from '../base'
import { config }       from './config'
import { systemPrompt } from './system-prompt'
import { guardrails }   from './guardrails'
import type { AgentInput, AgentOutput } from '../types'

export interface SummarizerInput extends AgentInput {
  /**
   * The text to summarize — full article content or a single section.
   * Pass the text as `context` and the instruction as `prompt`.
   */
  prompt: string
  context?: string
  /** Whether this is a full article or a single section. Defaults to 'article'. */
  scope?: 'article' | 'section'
}

export interface SummarizerOutput extends AgentOutput {
  /** Markdown bullet list string */
  text: string
  /** Parsed bullet points (convenience split) */
  bullets: string[]
}

/**
 * Run the summarizer agent.
 *
 * @example
 * const result = await runSummarizer({
 *   prompt: 'Summarize this article.',
 *   context: articleContent,
 *   scope: 'article',
 * })
 * console.log(result.bullets) // ['Key point 1', 'Key point 2', ...]
 */
export async function runSummarizer(
  input: SummarizerInput,
): Promise<SummarizerOutput> {
  const scopeNote =
    input.scope === 'section'
      ? 'SCOPE: section summary. Output EXACTLY 3 bullet lines — no more, no fewer. Each bullet must be a sharp, standalone insight a reader can act on or remember. Lead with a strong verb or key concept. 12–22 words per bullet. Start every line with "- ". No intro text, no heading, no blank lines.'
      : 'SCOPE: full article summary. Output EXACTLY 7 bullet lines — no more, no fewer. Each bullet must capture a distinct, meaningful insight from the article — not a vague overview. Cover the core argument, key concepts, practical takeaways, and any surprising or important details. Lead with a strong verb or key concept. 18–32 words per bullet. Start every line with "- ". No intro text, no heading, no blank lines.'

  const enrichedPrompt = `${scopeNote}\n\n${input.prompt}`

  const result = await runAgent(config, systemPrompt, guardrails, {
    ...input,
    prompt: enrichedPrompt,
  })

  // Parse bullets from the text (lines starting with "- ")
  const bullets = result.text
    .split('\n')
    .map((l) => l.replace(/^[-*]\s+/, '').trim())
    .filter(Boolean)

  return { ...result, bullets }
}
