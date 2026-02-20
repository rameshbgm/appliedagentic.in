// app/api/submenus/[id]/route.ts
import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/slugify'
import { apiSuccess, apiError } from '@/lib/utils'
import { z } from 'zod'

const UpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  slug: z.string().optional(),
  menuId: z.number().int().optional(),
  description: z.string().optional().nullable(),
  order: z.number().int().optional(),
  isVisible: z.boolean().optional(),
})

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, ctx: RouteContext) {
  try {
    const { id } = await ctx.params
    const subMenu = await prisma.navSubMenu.findUnique({
      where: { id: parseInt(id) },
      include: {
        menu: { select: { id: true, title: true, slug: true } },
        articles: {
          orderBy: { orderIndex: 'asc' },
          include: {
            article: {
              select: {
                id: true, title: true, slug: true, summary: true,
                status: true, publishedAt: true, readingTimeMinutes: true, viewCount: true,
              },
            },
          },
        },
        _count: { select: { articles: true } },
      },
    })
    if (!subMenu) return apiError('Sub-menu not found', 404)
    return apiSuccess(subMenu)
  } catch (err) {
    console.error('[GET /api/submenus/:id]', err)
    return apiError('Failed to fetch sub-menu', 500)
  }
}

export async function PUT(req: NextRequest, ctx: RouteContext) {
  const session = await auth()
  if (!session) return apiError('Unauthorized', 401)

  try {
    const { id } = await ctx.params
    const body = await req.json()
    const data = UpdateSchema.parse(body)

    if (data.title && !data.slug) {
      data.slug = slugify(data.title)
    }

    if (data.slug) {
      const existing = await prisma.navSubMenu.findFirst({
        where: { slug: data.slug, id: { not: parseInt(id) } },
      })
      if (existing) return apiError('Slug already in use', 409)
    }

    const subMenu = await prisma.navSubMenu.update({
      where: { id: parseInt(id) },
      data,
      include: {
        menu: { select: { id: true, title: true, slug: true } },
        _count: { select: { articles: true } },
      },
    })
    return apiSuccess(subMenu)
  } catch (err) {
    if (err instanceof z.ZodError) return apiError(err.issues[0].message, 422)
    console.error('[PUT /api/submenus/:id]', err)
    return apiError('Failed to update sub-menu', 500)
  }
}

export async function DELETE(_req: NextRequest, ctx: RouteContext) {
  const session = await auth()
  if (!session) return apiError('Unauthorized', 401)

  try {
    const { id } = await ctx.params
    await prisma.navSubMenu.delete({ where: { id: parseInt(id) } })
    return apiSuccess({ deleted: true })
  } catch (err) {
    console.error('[DELETE /api/submenus/:id]', err)
    return apiError('Failed to delete sub-menu', 500)
  }
}
