// app/api/ai/summarize/route.ts
// Public (no auth) — called by the article and section summary buttons
import { NextRequest } from 'next/server'
import { apiSuccess, apiError } from '@/lib/utils'
import { runSummarizer } from '@/agents/summarizer/agent'
import { z } from 'zod'

const SummaryInput = z.object({
  content: z.string().trim().min(50, 'Article content is too short to summarize').max(200000),
  type: z.enum(['article', 'section']).default('article'),
})

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
    const { content, type } = SummaryInput.parse(body)

    const plainText = htmlToText(content).slice(0, 12000)

    const isSection = type === 'section'
    const targetPoints = isSection ? 3 : 7

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
    if (err instanceof z.ZodError) return apiError(err.issues[0].message, 422)
    if (err instanceof SyntaxError) return apiError('Invalid JSON body', 400)
    const message = err instanceof Error ? err.message : 'Summarization failed'
    return apiError(`[POST /api/ai/summarize] ${message}`, 500, err)
  }
}
