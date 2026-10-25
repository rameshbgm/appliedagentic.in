// app/(public)/topics/[id]/page.tsx — a topic: articles grouped by subject
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { notFound } from 'next/navigation'
import LessonList from '@/components/folio/LessonList'
import { formatJourney, plural } from '@/lib/catalog'
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

  const lessons = topic.topicArticles.map(({ article: a }) => ({
    id: a.id, slug: a.slug, title: a.title, summary: a.summary, minutes: a.readingTimeMinutes,
    imageUrl: a.coverImage?.url, tags: a.articleTags.map((t) => t.tag.name),
  }))
  const minutes = lessons.reduce((s, a) => s + (a.minutes ?? 0), 0)
  const color = topic.module?.color ?? topic.color ?? 'var(--accent)'

  return (
    <div style={{ '--c': color } as React.CSSProperties}>
      <header className="f-wrap f-opener">
        <nav className="f-crumbs" aria-label="Breadcrumb">
          <Link href="/">Front page</Link><span aria-hidden="true">/</span>
          {topic.module && (<><span>{topic.module.name}</span><span aria-hidden="true">/</span></>)}
          <span>Topic</span>
        </nav>
        <h1 className="f-display">{topic.name}</h1>
        {topic.description && <p className="f-dek">{topic.description}</p>}
        <div className="f-opener__stats">
          <span className="f-tag">{plural(lessons.length, 'essay')}</span>
          {minutes > 0 && <span className="f-tag">{formatJourney(minutes)} of reading</span>}
        </div>
      </header>
      <div className="f-wrap f-narrow" style={{ paddingBottom: 40 }}>
        {lessons.length > 0 ? <LessonList lessons={lessons} showThumbs /> : (
          <div className="f-empty"><h2>No essays yet</h2><p>Essays for this topic are on their way.</p><Link href="/" className="f-btn f-btn--ink">Front page</Link></div>
        )}
      </div>
    </div>
  )
}
