import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { apiError, apiSuccess } from '@/lib/utils'

const Subscription = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  source: z.enum(['footer', 'homepage']).default('homepage'),
})

export async function POST(req: NextRequest) {
  let body: unknown
  try { body = await req.json() } catch { return apiError('Enter a valid email address.', 400) }
  const parsed = Subscription.safeParse(body)
  if (!parsed.success) return apiError('Enter a valid email address.', 422)
  try {
    await prisma.newsletterSubscriber.upsert({
      where: { email: parsed.data.email },
      create: parsed.data,
      update: { unsubscribedAt: null },
    })
    return apiSuccess({ subscribed: true })
  } catch (err) {
    return apiError('We could not save your subscription. Please try again.', 503, err)
  }
}
