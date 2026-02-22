// app/(admin)/articles/new/page.tsx
export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import ArticleEditorPage from '../ArticleEditorPage'

export const metadata: Metadata = { title: 'New Article' }

export default async function NewArticlePage() {
  const [menus, tags] = await Promise.all([
    prisma.navMenu.findMany({
      orderBy: { order: 'asc' },
      select: {
        id: true,
        title: true,
        subMenus: { orderBy: { order: 'asc' }, select: { id: true, title: true, menuId: true } },
      },
    }),
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
        tagNames: [],
        subMenuIds: [],
      }}
      menus={menus}
      allTags={tags}
    />
  )
}
