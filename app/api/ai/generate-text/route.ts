// app/api/ai/generate-text/route.ts
import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { apiSuccess, apiError } from '@/lib/utils'
import { runContentWriter } from '@/agents/content-writer/agent'

const LENGTH_TOKENS: Record<string, number> = {
  short: 600,
  medium: 1200,
  long: 2500,
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return apiError('Unauthorized', 401)

  try {
    const body = await req.json()
    const {
      prompt,
      mode = 'generate',
      tone = 'professional',
      length = 'medium',
      context,
      maxTokens: reqMaxTokens,
      generateTitle = false,
    } = body

    if (!prompt) return apiError('Prompt is required', 422)

    // ── Content generation mode ──────────────────────────────────────────────
    const maxTokens = reqMaxTokens || LENGTH_TOKENS[length] || 1200

    if (generateTitle) {
      // Generate markdown content normally (content-writer system prompt enforces RAW MARKDOWN).
      // Then extract the first H1 heading (# ...) as the section title and return the rest
      // as the body. This avoids conflicting JSON/markdown instructions to the LLM.
      const result = await runContentWriter({
        prompt,
        context,
        tone: tone as 'professional' | 'conversational' | 'technical' | 'inspirational',
        maxTokens,
      })

      const markdown = result.text.trim()
      // Match a leading H1 heading: "# Title\n" or "# Title\r\n"
      const h1Match = markdown.match(/^#\s+(.+?)(?:\r?\n|$)/)
      if (h1Match) {
        const title   = h1Match[1].trim()
        // Remove the H1 line from the content so it isn't duplicated in the section body
        const content = markdown.slice(h1Match[0].length).trimStart()
        return apiSuccess({ text: content, title })
      }
      // No H1 found — return full markdown with no title
      return apiSuccess({ text: markdown, title: '' })
    }

    const result = await runContentWriter({
      prompt,
      context,
      tone: tone as 'professional' | 'conversational' | 'technical' | 'inspirational',
      maxTokens,
    })

    return apiSuccess({ text: result.text })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'AI text generation failed'
    return apiError(`[POST /api/ai/generate-text] ${message}`, 500, err)
  }
}
