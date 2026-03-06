// app/api/ai/generate-text/route.ts
import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
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
      articleId,
    } = body

    if (!prompt) return apiError('Prompt is required', 422)

    const userId = parseInt((session.user as { id: string }).id)

    // ── SEO mode: detected by a custom systemPrompt mentioning "SEO expert" ──
    const isSeoMode = typeof customSystemPrompt === 'string' &&
      customSystemPrompt.toLowerCase().includes('seo expert')

    if (isSeoMode) {
      const result = await runSeoOptimizer({ prompt, context })
      await prisma.aIUsageLog.create({
        data: {
          userId,
          articleId: articleId || null,
          type: 'TEXT_GENERATION',
          model: result.model,
          inputTokens:  result.usage?.inputTokens,
          outputTokens: result.usage?.outputTokens,
          promptSnippet: prompt.slice(0, 200),
          status: 'success',
        },
      }).catch(() => {})
      // Return as raw text so the editor can JSON.parse it
      return apiSuccess({ text: result.text })
    }

    // ── Content generation mode (default) — uses LangChain content-writer agent ──
    const maxTokens = reqMaxTokens || LENGTH_TOKENS[length] || 1200
    const result = await runContentWriter({
      prompt,
      context,
      tone: tone as 'professional' | 'conversational' | 'technical' | 'inspirational',
      maxTokens,
    })

    await prisma.aIUsageLog.create({
      data: {
        userId,
        articleId: articleId || null,
        type: 'TEXT_GENERATION',
        model: result.model,
        inputTokens:  result.usage?.inputTokens,
        outputTokens: result.usage?.outputTokens,
        promptSnippet: prompt.slice(0, 200),
        status: 'success',
      },
    }).catch(() => {})

    return apiSuccess({ text: result.text })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'AI text generation failed'
    return apiError(`[POST /api/ai/generate-text] ${message}`, 500, err)
  }
}
