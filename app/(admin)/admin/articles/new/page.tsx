// app/(admin)/articles/new/page.tsx
export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import ArticleEditorPage from '../ArticleEditorPage'

export const metadata: Metadata = { title: 'New Article' }

export default async function NewArticlePage() {
  const [modules, topics, tags] = await Promise.all([
    prisma.module.findMany({ orderBy: { order: 'asc' }, select: { id: true, name: true } }),
    prisma.topic.findMany({ orderBy: { order: 'asc' }, select: { id: true, name: true, moduleId: true } }),
    prisma.tag.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
  ])

  return (
    <ArticleEditorPage
      initialArticle={{
        title: '',
        slug: '',
        summary: '',
        content: '',
        status: 'DRAFT',
        coverImageUrl: '',
        seoTitle: '',
        seoDescription: '',
        topicIds: [],
        tagNames: [],
      }}
      modules={modules}
      topics={topics}
      allTags={tags}
    />
  )
}
