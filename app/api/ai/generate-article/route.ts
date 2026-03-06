// app/api/ai/generate-article/route.ts
import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { apiSuccess, apiError } from '@/lib/utils'
import { runArticleGenerator } from '@/agents/article-generator/agent'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return apiError('Unauthorized', 401)

  try {
    const body = await req.json()
    const {
      prompt,
      context,
      mode = 'generate',
      tone = 'professional',
      length = 'medium',
      url,
      exclude,
    } = body

    if (!prompt?.trim()) return apiError('Article topic is required', 422)

    const result = await runArticleGenerator({
      prompt,
      context,
      mode,
      tone,
      length,
      url,
      exclude,
    })

    return apiSuccess({
      title:               result.title,
      slug:                result.slug,
      summary:             result.summary,
      content:             result.content,
      sections:            result.sections,
      seoTitle:            result.seoTitle,
      seoDescription:      result.seoDescription,
      seoKeywords:         result.seoKeywords,
      ogTitle:             result.ogTitle,
      ogDescription:       result.ogDescription,
      twitterTitle:        result.twitterTitle,
      twitterDescription:  result.twitterDescription,
      tags:                result.tags,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Article generation failed'
    return apiError(`[POST /api/ai/generate-article] ${message}`, 500, err)
  }
}
