import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { apiError, apiSuccess } from '@/lib/utils'

export async function POST(req: NextRequest) {
  let body: unknown
  try { body = await req.json() } catch { return apiError('Invalid unsubscribe link.', 400) }
  const parsed = z.object({ token: z.string().uuid() }).safeParse(body)
  if (!parsed.success) return apiError('Invalid unsubscribe link.', 422)
  try {
    const result = await prisma.newsletterSubscriber.updateMany({
      where: { token: parsed.data.token }, data: { unsubscribedAt: new Date() },
    })
    if (!result.count) return apiError('This unsubscribe link was not found.', 404)
    return apiSuccess({ unsubscribed: true })
  } catch (err) { return apiError('Could not unsubscribe. Please try again.', 503, err) }
}
