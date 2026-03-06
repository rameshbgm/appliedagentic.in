// app/api/ai/generate-seo/route.ts
// Generates comprehensive SEO metadata (title, description, keywords, OG, Twitter tags)
// using the seo-optimizer agent. No database writes — data is returned for the editor.
import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { apiSuccess, apiError } from '@/lib/utils'
import { runSeoOptimizer } from '@/agents/seo-optimizer/agent'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return apiError('Unauthorized', 401)

  try {
    const body = await req.json()
    const { prompt, context } = body

    if (!prompt) return apiError('Prompt is required', 422)

    const result = await runSeoOptimizer({ prompt, context })

    return apiSuccess({
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
    const message = err instanceof Error ? err.message : 'SEO generation failed'
    return apiError(`[POST /api/ai/generate-seo] ${message}`, 500, err)
  }
}
