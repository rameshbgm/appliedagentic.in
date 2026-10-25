import type { Prisma } from '@prisma/client'

export function positiveInteger(value: string | null, fallback: number, max = Number.MAX_SAFE_INTEGER): number {
  const parsed = Number(value)
  return Number.isSafeInteger(parsed) && parsed > 0 ? Math.min(max, parsed) : fallback
}

export function searchWhere(query: string, moduleId?: number, topicId?: number): Prisma.ArticleWhereInput {
  const terms = query.trim().split(/\s+/).filter(Boolean).slice(0, 12)
  return {
    status: 'PUBLISHED',
    AND: terms.map((term) => ({ OR: [
      { title: { contains: term } },
      { summary: { contains: term } },
      { content: { contains: term } },
      { sections: { some: { content: { contains: term } } } },
      { articleTags: { some: { tag: { name: { contains: term } } } } },
      { subMenuArticles: { some: { subMenu: { title: { contains: term }, isVisible: true, menu: { isVisible: true } } } } },
    ] })),
    ...(topicId ? { topicArticles: { some: { topicId } } }
      : moduleId ? { topicArticles: { some: { topic: { moduleId } } } } : {}),
  }
}
