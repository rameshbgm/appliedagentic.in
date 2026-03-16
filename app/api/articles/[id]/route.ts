// app/api/articles/[id]/route.ts
import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/slugify'
import { calculateReadingTime } from '@/lib/readingTime'
import { apiSuccess, apiError } from '@/lib/utils'
import { invalidateCache } from '@/lib/cache'
import { articleDetailInclude } from '@/lib/article-includes'
import { z } from 'zod'
import { ArticleStatus, Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'

const SectionInput = z.object({
  id: z.number().int().optional(),
  title: z.string().default(''),
  content: z.string().default(''),
  audioUrl: z.string().optional().nullable(),
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

// ── Helpers ──────────────────────────────────────────────────────────────

function parseId(raw: string): number | null {
  const n = parseInt(raw, 10)
  return isNaN(n) ? null : n
}

/** Returns true if the Prisma error means "record not found". */
function isNotFound(err: unknown): boolean {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025'
}

// ── GET ──────────────────────────────────────────────────────────────────

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = parseId((await params).id)
    if (!id) return apiError('Invalid article ID', 400)

    const session = await auth()

    const article = await prisma.article.findFirst({
      where: {
        id,
        ...(!session ? { status: ArticleStatus.PUBLISHED } : {}),
      },
      include: articleDetailInclude,
    })

    if (!article) return apiError('Article not found', 404)

    // Increment view count for published articles on public access (fire-and-forget)
    if (!session && article.status === ArticleStatus.PUBLISHED) {
      prisma.article.update({ where: { id }, data: { viewCount: { increment: 1 } } }).catch(() => {})
    }

    return apiSuccess(article)
  } catch (err) {
    return apiError('Failed to fetch article', 500, err)
  }
}

// ── PUT ──────────────────────────────────────────────────────────────────

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return apiError('Unauthorized', 401)

  const id = parseId((await params).id)
  if (!id) return apiError('Invalid article ID', 400)

  let body: unknown
  try { body = await req.json() } catch { return apiError('Invalid JSON body', 400) }

  try {
    const data = UpdateSchema.parse(body)

    if (data.title && !data.slug) data.slug = slugify(data.title)

    // Check slug uniqueness if changing
    if (data.slug) {
      const existing = await prisma.article.findFirst({
        where: { slug: data.slug, NOT: { id } },
        select: { id: true },
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

    // Partial save = no sections. Returns minimal data, skips heavy JOINs.
    const isPartial = data.sections === undefined

    // Fetch current slug for revalidation BEFORE the transaction — avoids a
    // post-transaction query and is needed even if the slug itself isn't changing.
    const currentSlug = (await prisma.article.findUnique({ where: { id }, select: { slug: true } }))?.slug

    const article = await prisma.$transaction(async (tx) => {
      if (data.topicIds !== undefined) {
        await tx.topicArticle.deleteMany({ where: { articleId: id } })
        if (data.topicIds.length > 0) {
          await tx.topicArticle.createMany({
            data: data.topicIds.map((topicId, i) => ({ topicId, articleId: id, orderIndex: i })),
          })
        }
      }

      if (resolvedTagIds !== undefined) {
        await tx.articleTag.deleteMany({ where: { articleId: id } })
        if (resolvedTagIds.length > 0) {
          await tx.articleTag.createMany({
            data: resolvedTagIds.map((tagId) => ({ articleId: id, tagId })),
          })
        }
      }

      if (data.subMenuIds !== undefined) {
        await tx.subMenuArticle.deleteMany({ where: { articleId: id } })
        if (data.subMenuIds.length > 0) {
          await tx.subMenuArticle.createMany({
            data: data.subMenuIds.map((subMenuId, i) => ({
              subMenuId, articleId: id, orderIndex: i + 1,
            })),
          })
        }
      }

      if (data.menuIds !== undefined) {
        await tx.menuArticle.deleteMany({ where: { articleId: id } })
        if (data.menuIds.length > 0) {
          await tx.menuArticle.createMany({
            data: data.menuIds.map((menuId, i) => ({
              menuId, articleId: id, orderIndex: i + 1,
            })),
          })
        }
      }

      // Sync sections — upsert by ID to keep section IDs stable for background audio jobs.
      if (data.sections !== undefined) {
        const keptIds = data.sections
          .map((s) => s.id)
          .filter((sid): sid is number => sid != null)

        await tx.articleSection.deleteMany({
          where: {
            articleId: id,
            ...(keptIds.length > 0 ? { id: { notIn: keptIds } } : {}),
          },
        })

        for (const [i, s] of data.sections.entries()) {
          if (s.id != null) {
            await tx.articleSection.updateMany({
              where: { id: s.id, articleId: id },
              data: {
                title: s.title,
                content: s.content,
                order: s.order ?? i,
                ...(s.audioUrl !== undefined && { audioUrl: s.audioUrl }),
              },
            })
          } else {
            await tx.articleSection.create({
              data: {
                articleId: id,
                title: s.title,
                content: s.content,
                audioUrl: s.audioUrl ?? null,
                order: s.order ?? i,
              },
            })
          }
        }
      }

      const updateData = {
        ...(data.title && { title: data.title }),
        ...(data.slug && { slug: data.slug }),
        ...(data.summary !== undefined && { summary: data.summary }),
        ...(data.content !== undefined && { content: data.content }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.isFeatured !== undefined && { isFeatured: data.isFeatured }),
        ...(resolvedCoverImageId !== undefined && (
          resolvedCoverImageId === null
            ? { coverImage: { disconnect: true } }
            : { coverImage: { connect: { id: resolvedCoverImageId } } }
        )),
        ...(data.audioUrl !== undefined && { audioUrl: data.audioUrl }),
        ...(readingTime !== undefined && { readingTimeMinutes: readingTime }),
        ...(data.publishedAt !== undefined
          ? { publishedAt: data.publishedAt ? new Date(data.publishedAt) : null }
          : (data.status === ArticleStatus.PUBLISHED ? { publishedAt: new Date() } : {})
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
      }

      if (isPartial) {
        await tx.article.update({ where: { id }, data: updateData })
        return null
      }

      return tx.article.update({
        where: { id },
        data: updateData,
        include: articleDetailInclude,
      })
    }, { timeout: 30000 })

    // ── Revalidation (only when public-facing content changed) ────────────
    const needsArticleRevalidate = !isPartial ||
      data.title !== undefined || data.slug !== undefined ||
      data.status !== undefined || data.coverImageUrl !== undefined

    if (needsArticleRevalidate) {
      const slug = data.slug ?? currentSlug
      if (slug) revalidatePath(`/articles/${slug}`)
    }

    if (data.subMenuIds !== undefined || data.menuIds !== undefined) {
      const subMenuLinks = await prisma.subMenuArticle.findMany({
        where: { articleId: id },
        select: { subMenu: { select: { slug: true, menu: { select: { slug: true } } } } },
      })
      for (const { subMenu } of subMenuLinks) {
        revalidatePath(`/${subMenu.menu.slug}/${subMenu.slug}`)
        revalidatePath(`/${subMenu.menu.slug}`)
      }
    }

    invalidateCache('articles', 'articles-list', `article-${id}`)

    return apiSuccess(isPartial ? { id } : article)
  } catch (err) {
    if (err instanceof z.ZodError) return apiError(err.issues[0].message, 422)
    if (isNotFound(err)) return apiError('Article not found', 404)
    return apiError('Failed to update article', 500, err)
  }
}

// ── DELETE ────────────────────────────────────────────────────────────────

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return apiError('Unauthorized', 401)

  try {
    const id = parseId((await params).id)
    if (!id) return apiError('Invalid article ID', 400)

    // Fetch slug + submenu paths for post-delete revalidation
    const article = await prisma.article.findUnique({
      where: { id },
      select: {
        slug: true,
        subMenuArticles: {
          select: { subMenu: { select: { slug: true, menu: { select: { slug: true } } } } },
        },
      },
    })

    if (!article) return apiError('Article not found', 404)

    await prisma.article.delete({ where: { id } })

    revalidatePath(`/articles/${article.slug}`)
    for (const { subMenu } of article.subMenuArticles) {
      revalidatePath(`/${subMenu.menu.slug}/${subMenu.slug}`)
      revalidatePath(`/${subMenu.menu.slug}`)
    }

    invalidateCache('articles', 'articles-list', `article-${id}`)

    return apiSuccess({ deleted: true })
  } catch (err) {
    if (isNotFound(err)) return apiError('Article not found', 404)
    return apiError('Failed to delete article', 500, err)
  }
}
