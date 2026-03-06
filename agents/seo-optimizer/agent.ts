// agents/seo-optimizer/agent.ts
// SEO Optimizer agent — generates seoTitle, seoDescription, and tags from article content.
// SERVER-SIDE ONLY.

import { runAgent }     from '../base'
import { config }       from './config'
import { systemPrompt } from './system-prompt'
import { guardrails }   from './guardrails'
import type { AgentInput, AgentOutput } from '../types'

export interface SeoOptimizerInput extends AgentInput {
  /** Article title (required) */
  prompt: string
  /** Article content excerpt (recommended: first 2000–3000 chars) */
  context?: string
}

export interface SeoOptimizerOutput extends AgentOutput {
  /** SEO page title (≤ 60 chars) */
  seoTitle: string
  /** Meta description (≤ 160 chars) */
  seoDescription: string
  /** Array of lowercase keyword tags */
  tags: string[]
}

/**
 * Run the SEO Optimizer agent.
 *
 * @example
 * const result = await runSeoOptimizer({
 *   prompt: 'Building a ReAct Agent with LangChain',
 *   context: articleContent.slice(0, 3000),
 * })
 * console.log(result.seoTitle, result.seoDescription, result.tags)
 */
export async function runSeoOptimizer(
  input: SeoOptimizerInput,
): Promise<SeoOptimizerOutput> {
  const result = await runAgent(config, systemPrompt, guardrails, {
    ...input,
    prompt: `Article title: ${input.prompt}`,
  })

  // Parse the JSON output
  let parsed: { seoTitle: string; seoDescription: string; tags: string[] }
  try {
    const cleaned = result.text
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/```\s*$/, '')
      .trim()
    parsed = JSON.parse(cleaned)
  } catch {
    // Fallback: return raw text and empty arrays so the caller can handle gracefully
    parsed = { seoTitle: '', seoDescription: result.text.slice(0, 160), tags: [] }
  }

  return {
    ...result,
    seoTitle:       (parsed.seoTitle       ?? '').slice(0, 60),
    seoDescription: (parsed.seoDescription ?? '').slice(0, 160),
    tags:           Array.isArray(parsed.tags) ? parsed.tags.slice(0, 10) : [],
  }
}
