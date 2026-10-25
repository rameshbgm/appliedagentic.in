// app/(public)/topics/[id]/page.tsx — a topic: articles grouped by subject
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { notFound } from 'next/navigation'
import StopList from '@/components/transit/StopList'
import { formatJourney, plural } from '@/lib/transit'
import Link from 'next/link'
import type { Metadata } from 'next'

interface Props { params: Promise<{ id: string }> }

export const revalidate = 60

export async function generateStaticParams() {
  try {
    const topics = await prisma.topic.findMany({ where: { isPublished: true }, select: { slug: true } })
    return topics.map((t) => ({ id: t.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { id } = await params
    const topic = await prisma.topic.findUnique({ where: { slug: id } })
    if (!topic) return {}
    return { title: topic.name, description: topic.description ?? undefined }
  } catch (err) {
    logger.error('[generateMetadata /topics/[id]]', err)
    return {}
  }
}

export default async function TopicDetailPage({ params }: Props) {
  const { id } = await params
  let topic
  try {
    topic = await prisma.topic.findUnique({
      where: { slug: id, isPublished: true },
      include: {
        module: { select: { id: true, name: true, slug: true, color: true, icon: true } },
        topicArticles: {
          where: { article: { status: 'PUBLISHED' } },
          orderBy: { orderIndex: 'asc' },
          include: {
            article: {
              include: {
                coverImage: { select: { url: true } },
                articleTags: { include: { tag: { select: { name: true } } } },
                topicArticles: {
                  take: 1,
                  include: {
                    topic: { select: { module: { select: { name: true, color: true } } } },
                  },
                },
              },
            },
          },
        },
      },
    })
  } catch (err) {
    logger.error(`[GET /topics/${id}] DB error loading topic`, err)
    throw err
  }

  if (!topic) notFound()

  const stops = topic.topicArticles.map(({ article: a }) => ({
    id: a.id,
    slug: a.slug,
    title: a.title,
    summary: a.summary,
    minutes: a.readingTimeMinutes,
    publishedAt: a.publishedAt,
    imageUrl: a.coverImage?.url,
    tags: a.articleTags.map((t) => t.tag.name),
  }))
  const minutes = stops.reduce((s, a) => s + (a.minutes ?? 0), 0)
  const color = topic.module?.color ?? topic.color ?? 'var(--l2)'

  return (
    <div style={{ '--c': color } as React.CSSProperties}>
      <header className="tr-band tr-band--soft">
        <div className="tr-wrap tr-band__inner">
          <nav className="tr-crumbs" aria-label="Breadcrumb">
            <Link href="/">Network</Link><span aria-hidden="true">›</span>
            {topic.module && (<><span>{topic.module.name}</span><span aria-hidden="true">›</span></>)}
            <span>Topic</span>
          </nav>
          <h1 className="tr-display">{topic.name}</h1>
          {topic.description && <p style={{ color: 'var(--ink-2)' }}>{topic.description}</p>}
          <div className="tr-band__stats">
            <span>{plural(stops.length, 'stop')}</span>
            {minutes > 0 && <span>{formatJourney(minutes)} ride</span>}
          </div>
        </div>
      </header>

      <div className="tr-wrap" style={{ paddingBottom: 48 }}>
        <section className="tr-zone" aria-label="Articles in this topic">
          {stops.length > 0 ? (
            <StopList stops={stops} showThumbs />
          ) : (
            <div className="tr-empty">
              <h2>No stops yet</h2>
              <p>Articles for this topic are on their way.</p>
              <Link href="/" className="tr-btn tr-btn--primary">Back to the network map</Link>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
