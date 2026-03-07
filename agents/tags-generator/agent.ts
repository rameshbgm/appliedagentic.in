// agents/tags-generator/agent.ts
// Generates a list of up to 10 relevant tags for an article using Gemini by default.
import { runAgent } from '../base'
import { config } from './config'
import { systemPrompt } from './system-prompt'
import { guardrails } from './guardrails'
import type { AgentOutput } from '../types'

export interface TagsGeneratorInput {
  /** Article title + content excerpt to tag */
  prompt: string
  /** Optional extra context (e.g. existing category) */
  context?: string
}

export interface TagsGeneratorOutput extends AgentOutput {
  /** Parsed array of tag strings (max 10, lowercase) */
  tags: string[]
}

/**
 * Generate up to 10 relevant tags for an article.
 * Returns both the raw text and a parsed `tags` array.
 */
export async function runTagsGenerator(input: TagsGeneratorInput): Promise<TagsGeneratorOutput> {
  const result = await runAgent(config, systemPrompt, guardrails, {
    prompt: input.prompt,
    context: input.context,
  })

  // Parse the JSON array — extract the first [...] block to tolerate
  // any preamble or trailing text the LLM may add despite instructions.
  let tags: string[] = []
  try {
    // Strip optional markdown fences first
    const stripped = result.text
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/```\s*$/, '')
      .trim()
    // Extract the outermost JSON array even if there is surrounding text
    const match = stripped.match(/\[[\s\S]*\]/)
    if (!match) throw new Error('No JSON array found in tags response')
    const parsed = JSON.parse(match[0])
    if (Array.isArray(parsed)) {
      tags = parsed
        .filter((t) => typeof t === 'string' && t.trim().length > 0)
        .map((t) => t.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, ''))
        .filter((t) => t.length > 0)
        .slice(0, 10)
    }
  } catch (e) {
    console.error('[tags-generator] JSON parse failed:', e, '\nRaw text:', result.text.slice(0, 200))
    tags = []
  }

  return { ...result, tags }
}
