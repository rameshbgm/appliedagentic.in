// app/api/submenus/route.ts
import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/slugify'
import { apiSuccess, apiError } from '@/lib/utils'
import { z } from 'zod'

const SubMenuSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().optional(),
  menuId: z.number().int(),
  description: z.string().optional(),
  order: z.number().int().optional(),
  isVisible: z.boolean().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const menuId = searchParams.get('menuId')
    const visibleOnly = searchParams.get('visible') !== 'false'

    const subMenus = await prisma.navSubMenu.findMany({
      where: {
        ...(visibleOnly ? { isVisible: true } : {}),
        ...(menuId ? { menuId: parseInt(menuId) } : {}),
      },
      orderBy: { order: 'asc' },
      include: {
        menu: { select: { id: true, title: true, slug: true } },
        _count: { select: { articles: true } },
      },
    })
    return apiSuccess(subMenus)
  } catch (err) {
    return apiError('Failed to fetch sub-menus', 500, err)
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return apiError('Unauthorized', 401)

  try {
    const body = await req.json()
    const data = SubMenuSchema.parse(body)
    const slug = data.slug || slugify(data.title)

    const existing = await prisma.navSubMenu.findUnique({ where: { slug } })
    if (existing) return apiError('Slug already in use', 409)

    const last = await prisma.navSubMenu.findFirst({
      where: { menuId: data.menuId },
      orderBy: { order: 'desc' },
    })
    const order = data.order ?? (last?.order ?? 0) + 1

    const subMenu = await prisma.navSubMenu.create({
      data: { ...data, slug, order },
      include: {
        menu: { select: { id: true, title: true, slug: true } },
        _count: { select: { articles: true } },
      },
    })
    return apiSuccess(subMenu, 201)
  } catch (err) {
    if (err instanceof z.ZodError) return apiError(err.issues[0].message, 422)
    return apiError('Failed to create sub-menu', 500, err)
  }
}
