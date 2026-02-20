// app/api/submenus/[id]/articles/route.ts
// Manage articles linked to a sub-menu
import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiSuccess, apiError } from '@/lib/utils'
import { z } from 'zod'

const LinkSchema = z.object({
  articleId: z.number().int(),
  orderIndex: z.number().int().optional(),
})

const BulkSchema = z.object({
  articleIds: z.array(z.number().int()),
})

type RouteContext = { params: Promise<{ id: string }> }

// GET articles for this sub-menu
export async function GET(_req: NextRequest, ctx: RouteContext) {
  try {
    const { id } = await ctx.params
    const items = await prisma.subMenuArticle.findMany({
      where: { subMenuId: parseInt(id) },
      orderBy: { orderIndex: 'asc' },
      include: {
        article: {
          select: {
            id: true, title: true, slug: true, summary: true,
            status: true, publishedAt: true, readingTimeMinutes: true, viewCount: true,
            articleTags: { include: { tag: { select: { id: true, name: true } } } },
          },
        },
      },
    })
    return apiSuccess(items)
  } catch (err) {
    console.error('[GET /api/submenus/:id/articles]', err)
    return apiError('Failed to fetch articles', 500)
  }
}

// POST – link a single article to this sub-menu
export async function POST(req: NextRequest, ctx: RouteContext) {
  const session = await auth()
  if (!session) return apiError('Unauthorized', 401)

  try {
    const { id } = await ctx.params
    const body = await req.json()
    const { articleId, orderIndex } = LinkSchema.parse(body)

    const subMenuId = parseInt(id)
    const existing = await prisma.subMenuArticle.findUnique({
      where: { subMenuId_articleId: { subMenuId, articleId } },
    })
    if (existing) return apiError('Article already linked', 409)

    const last = await prisma.subMenuArticle.findFirst({
      where: { subMenuId },
      orderBy: { orderIndex: 'desc' },
    })
    const idx = orderIndex ?? (last?.orderIndex ?? 0) + 1

    const link = await prisma.subMenuArticle.create({
      data: { subMenuId, articleId, orderIndex: idx },
    })
    return apiSuccess(link, 201)
  } catch (err) {
    if (err instanceof z.ZodError) return apiError(err.issues[0].message, 422)
    console.error('[POST /api/submenus/:id/articles]', err)
    return apiError('Failed to link article', 500)
  }
}

// PUT – bulk-set articles for this sub-menu (replace all)
export async function PUT(req: NextRequest, ctx: RouteContext) {
  const session = await auth()
  if (!session) return apiError('Unauthorized', 401)

  try {
    const { id } = await ctx.params
    const body = await req.json()
    const { articleIds } = BulkSchema.parse(body)
    const subMenuId = parseInt(id)

    await prisma.$transaction([
      prisma.subMenuArticle.deleteMany({ where: { subMenuId } }),
      ...articleIds.map((articleId, i) =>
        prisma.subMenuArticle.create({
          data: { subMenuId, articleId, orderIndex: i },
        })
      ),
    ])

    return apiSuccess({ updated: true })
  } catch (err) {
    if (err instanceof z.ZodError) return apiError(err.issues[0].message, 422)
    console.error('[PUT /api/submenus/:id/articles]', err)
    return apiError('Failed to update articles', 500)
  }
}

// DELETE – unlink a specific article
export async function DELETE(req: NextRequest, ctx: RouteContext) {
  const session = await auth()
  if (!session) return apiError('Unauthorized', 401)

  try {
    const { id } = await ctx.params
    const { searchParams } = new URL(req.url)
    const articleId = searchParams.get('articleId')
    if (!articleId) return apiError('articleId required', 400)

    await prisma.subMenuArticle.delete({
      where: {
        subMenuId_articleId: {
          subMenuId: parseInt(id),
          articleId: parseInt(articleId),
        },
      },
    })
    return apiSuccess({ deleted: true })
  } catch (err) {
    console.error('[DELETE /api/submenus/:id/articles]', err)
    return apiError('Failed to unlink article', 500)
  }
}
