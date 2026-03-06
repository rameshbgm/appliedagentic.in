// app/api/menus/[id]/articles/route.ts
// Manage articles linked directly to a top-level nav menu
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

// GET articles linked to this menu
export async function GET(_req: NextRequest, ctx: RouteContext) {
  try {
    const { id } = await ctx.params
    const items = await prisma.menuArticle.findMany({
      where: { menuId: parseInt(id) },
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
    return apiError('Failed to fetch articles', 500, err)
  }
}

// POST – link a single article to this menu
export async function POST(req: NextRequest, ctx: RouteContext) {
  const session = await auth()
  if (!session) return apiError('Unauthorized', 401)

  try {
    const { id } = await ctx.params
    const body = await req.json()
    const { articleId, orderIndex } = LinkSchema.parse(body)

    const menuId = parseInt(id)
    const existing = await prisma.menuArticle.findUnique({
      where: { menuId_articleId: { menuId, articleId } },
    })
    if (existing) return apiError('Article already linked', 409)

    const last = await prisma.menuArticle.findFirst({
      where: { menuId },
      orderBy: { orderIndex: 'desc' },
    })
    const idx = orderIndex ?? (last?.orderIndex ?? 0) + 1

    const link = await prisma.menuArticle.create({
      data: { menuId, articleId, orderIndex: idx },
    })
    return apiSuccess(link, 201)
  } catch (err) {
    if (err instanceof z.ZodError) return apiError(err.issues[0].message, 422)
    return apiError('Failed to link article', 500, err)
  }
}

// PUT – bulk-set articles for this menu (replace all)
export async function PUT(req: NextRequest, ctx: RouteContext) {
  const session = await auth()
  if (!session) return apiError('Unauthorized', 401)

  try {
    const { id } = await ctx.params
    const body = await req.json()
    const { articleIds } = BulkSchema.parse(body)
    const menuId = parseInt(id)

    await prisma.$transaction([
      prisma.menuArticle.deleteMany({ where: { menuId } }),
      ...articleIds.map((articleId, i) =>
        prisma.menuArticle.create({
          data: { menuId, articleId, orderIndex: i },
        })
      ),
    ])

    return apiSuccess({ updated: true })
  } catch (err) {
    if (err instanceof z.ZodError) return apiError(err.issues[0].message, 422)
    return apiError('Failed to update articles', 500, err)
  }
}

// DELETE – unlink a single article from this menu (?articleId=N)
export async function DELETE(req: NextRequest, ctx: RouteContext) {
  const session = await auth()
  if (!session) return apiError('Unauthorized', 401)

  try {
    const { id } = await ctx.params
    const { searchParams } = new URL(req.url)
    const articleIdStr = searchParams.get('articleId')
    if (!articleIdStr) return apiError('articleId is required', 422)

    const menuId = parseInt(id)
    const articleId = parseInt(articleIdStr)

    await prisma.menuArticle.delete({
      where: { menuId_articleId: { menuId, articleId } },
    })
    return apiSuccess({ deleted: true })
  } catch (err) {
    return apiError('Failed to unlink article', 500, err)
  }
}
