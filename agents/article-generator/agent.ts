// agents/article-generator/agent.ts
// Full Article Generator — generates a complete article with SEO, sections, and tags.
// SERVER-SIDE ONLY.

import { runAgent } from '../base'
import { config } from './config'
import { systemPrompt } from './system-prompt'
import { guardrails } from './guardrails'
import type { AgentInput, AgentOutput } from '../types'

export interface ArticleGeneratorInput extends AgentInput {
  /** Article topic or title brief */
  prompt: string
  /** Additional user context or notes */
  context?: string
  /** Generation mode */
  mode?: 'generate' | 'outline' | 'expand'
  /** Tone */
  tone?: 'professional' | 'conversational' | 'technical' | 'inspirational'
  /** Length */
  length?: 'short' | 'medium' | 'long'
  /** Target URL / slug hint */
  url?: string
  /** Content to explicitly exclude */
  exclude?: string
}

export interface GeneratedSection {
  title: string
  content: string
}

export interface ArticleGeneratorOutput extends AgentOutput {
  title: string
  slug: string
  summary: string
  content: string
  sections: GeneratedSection[]
  seoTitle: string
  seoDescription: string
  seoKeywords: string
  ogTitle: string
  ogDescription: string
  twitterTitle: string
  twitterDescription: string
  tags: string[]
}

const LENGTH_TOKENS: Record<string, number> = {
  short: 2500,
  medium: 4500,
  long: 7000,
}

/**
 * Run the Full Article Generator agent.
 *
 * @example
 * const article = await runArticleGenerator({
 *   prompt: 'Building a ReAct Agent with LangChain',
 *   tone: 'technical',
 *   length: 'medium',
 * })
 */
export async function runArticleGenerator(
  input: ArticleGeneratorInput,
): Promise<ArticleGeneratorOutput> {
  const tone = input.tone ?? 'professional'
  const length = input.length ?? 'medium'
  const mode = input.mode ?? 'generate'

  const toneMap: Record<string, string> = {
    professional:   'Write in a professional, authoritative tone suitable for industry practitioners.',
    conversational: 'Write in a warm, conversational tone accessible to a broad audience.',
    technical:      'Write in a deeply technical tone targeting ML engineers and AI researchers.',
    inspirational:  'Write in an inspirational, visionary tone that motivates readers.',
  }

  const enrichedPrompt = [
    `Topic: ${input.prompt}`,
    input.url ? `Target URL slug hint: ${input.url}` : '',
    `Mode: ${mode}`,
    `Tone: ${toneMap[tone]}`,
    `Length: ${length} (see guardrails for word counts)`,
    input.context ? `Additional context:\n${input.context}` : '',
    input.exclude ? `Do NOT mention or include: ${input.exclude}` : '',
  ]
    .filter(Boolean)
    .join('\n\n')

  const maxTokens = LENGTH_TOKENS[length] ?? 4500

  const result = await runAgent(config, systemPrompt, guardrails, {
    ...input,
    prompt: enrichedPrompt,
    maxTokens,
  })

  // Parse the JSON output
  let parsed: Partial<ArticleGeneratorOutput>
  try {
    const cleaned = result.text
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/```\s*$/, '')
      .trim()
    parsed = JSON.parse(cleaned)
  } catch {
    // Fallback: treat raw text as article content
    parsed = {
      title: input.prompt,
      content: result.text,
      sections: [{ title: '', content: result.text }],
    }
  }

  const title            = (parsed.title            ?? input.prompt).slice(0, 200)
  const slug             = (parsed.slug             ?? '').toLowerCase().replace(/[^a-z0-9-]/g, '') || ''
  const summary          = (parsed.summary          ?? '').slice(0, 300)
  const content          = parsed.content           ?? result.text
  const sections         = Array.isArray(parsed.sections) ? parsed.sections : []
  const seoTitle         = (parsed.seoTitle         ?? title).slice(0, 60)
  const seoDescription   = (parsed.seoDescription   ?? summary).slice(0, 160)
  const seoKeywords      = parsed.seoKeywords       ?? ''
  const ogTitle          = (parsed.ogTitle          ?? seoTitle).slice(0, 70)
  const ogDescription    = (parsed.ogDescription    ?? seoDescription).slice(0, 200)
  const twitterTitle     = (parsed.twitterTitle     ?? ogTitle).slice(0, 70)
  const twitterDescription = (parsed.twitterDescription ?? ogDescription).slice(0, 200)
  const tags             = Array.isArray(parsed.tags) ? parsed.tags.slice(0, 10) : []

  return {
    ...result,
    title,
    slug,
    summary,
    content,
    sections,
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
