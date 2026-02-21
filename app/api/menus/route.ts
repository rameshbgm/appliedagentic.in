// app/api/menus/route.ts
import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/slugify'
import { apiSuccess, apiError } from '@/lib/utils'
import { z } from 'zod'

const MenuSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().optional(),
  description: z.string().optional(),
  order: z.number().int().optional(),
  isVisible: z.boolean().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const includeSubMenus = searchParams.get('includeSubMenus') === 'true'
    const visibleOnly = searchParams.get('visible') !== 'false'

    const menus = await prisma.navMenu.findMany({
      where: visibleOnly ? { isVisible: true } : {},
      orderBy: { order: 'asc' },
      include: includeSubMenus
        ? {
            subMenus: {
              where: visibleOnly ? { isVisible: true } : {},
              orderBy: { order: 'asc' },
              include: { _count: { select: { articles: true } } },
            },
            _count: { select: { subMenus: true } },
          }
        : { _count: { select: { subMenus: true } } },
    })
    return apiSuccess(menus)
  } catch (err) {
    return apiError('Failed to fetch menus', 500, err)
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return apiError('Unauthorized', 401)

  try {
    const body = await req.json()
    const data = MenuSchema.parse(body)
    const slug = data.slug || slugify(data.title)

    const existing = await prisma.navMenu.findUnique({ where: { slug } })
    if (existing) return apiError('Slug already in use', 409)

    const last = await prisma.navMenu.findFirst({ orderBy: { order: 'desc' } })
    const order = data.order ?? (last?.order ?? 0) + 1

    const menu = await prisma.navMenu.create({
      data: { ...data, slug, order },
      include: { _count: { select: { subMenus: true } } },
    })
    return apiSuccess(menu, 201)
  } catch (err) {
    if (err instanceof z.ZodError) return apiError(err.issues[0].message, 422)
    return apiError('Failed to create menu', 500, err)
  }
}
