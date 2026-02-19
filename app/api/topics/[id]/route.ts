// app/api/topics/[id]/route.ts
import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/slugify'
import { apiSuccess, apiError } from '@/lib/utils'
import { z } from 'zod'

const UpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  slug: z.string().optional(),
  moduleId: z.number().int().optional(),
  shortDescription: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  coverImage: z.string().optional(),
  orderIndex: z.number().int().optional(),
  isPublished: z.boolean().optional(),
})

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const topic = await prisma.topic.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        module: { select: { id: true, title: true, slug: true, color: true, orderIndex: true, icon: true } },
        topicArticles: {
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
        _count: { select: { topicArticles: true } },
      },
    })
    if (!topic) return apiError('Topic not found', 404)
    return apiSuccess(topic)
  } catch (err) {
    return apiError('Failed to fetch topic', 500)
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return apiError('Unauthorized', 401)
  try {
    const body = await req.json()
    const data = UpdateSchema.parse(body)
    if (data.title && !data.slug) data.slug = slugify(data.title)

    const topic = await prisma.topic.update({
      where: { id: parseInt(params.id) },
      data,
      include: { module: { select: { id: true, title: true, slug: true, color: true, orderIndex: true, icon: true } } },
    })
    return apiSuccess(topic)
  } catch (err) {
    if (err instanceof z.ZodError) return apiError(err.errors[0].message, 422)
    return apiError('Failed to update topic', 500)
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return apiError('Unauthorized', 401)
  try {
    await prisma.topic.delete({ where: { id: parseInt(params.id) } })
    return apiSuccess({ deleted: true })
  } catch (err) {
    return apiError('Failed to delete topic', 500)
  }
}
