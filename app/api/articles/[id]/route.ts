// app/api/articles/[id]/route.ts
import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/slugify'
import { calculateReadingTime } from '@/lib/readingTime'
import { apiSuccess, apiError } from '@/lib/utils'
import { z } from 'zod'
import { ArticleStatus } from '@prisma/client'
import { revalidatePath } from 'next/cache'

const SectionInput = z.object({
  id: z.number().int().optional(),
  title: z.string().default(''),
  content: z.string().default(''),
  order: z.number().int().default(0),
})

const UpdateSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  slug: z.string().optional(),
  summary: z.string().optional(),
  content: z.string().optional(),
  status: z.nativeEnum(ArticleStatus).optional(),
  topicIds: z.array(z.number().int()).optional(),
  tagIds: z.array(z.number().int()).optional(),
  tagNames: z.array(z.string()).optional(),
  coverImageId: z.number().int().optional().nullable(),
  coverImageUrl: z.string().optional(),
  readingTimeMinutes: z.number().int().optional().nullable(),
  isFeatured: z.boolean().optional(),
  publishedAt: z.string().optional().nullable(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.string().optional(),
  seoCanonicalUrl: z.string().optional(),
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
  ogImageUrl: z.string().optional(),
  twitterTitle: z.string().optional(),
  twitterDescription: z.string().optional(),
  aiContentDeclaration: z.string().optional(),
  audioUrl: z.string().optional().nullable(),
  subMenuIds: z.array(z.number().int()).optional(),
  menuIds: z.array(z.number().int()).optional(),
  sections: z.array(SectionInput).optional(),
})

const articleInclude = {
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

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = parseInt((await params).id)
    const session = await auth()

    const article = await prisma.article.findFirst({
      where: {
        id,
        ...(!session ? { status: ArticleStatus.PUBLISHED } : {}),
      },
      include: articleInclude,
    })

    if (!article) return apiError('Article not found', 404)

    // Increment view count for published articles on public access
    if (!session && article.status === ArticleStatus.PUBLISHED) {
      await prisma.article.update({
        where: { id },
        data: { viewCount: { increment: 1 } },
      })
    }

    return apiSuccess(article)
  } catch (err) {
    return apiError('Failed to fetch article', 500, err)
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return apiError('Unauthorized', 401)

  try {
    const id = parseInt((await params).id)
    const body = await req.json()
    const data = UpdateSchema.parse(body)

    if (data.title && !data.slug) data.slug = slugify(data.title)

    // Check slug uniqueness if changing
    if (data.slug) {
      const existing = await prisma.article.findFirst({
        where: { slug: data.slug, NOT: { id } },
      })
      if (existing) return apiError('Slug already in use', 409)
    }

    const readingTime = data.content
      ? (data.readingTimeMinutes ?? calculateReadingTime(data.content))
      : data.readingTimeMinutes

    // Resolve tagNames → tag IDs (upsert by slug)
    let resolvedTagIds: number[] | undefined = data.tagIds
    if (data.tagNames !== undefined) {
      if (data.tagNames.length > 0) {
        const tags = await Promise.all(
          data.tagNames.map((name) =>
            prisma.tag.upsert({
              where: { slug: slugify(name) },
              create: { name, slug: slugify(name) },
              update: {},
              select: { id: true },
            })
          )
        )
        resolvedTagIds = tags.map((t) => t.id)
      } else {
        resolvedTagIds = []
      }
    }

    // Resolve coverImageUrl → MediaAsset ID
    let resolvedCoverImageId: number | null | undefined = data.coverImageId
    if (data.coverImageUrl !== undefined && data.coverImageId === undefined) {
      if (data.coverImageUrl) {
        const media = await prisma.mediaAsset.findFirst({
          where: { url: data.coverImageUrl },
          select: { id: true },
        })
        resolvedCoverImageId = media?.id ?? undefined
      } else {
        resolvedCoverImageId = null
      }
    }

    const article = await prisma.$transaction(async (tx) => {
      // Update topic relationships if provided
      if (data.topicIds !== undefined) {
        await tx.topicArticle.deleteMany({ where: { articleId: id } })
        await tx.topicArticle.createMany({
          data: data.topicIds.map((topicId, i) => ({ topicId, articleId: id, orderIndex: i })),
        })
      }

      // Update tag relationships if provided
      if (resolvedTagIds !== undefined) {
        await tx.articleTag.deleteMany({ where: { articleId: id } })
        if (resolvedTagIds.length > 0) {
          await tx.articleTag.createMany({
            data: resolvedTagIds.map((tagId) => ({ articleId: id, tagId })),
          })
        }
      }

      // Update SubMenu associations if provided
      if (data.subMenuIds !== undefined) {
        await tx.subMenuArticle.deleteMany({ where: { articleId: id } })
        if (data.subMenuIds.length > 0) {
          await tx.subMenuArticle.createMany({
            data: data.subMenuIds.map((subMenuId, i) => ({
              subMenuId,
              articleId: id,
              orderIndex: i + 1,
            })),
          })
        }
      }

      // Update direct Menu associations if provided
      if (data.menuIds !== undefined) {
        await tx.menuArticle.deleteMany({ where: { articleId: id } })
        if (data.menuIds.length > 0) {
          await tx.menuArticle.createMany({
            data: data.menuIds.map((menuId, i) => ({
              menuId,
              articleId: id,
              orderIndex: i + 1,
            })),
          })
        }
      }

      // Sync sections if provided
      if (data.sections !== undefined) {
        await tx.articleSection.deleteMany({ where: { articleId: id } })
        if (data.sections.length > 0) {
          await tx.articleSection.createMany({
            data: data.sections.map((s, i) => ({
              articleId: id,
              title: s.title,
              content: s.content,
              order: s.order ?? i,
            })),
          })
        }
      }

      return tx.article.update({
        where: { id },
        data: {
          ...(data.title && { title: data.title }),
          ...(data.slug && { slug: data.slug }),
          ...(data.summary !== undefined && { summary: data.summary }),
          ...(data.content !== undefined && { content: data.content }),
          ...(data.status !== undefined && { status: data.status }),
          ...(data.isFeatured !== undefined && { isFeatured: data.isFeatured }),
          ...(resolvedCoverImageId !== undefined && { coverImageId: resolvedCoverImageId }),
          ...(data.audioUrl !== undefined && { audioUrl: data.audioUrl }),
          ...(readingTime !== undefined && { readingTimeMinutes: readingTime }),
          ...(data.publishedAt !== undefined
            ? { publishedAt: data.publishedAt ? new Date(data.publishedAt) : null }
            : (data.status === ArticleStatus.PUBLISHED
              ? { publishedAt: new Date() }
              : {})
          ),
          ...(data.seoTitle !== undefined && { seoTitle: data.seoTitle }),
          ...(data.seoDescription !== undefined && { seoDescription: data.seoDescription }),
          ...(data.seoKeywords !== undefined && { seoKeywords: data.seoKeywords }),
          ...(data.seoCanonicalUrl !== undefined && { seoCanonicalUrl: data.seoCanonicalUrl }),
          ...(data.ogTitle !== undefined && { ogTitle: data.ogTitle }),
          ...(data.ogDescription !== undefined && { ogDescription: data.ogDescription }),
          ...(data.ogImageUrl !== undefined && { ogImageUrl: data.ogImageUrl }),
          ...(data.twitterTitle !== undefined && { twitterTitle: data.twitterTitle }),
          ...(data.twitterDescription !== undefined && { twitterDescription: data.twitterDescription }),
          ...(data.aiContentDeclaration !== undefined && { aiContentDeclaration: data.aiContentDeclaration }),
          updatedBy: parseInt((session.user as { id: string }).id),
        },
        include: articleInclude,
      })
    })

    // Revalidate cached pages affected by this update.
    // Fetch the current submenu associations (after update) to get their paths.
    const subMenuLinks = await prisma.subMenuArticle.findMany({
      where: { articleId: id },
      select: {
        subMenu: {
          select: {
            slug: true,
            menu: { select: { slug: true } },
          },
        },
      },
    })
    revalidatePath(`/articles/${article.slug}`)
    revalidatePath('/articles')
    for (const { subMenu } of subMenuLinks) {
      revalidatePath(`/${subMenu.menu.slug}/${subMenu.slug}`)
      revalidatePath(`/${subMenu.menu.slug}`)
    }

    return apiSuccess(article)
  } catch (err) {
    if (err instanceof z.ZodError) return apiError(err.issues[0].message, 422)
    return apiError('Failed to update article', 500, err)
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return apiError('Unauthorized', 401)
  try {
    const id = parseInt((await params).id)

    // Fetch the article slug and its submenu paths before deleting so we can
    // revalidate the relevant statically-generated pages afterward.
    const article = await prisma.article.findUnique({
      where: { id },
      select: {
        slug: true,
        subMenuArticles: {
          select: {
            subMenu: {
              select: {
                slug: true,
                menu: { select: { slug: true } },
              },
            },
          },
        },
      },
    })

    await prisma.article.delete({ where: { id } })

    // Revalidate cached pages that referenced this article
    if (article) {
      revalidatePath(`/articles/${article.slug}`)
      revalidatePath('/articles')
      for (const { subMenu } of article.subMenuArticles) {
        revalidatePath(`/${subMenu.menu.slug}/${subMenu.slug}`)
        revalidatePath(`/${subMenu.menu.slug}`)
      }
    }

    return apiSuccess({ deleted: true })
  } catch (err) {
    return apiError('Failed to delete article', 500, err)
  }
}
