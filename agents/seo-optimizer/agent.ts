// agents/seo-optimizer/agent.ts
// SEO Optimizer agent — generates full SEO + Open Graph + Twitter Card metadata.
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
  /** Comma-separated keywords string */
  seoKeywords: string
  /** Open Graph title (≤ 70 chars) */
  ogTitle: string
  /** Open Graph description (≤ 200 chars) */
  ogDescription: string
  /** Twitter/X Card title (≤ 70 chars) */
  twitterTitle: string
  /** Twitter/X Card description (≤ 200 chars) */
  twitterDescription: string
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
 */
export async function runSeoOptimizer(
  input: SeoOptimizerInput,
): Promise<SeoOptimizerOutput> {
  const result = await runAgent(config, systemPrompt, guardrails, {
    ...input,
    prompt: `Article title: ${input.prompt}`,
  })

  // Parse the JSON output
  let parsed: {
    seoTitle?: string
    seoDescription?: string
    seoKeywords?: string
    ogTitle?: string
    ogDescription?: string
    twitterTitle?: string
    twitterDescription?: string
    tags?: string[]
  }
  try {
    const cleaned = result.text
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/```\s*$/, '')
      .trim()
    parsed = JSON.parse(cleaned)
  } catch {
    parsed = { seoTitle: '', seoDescription: result.text.slice(0, 160) }
  }

  const seoTitle       = (parsed.seoTitle       ?? '').slice(0, 60)
  const seoDescription = (parsed.seoDescription ?? '').slice(0, 160)
  const seoKeywords    = parsed.seoKeywords ?? ''
  const ogTitle        = (parsed.ogTitle        ?? seoTitle).slice(0, 70)
  const ogDescription  = (parsed.ogDescription  ?? seoDescription).slice(0, 200)
  const twitterTitle   = (parsed.twitterTitle   ?? ogTitle).slice(0, 70)
  const twitterDescription = (parsed.twitterDescription ?? ogDescription).slice(0, 200)
  const tags           = Array.isArray(parsed.tags) ? parsed.tags.slice(0, 10) : []

  return {
    ...result,
    seoTitle,
    seoDescription,
    seoKeywords,
    ogTitle,
    ogDescription,
    twitterTitle,
    twitterDescription,
    tags,
  }
}
