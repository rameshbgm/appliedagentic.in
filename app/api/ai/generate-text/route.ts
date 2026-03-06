// app/api/ai/generate-text/route.ts
import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { apiSuccess, apiError } from '@/lib/utils'
import { runContentWriter } from '@/agents/content-writer/agent'
import { runSeoOptimizer }  from '@/agents/seo-optimizer/agent'

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
      systemPrompt: customSystemPrompt,
      generateTitle = false,
    } = body

    if (!prompt) return apiError('Prompt is required', 422)

    // ── SEO mode: detected by a custom systemPrompt mentioning "SEO expert" ──
    const isSeoMode = typeof customSystemPrompt === 'string' &&
      customSystemPrompt.toLowerCase().includes('seo expert')

    if (isSeoMode) {
      const result = await runSeoOptimizer({ prompt, context })
      // Return as raw text so the editor can JSON.parse it
      return apiSuccess({ text: result.text })
    }

    // ── Content generation mode ──────────────────────────────────────────────
    const maxTokens = reqMaxTokens || LENGTH_TOKENS[length] || 1200

    if (generateTitle) {
      // Ask the LLM to return JSON with both a section title and markdown content.
      // We prefix the prompt so the content-writer knows to produce JSON output.
      const titlePrompt = [
        `Generate a section title AND the full markdown content for the following topic.`,
        `Return ONLY valid JSON — no markdown fences, no extra text:`,
        `{"title": "<concise section heading, 3-8 words>", "content": "<full markdown content>"}`,
        ``,
        `Topic: ${prompt}`,
      ].join('\n')

      const result = await runContentWriter({
        prompt: titlePrompt,
        context,
        tone: tone as 'professional' | 'conversational' | 'technical' | 'inspirational',
        maxTokens,
      })

      // Try to parse JSON; fall back to raw text with no title
      try {
        const cleaned = result.text
          .replace(/^```(?:json)?\s*/i, '')
          .replace(/```\s*$/, '')
          .trim()
        const parsed: { title?: string; content?: string } = JSON.parse(cleaned)
        return apiSuccess({
          text:  parsed.content ?? result.text,
          title: parsed.title  ?? '',
        })
      } catch {
        return apiSuccess({ text: result.text, title: '' })
      }
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
