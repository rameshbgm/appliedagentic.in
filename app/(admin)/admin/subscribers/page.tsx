import Link from 'next/link'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Subscribers' }

export default async function SubscribersPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  if (!await auth()) redirect('/login')
  const query = await searchParams
  const page = Math.max(1, Number.parseInt(query.page || '1') || 1)
  const where = { unsubscribedAt: null }
  const [total, subscribers] = await prisma.$transaction([
    prisma.newsletterSubscriber.count({ where }),
    prisma.newsletterSubscriber.findMany({ where, orderBy: { createdAt: 'desc' }, take: 50, skip: (page - 1) * 50, select: { id: true, email: true, source: true, createdAt: true } }),
  ])
  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="tr-display text-3xl">Subscribers</h1><p>{total} active {total === 1 ? 'subscriber' : 'subscribers'}</p></div><a className="tr-btn" href="/api/newsletter/subscribers" download>Export CSV</a></div>
    <p>Subscriptions are saved here. Export this list to your email service to send updates. Each exported row includes an unsubscribe link.</p>
    {subscribers.length ? <div className="overflow-x-auto"><table className="w-full text-left"><thead><tr><th className="p-3">Email</th><th className="p-3">Subscribed</th><th className="p-3">Source</th></tr></thead><tbody>{subscribers.map((s) => <tr key={s.id} className="border-t"><td className="p-3">{s.email}</td><td className="p-3">{formatDate(s.createdAt, 'short')}</td><td className="p-3">{s.source}</td></tr>)}</tbody></table></div> : <p>No subscribers yet.</p>}
    <nav aria-label="Subscriber pages" className="flex gap-4">{page > 1 && <Link href={`?page=${page - 1}`} className="tr-btn">Previous</Link>}{page * 50 < total && <Link href={`?page=${page + 1}`} className="tr-btn">Next</Link>}</nav>
  </div>
}
