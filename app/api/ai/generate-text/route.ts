// app/api/ai/generate-text/route.ts
import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { getOpenAIClient, getAIConfig } from '@/lib/openai'
import { prisma } from '@/lib/prisma'
import { apiSuccess, apiError } from '@/lib/utils'
import { z } from 'zod'

const SYSTEM_PROMPTS: Record<string, string> = {
  professional: 'You are an expert AI writer creating professional, authoritative content for the Applied Agentic AI knowledge platform. Write clearly and precisely.',
  conversational: 'You are a friendly AI writer creating engaging, conversational content that connects with readers personally. Use accessible language and relatable examples.',
  technical: 'You are a senior AI/ML engineer writing deeply technical content for practitioners. Include precise terminology, code examples where relevant, and implementation details.',
  inspirational: 'You are a visionary AI thought leader writing inspirational content that motivates readers to embrace agentic AI. Use powerful language and compelling narratives.',
}

const LENGTH_TOKENS: Record<string, number> = {
  short: 150,
  medium: 400,
  long: 800,
}

const MODE_INSTRUCTIONS: Record<string, string> = {
  generate: 'Generate new content based on the prompt.',
  expand: 'Expand and enrich the provided text with more detail, examples, and depth.',
  summarize: 'Create a concise, accurate summary of the provided text.',
  rewrite: 'Rewrite the provided text to improve clarity, flow, and impact.',
  outline: 'Create a detailed outline with headings and subpoints for the provided topic.',
  improve: 'Improve the grammar, clarity, and readability of the provided text.',
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
      model: reqModel,
      temperature: reqTemp,
      maxTokens: reqMaxTokens,
      systemPrompt: customSystemPrompt,
      articleId,
    } = body

    if (!prompt) return apiError('Prompt is required', 422)

    const config = await getAIConfig()
    const openai = getOpenAIClient()

    const model = reqModel || config.textModel
    const temperature = reqTemp ?? config.temperature
    const maxTokens = reqMaxTokens || LENGTH_TOKENS[length] || config.maxTokens

    const systemPrompt = customSystemPrompt ||
      `${SYSTEM_PROMPTS[tone] || SYSTEM_PROMPTS.professional}\n\nInstruction: ${MODE_INSTRUCTIONS[mode] || MODE_INSTRUCTIONS.generate}`

    const userMessage = context
      ? `Context:\n${context}\n\n---\n\n${prompt}`
      : prompt

    const completion = await openai.chat.completions.create({
      model,
      temperature,
      max_tokens: maxTokens,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
    })

    const text = completion.choices[0]?.message?.content || ''

    // Log AI usage
    const userId = parseInt((session.user as { id: string }).id)
    await prisma.aIUsageLog.create({
      data: {
        userId,
        articleId: articleId || null,
        type: 'TEXT_GENERATION',
        model,
        inputTokens: completion.usage?.prompt_tokens,
        outputTokens: completion.usage?.completion_tokens,
        promptSnippet: prompt.slice(0, 200),
        status: 'success',
      },
    }).catch(() => {}) // Non-blocking

    return apiSuccess({ text })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'AI text generation failed'
    return apiError(`[POST /api/ai/generate-text] ${message}`, 500, err)
  }
}
