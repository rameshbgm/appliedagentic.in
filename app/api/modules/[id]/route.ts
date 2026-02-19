// app/api/modules/[id]/route.ts
import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/slugify'
import { apiSuccess, apiError } from '@/lib/utils'
import { z } from 'zod'

const UpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  slug: z.string().optional(),
  shortDescription: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  coverImage: z.string().optional(),
  orderIndex: z.number().int().optional(),
  isPublished: z.boolean().optional(),
})

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const module = await prisma.module.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        topics: {
          orderBy: { orderIndex: 'asc' },
          include: { _count: { select: { topicArticles: true } } },
        },
        _count: { select: { topics: true } },
      },
    })
    if (!module) return apiError('Module not found', 404)
    return apiSuccess(module)
  } catch (err) {
    return apiError('Failed to fetch module', 500)
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return apiError('Unauthorized', 401)
  try {
    const body = await req.json()
    const data = UpdateSchema.parse(body)
    if (data.title && !data.slug) data.slug = slugify(data.title)

    const module = await prisma.module.update({
      where: { id: parseInt(params.id) },
      data,
    })
    return apiSuccess(module)
  } catch (err) {
    if (err instanceof z.ZodError) return apiError(err.errors[0].message, 422)
    return apiError('Failed to update module', 500)
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return apiError('Unauthorized', 401)
  try {
    await prisma.module.delete({ where: { id: parseInt(params.id) } })
    return apiSuccess({ deleted: true })
  } catch (err) {
    return apiError('Failed to delete module', 500)
  }
}
