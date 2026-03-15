// app/api/ai/summarize/route.ts
// Public (no auth) — called from ArticleReaderTools to summarize article content
import { NextRequest } from 'next/server'
import { apiSuccess, apiError } from '@/lib/utils'
import { runSummarizer } from '@/agents/summarizer/agent'

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

    const plainText = htmlToText(content).slice(0, 12000)

    const isSection = type === 'section'
    const targetPoints = Number(maxPoints) || (isSection ? 3 : 7)

    const result = await runSummarizer({
      prompt: isSection
        ? `Summarize the following section content into exactly 3 sharp bullet points.`
        : `Summarize the following article into exactly 7 insightful bullet points that capture the full scope of the content.`,
      context: plainText,
      scope: isSection ? 'section' : 'article',
      maxTokens: targetPoints * 60,
    })

    const bullets = result.bullets.slice(0, targetPoints)

    return apiSuccess({ bullets })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Summarization failed'
    return apiError(`[POST /api/ai/summarize] ${message}`, 500, err)
  }
}
