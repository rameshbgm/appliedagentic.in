// app/(admin)/articles/[id]/edit/page.tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ArticleEditorPage from '../../ArticleEditorPage'

export const metadata: Metadata = { title: 'Edit Article' }

export default async function EditArticlePage({ params }: { params: { id: string } }) {
  const [article, modules, topics, tags] = await Promise.all([
    prisma.article.findUnique({
      where: { id: Number(params.id) },
      include: {
        topicArticles: { include: { topic: true } },
        articleTags: { include: { tag: true } },
      },
    }),
    prisma.module.findMany({ orderBy: { order: 'asc' }, select: { id: true, name: true } }),
    prisma.topic.findMany({ orderBy: { order: 'asc' }, select: { id: true, name: true, moduleId: true } }),
    prisma.tag.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
  ])

  if (!article) notFound()

  const firstTopic = article.topicArticles[0]?.topic
  const moduleId = firstTopic ? topics.find((t) => t.id === firstTopic.id)?.moduleId : undefined

  return (
    <ArticleEditorPage
      initialArticle={{
        id: article.id,
        title: article.title,
        slug: article.slug,
        summary: article.summary ?? '',
        content: article.content,
        status: article.status,
        scheduledAt: article.scheduledAt?.toISOString().slice(0, 16),
        coverImageUrl: article.coverImageUrl ?? '',
        seoTitle: article.seoTitle ?? '',
        seoDescription: article.seoDescription ?? '',
        audioUrl: article.audioUrl ?? undefined,
        topicIds: article.topicArticles.map((ta) => ta.topicId),
        tagNames: article.articleTags.map((at) => at.tag.name),
        moduleId,
      }}
      modules={modules}
      topics={topics}
      allTags={tags}
    />
  )
}
