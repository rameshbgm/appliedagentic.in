// app/api/ai/generate-tags/route.ts
// Generates up to 10 relevant tags for an article using the tags-generator agent (Gemini by default).
// NOTE: No database write — tags are returned only for the editor to display.
import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { apiSuccess, apiError } from '@/lib/utils'
import { runTagsGenerator } from '@/agents/tags-generator/agent'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return apiError('Unauthorized', 401)

  try {
    const body = await req.json()
    const { prompt, context } = body

    if (!prompt) return apiError('Prompt is required', 422)

    const result = await runTagsGenerator({ prompt, context })

    return apiSuccess({ tags: result.tags })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Tag generation failed'
    return apiError(`[POST /api/ai/generate-tags] ${message}`, 500, err)
  }
}
