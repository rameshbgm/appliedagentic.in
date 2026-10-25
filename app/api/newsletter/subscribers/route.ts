import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiError } from '@/lib/utils'

export async function GET(req: Request) {
  if (!await auth()) return apiError('Unauthorized', 401)
  const rows = await prisma.newsletterSubscriber.findMany({ where: { unsubscribedAt: null }, orderBy: { createdAt: 'desc' } })
  const origin = new URL(req.url).origin
  const cell = (value: string) => `"${(/^[=+@-]/.test(value) ? `'${value}` : value).replace(/"/g, '""')}"`
  const csv = ['email,subscribed_at,source,unsubscribe_url', ...rows.map((s) => [s.email, s.createdAt.toISOString(), s.source, `${origin}/unsubscribe?token=${s.token}`].map(cell).join(','))].join('\r\n')
  return new Response(csv, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="subscribers.csv"', 'Cache-Control': 'no-store' } })
}
