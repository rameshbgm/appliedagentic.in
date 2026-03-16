// lib/article-includes.ts — Shared Prisma include objects for article queries.
// Extracted from route files so they can be shared without violating
// Next.js route-module export restrictions.

/** Full include — detail views (editor, single article page). */
export const articleDetailInclude = {
  author: { select: { id: true, name: true, email: true } },
  topicArticles: {
    include: {
      topic: {
        include: {
          module: { select: { id: true, name: true, slug: true, color: true, order: true, icon: true } },
        },
      },
    },
    orderBy: { orderIndex: 'asc' as const },
  },
  articleTags: { include: { tag: true } },
  coverImage: { select: { id: true, url: true, altText: true, width: true, height: true } },
  subMenuArticles: { include: { subMenu: { select: { id: true, title: true, menu: { select: { id: true, title: true } } } } } },
  menuArticles: { include: { menu: { select: { id: true, title: true } } } },
  sections: { orderBy: { order: 'asc' as const } },
}

/** Lightweight include — list endpoints (admin table, public cards). */
export const articleListInclude = {
  author: { select: { id: true, name: true } },
  topicArticles: {
    take: 1,
    include: { topic: { select: { name: true, module: { select: { name: true, color: true } } } } },
    orderBy: { orderIndex: 'asc' as const },
  },
  articleTags: { include: { tag: { select: { id: true, name: true, slug: true } } } },
  coverImage: { select: { id: true, url: true } },
  subMenuArticles: { include: { subMenu: { select: { id: true, title: true, menu: { select: { id: true, title: true } } } } } },
  menuArticles: { include: { menu: { select: { id: true, title: true } } } },
  // Only fetch section IDs + audioUrl for list views (audio status indicator, no content)
  sections: { select: { id: true, audioUrl: true }, orderBy: { order: 'asc' as const } },
}
