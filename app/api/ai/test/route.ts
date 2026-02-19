// app/api/ai/test/route.ts
import { auth } from '@/lib/auth'
import { getOpenAIClient } from '@/lib/openai'
import { apiSuccess, apiError } from '@/lib/utils'

export async function POST() {
  const session = await auth()
  if (!session) return apiError('Unauthorized', 401)

  try {
    const openai = getOpenAIClient()
    await openai.models.list()
    return apiSuccess({ connected: true, message: 'OpenAI connection successful' })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Connection failed'
    return apiError(`OpenAI connection failed: ${message}`, 400)
  }
}
