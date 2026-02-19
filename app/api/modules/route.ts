// app/api/modules/route.ts
import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/slugify'
import { apiSuccess, apiError } from '@/lib/utils'
import { z } from 'zod'

const ModuleSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  coverImage: z.string().optional(),
  order: z.number().int().optional(),
  isPublished: z.boolean().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const includeTopics = searchParams.get('includeTopics') === 'true'
    const publishedOnly = searchParams.get('published') !== 'false'

    const modules = await prisma.module.findMany({
      where: publishedOnly ? { isPublished: true } : {},
      orderBy: { order: 'asc' },
      include: includeTopics
        ? {
            topics: {
              where: publishedOnly ? { isPublished: true } : {},
              orderBy: { order: 'asc' },
              include: { _count: { select: { topicArticles: true } } },
            },
            _count: { select: { topics: true } },
          }
        : { _count: { select: { topics: true } } },
    })
    return apiSuccess(modules)
  } catch (err) {
    console.error('[GET /api/modules]', err)
    return apiError('Failed to fetch modules', 500)
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return apiError('Unauthorized', 401)

  try {
    const body = await req.json()
    const data = ModuleSchema.parse(body)
    const slug = data.slug || slugify(data.name)

    const existing = await prisma.module.findUnique({ where: { slug } })
    if (existing) return apiError('Slug already in use', 409)

    const lastModule = await prisma.module.findFirst({ orderBy: { order: 'desc' } })
    const order = data.order ?? (lastModule?.order ?? 0) + 1

    const module = await prisma.module.create({
      data: { ...data, slug, order },
    })
    return apiSuccess(module, 201)
  } catch (err) {
    if (err instanceof z.ZodError) return apiError(err.errors[0].message, 422)
    console.error('[POST /api/modules]', err)
    return apiError('Failed to create module', 500)
  }
}
