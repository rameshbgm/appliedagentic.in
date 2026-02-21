// app/api/menus/[id]/route.ts
import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/slugify'
import { apiSuccess, apiError } from '@/lib/utils'
import { z } from 'zod'

const UpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  slug: z.string().optional(),
  description: z.string().optional().nullable(),
  order: z.number().int().optional(),
  isVisible: z.boolean().optional(),
})

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, ctx: RouteContext) {
  try {
    const { id } = await ctx.params
    const menu = await prisma.navMenu.findUnique({
      where: { id: parseInt(id) },
      include: {
        subMenus: {
          orderBy: { order: 'asc' },
          include: { _count: { select: { articles: true } } },
        },
        _count: { select: { subMenus: true } },
      },
    })
    if (!menu) return apiError('Menu not found', 404)
    return apiSuccess(menu)
  } catch (err) {
    return apiError('Failed to fetch menu', 500, err)
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
      const existing = await prisma.navMenu.findFirst({
        where: { slug: data.slug, id: { not: parseInt(id) } },
      })
      if (existing) return apiError('Slug already in use', 409)
    }

    const menu = await prisma.navMenu.update({
      where: { id: parseInt(id) },
      data,
      include: { _count: { select: { subMenus: true } } },
    })
    return apiSuccess(menu)
  } catch (err) {
    if (err instanceof z.ZodError) return apiError(err.issues[0].message, 422)
    return apiError('Failed to update menu', 500, err)
  }
}

export async function DELETE(_req: NextRequest, ctx: RouteContext) {
  const session = await auth()
  if (!session) return apiError('Unauthorized', 401)

  try {
    const { id } = await ctx.params
    await prisma.navMenu.delete({ where: { id: parseInt(id) } })
    return apiSuccess({ deleted: true })
  } catch (err) {
    return apiError('Failed to delete menu', 500, err)
  }
}
