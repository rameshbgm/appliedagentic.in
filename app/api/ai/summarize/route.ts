// app/api/ai/summarize/route.ts
// Public (no auth) — called from ArticleReaderTools to summarize article content
import { NextRequest } from 'next/server'
import { getOpenAIClient, getAIConfig } from '@/lib/openai'
import { apiSuccess, apiError } from '@/lib/utils'
import { ARTICLE_SUMMARY_SYSTEM_PROMPT } from '@/content/prompts/article-summary'

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
    const { content } = body as { content?: string }

    if (!content || content.trim().length < 50) {
      return apiError('Article content is too short to summarize', 422)
    }

    const plainText = htmlToText(content).slice(0, 12000) // keep within context window

    const config = await getAIConfig()
    const openai = getOpenAIClient()

    const completion = await openai.chat.completions.create({
      model: config.textModel,
      temperature: 0.4,
      max_tokens: 600,
      messages: [
        { role: 'system', content: ARTICLE_SUMMARY_SYSTEM_PROMPT },
        { role: 'user',   content: `Article content:\n\n${plainText}` },
      ],
    })

    const raw = completion.choices[0]?.message?.content ?? ''

    // Parse "• line" format into a string array, filter empty
    const bullets = raw
      .split('\n')
      .map((l) => l.replace(/^[•\-\*]\s*/, '').trim())
      .filter(Boolean)
      .slice(0, 10)

    return apiSuccess({ bullets })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Summarization failed'
    return apiError(`[POST /api/ai/summarize] ${message}`, 500, err)
  }
}
