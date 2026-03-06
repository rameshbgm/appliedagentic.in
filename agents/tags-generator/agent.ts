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

  // Parse the JSON array from the model response.
  // Strip optional markdown fences in case the model adds them despite instructions.
  let tags: string[] = []
  try {
    const clean = result.text
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/```\s*$/, '')
      .trim()
    const parsed = JSON.parse(clean)
    if (Array.isArray(parsed)) {
      tags = parsed
        .filter((t) => typeof t === 'string' && t.trim().length > 0)
        .map((t) => t.toLowerCase().trim())
        .slice(0, 10)
    }
  } catch {
    // If parsing fails return an empty array; the API route will handle it gracefully
    tags = []
  }

  return { ...result, tags }
}
