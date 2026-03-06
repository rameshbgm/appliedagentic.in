// agents/article-generator/agent.ts
// Full Article Generator — generates a complete article with SEO, sections, and tags.
// SERVER-SIDE ONLY.

import { runAgent } from '../base'
import { config } from './config'
import { systemPrompt } from './system-prompt'
import { guardrails } from './guardrails'
import type { AgentInput, AgentOutput } from '../types'

export type ArticleTone =
  | 'professional' | 'conversational' | 'technical' | 'inspirational'
  | 'analytical' | 'storytelling' | 'journalistic' | 'academic'
  | 'casual' | 'persuasive' | 'educational' | 'humorous'
  | 'empathetic' | 'authoritative' | 'friendly' | 'concise'
  | 'thought-provoking' | 'motivational' | 'critical' | 'beginner-friendly'
  | 'research-focused' | 'visionary' | 'pragmatic' | 'narrative'
  | 'investigative'

export type ArticleLength = 'short' | 'medium' | 'long' | 'extra-long' | 'comprehensive'

export type ArticleFormat =
  | 'article' | 'listicle' | 'how-to' | 'tutorial'
  | 'deep-dive' | 'quick-read' | 'case-study' | 'comparison'

export interface ArticleGeneratorInput extends AgentInput {
  /** Article topic or title brief */
  prompt: string
  /** Additional user context or notes */
  context?: string
  /** Generation mode */
  mode?: 'generate' | 'outline' | 'expand'
  /** Tone of voice */
  tone?: ArticleTone
  /** Article length */
  length?: ArticleLength
  /** Article format */
  format?: ArticleFormat
  /** Target URL / slug hint */
  url?: string
  /** Content to explicitly exclude */
  exclude?: string
  /** Pre-fetched reference content from URLs and attachments */
  referenceContent?: string
  /** Exact number of sections to generate (default: AI decides, 3–8) */
  sectionCount?: number
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
  short:         2500,
  medium:        4500,
  long:          7000,
  'extra-long':  10000,
  comprehensive: 14000,
}

const TONE_MAP: Record<ArticleTone, string> = {
  professional:      'Write in a professional, authoritative tone for industry practitioners.',
  conversational:    'Write in a warm, conversational tone accessible to a broad audience.',
  technical:         'Write in a deeply technical tone targeting ML engineers and AI researchers. Include code examples.',
  inspirational:     'Write in an inspirational, visionary tone that motivates readers.',
  analytical:        'Write with analytical rigour — data-driven, logical, and evidence-based.',
  storytelling:      'Use narrative storytelling to make concepts vivid and memorable.',
  journalistic:      'Write as a journalist would — factual, concise, inverted-pyramid structure.',
  academic:          'Write in an academic style — precise, well-cited (hedged), and thorough.',
  casual:            'Write in a relaxed, casual style like explaining to a friend.',
  persuasive:        'Write persuasively — build a case, use compelling evidence, and motivate action.',
  educational:       'Write like a teacher — step-by-step, clear explanations with examples.',
  humorous:          'Inject wit and humour while keeping the content informative.',
  empathetic:        'Write with empathy — acknowledge challenges and make readers feel understood.',
  authoritative:     'Write as the definitive expert — no hedging, clear stances.',
  friendly:          'Write in a warm, encouraging, approachable style.',
  concise:           'Be maximally concise — every sentence must earn its place.',
  'thought-provoking': 'Ask provocative questions and challenge assumptions to spark deep thinking.',
  motivational:      'Write to inspire action — use energy, positivity, and call-to-action language.',
  critical:          'Apply critical thinking — examine assumptions, counter-arguments, and trade-offs.',
  'beginner-friendly': 'Write for complete beginners — no jargon, analogies first, build up gradually.',
  'research-focused':  'Focus on research insights — summarise studies, trends, and findings.',
  visionary:         'Paint a bold future vision — think 5–10 years ahead.',
  pragmatic:         'Focus on practical, actionable advice — readers should be able to implement immediately.',
  narrative:         'Tell the story of the topic — characters, conflict, resolution.',
  investigative:     'Dig deep — question the surface, uncover nuances, expose hidden complexity.',
}

const FORMAT_MAP: Record<string, string> = {
  article:     'Standard long-form article with introduction, body sections, and conclusion.',
  listicle:    'Listicle format — numbered or bulleted list as the primary structure (e.g. "10 Ways to...").',
  'how-to':    'How-to guide — step-by-step instructions with numbered steps.',
  tutorial:    'Hands-on tutorial — practical walkthrough with code examples and screenshots described.',
  'deep-dive': 'Deep-dive — exhaustive exploration of every angle of the topic.',
  'quick-read': 'Quick-read — punchy, scannable, under 600 words, key points only.',
  'case-study': 'Case study format — problem, approach, solution, results, lessons learned.',
  comparison:  'Comparison article — side-by-side evaluation of two or more options.',
}

/**
 * Run the Full Article Generator agent.
 *
 * @example
 * const article = await runArticleGenerator({
 *   prompt: 'Building a ReAct Agent with LangChain',
 *   tone: 'technical',
 *   length: 'medium',
 *   format: 'tutorial',
 * })
 */
export async function runArticleGenerator(
  input: ArticleGeneratorInput,
): Promise<ArticleGeneratorOutput> {
  const tone   = input.tone   ?? 'professional'
  const length = input.length ?? 'medium'
  const mode   = input.mode   ?? 'generate'
  const format = input.format ?? 'article'

  const toneInstruction   = TONE_MAP[tone as ArticleTone]   ?? TONE_MAP.professional
  const formatInstruction = FORMAT_MAP[format] ?? FORMAT_MAP.article

  const enrichedPrompt = [
    `Topic: ${input.prompt}`,
    input.url ? `Target URL slug hint: ${input.url}` : '',
    `Mode: ${mode}`,
    `Format: ${formatInstruction}`,
    `Tone: ${toneInstruction}`,
    `Length: ${length} (see guardrails for word counts)`,
    input.sectionCount ? `Sections: Generate EXACTLY ${input.sectionCount} sections. No more, no fewer.` : '',
    input.context ? `Additional context from user:\n${input.context}` : '',
    input.referenceContent
      ? `REFERENCE MATERIAL (from URLs/attachments — use this as source material and inspiration, do NOT copy verbatim):\n---\n${input.referenceContent.slice(0, 12000)}\n---`
      : '',
    input.exclude ? `EXCLUDE — Do NOT mention, reference, or include any of the following:\n${input.exclude}` : '',
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
