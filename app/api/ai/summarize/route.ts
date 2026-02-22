// app/api/ai/summarize/route.ts
// Public (no auth) — called from ArticleReaderTools to summarize article content
import { NextRequest } from 'next/server'
import { getOpenAIClient, getAIConfig } from '@/lib/openai'
import { apiSuccess, apiError } from '@/lib/utils'
import { getArticleSummaryPrompt, getSectionSummaryPrompt } from '@/content/prompts/article-summary'

// Strip HTML tags and collapse whitespace to plain text
function htmlToText(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s{2,}/g, ' ')
    .trim()
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      content,
      maxPoints,
      type = 'article', // 'article' | 'section'
    } = body as { content?: string; maxPoints?: number; type?: 'article' | 'section' }

    if (!content || content.trim().length < 50) {
      return apiError('Article content is too short to summarize', 422)
    }

    // Defaults: section → 7 bullets, article → 12 bullets
    const defaultPoints = type === 'section' ? 7 : 12
    const points = Math.min(Math.max(Number(maxPoints) || defaultPoints, 3), 20)
    const plainText = htmlToText(content).slice(0, 12000) // keep within context window

    const config = await getAIConfig()
    const openai = getOpenAIClient()

    const systemPrompt = type === 'section'
      ? getSectionSummaryPrompt(points)
      : getArticleSummaryPrompt(points)

    const completion = await openai.chat.completions.create({
      model: config.textModel,
      temperature: 1,
      // Reasoning models (o-series) consume internal reasoning tokens before
      // visible output — budget must cover reasoning + actual response
      max_completion_tokens: Math.max(config.maxTokens, points * 200),
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: type === 'section'
            ? `Section content:\n\n${plainText}`
            : `Article content:\n\n${plainText}` },
      ],
    })

    const raw = completion.choices[0]?.message?.content ?? ''

    // Parse "• line" format into a string array, filter empty
    const bullets = raw
      .split('\n')
      .map((l) => l.replace(/^[•\-\*]\s*/, '').trim())
      .filter(Boolean)
      .slice(0, points)

    return apiSuccess({ bullets })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Summarization failed'
    return apiError(`[POST /api/ai/summarize] ${message}`, 500, err)
  }
}
