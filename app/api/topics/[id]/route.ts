// app/api/topics/[id]/route.ts
import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/slugify'
import { apiSuccess, apiError } from '@/lib/utils'
import { z } from 'zod'

const UpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  slug: z.string().optional(),
  moduleId: z.number().int().optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  coverImage: z.string().optional(),
  order: z.number().int().optional(),
  isPublished: z.boolean().optional(),
})

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const topic = await prisma.topic.findUnique({
      where: { id: parseInt((await params).id) },
      include: {
        module: { select: { id: true, name: true, slug: true, color: true, order: true, icon: true } },
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

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return apiError('Unauthorized', 401)
  try {
    const body = await req.json()
    const data = UpdateSchema.parse(body)
    if (data.name && !data.slug) data.slug = slugify(data.name)

    const topic = await prisma.topic.update({
      where: { id: parseInt((await params).id) },
      data,
      include: { module: { select: { id: true, name: true, slug: true, color: true, order: true, icon: true } } },
    })
    return apiSuccess(topic)
  } catch (err) {
    if (err instanceof z.ZodError) return apiError(err.issues[0].message, 422)
    return apiError('Failed to update topic', 500)
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return apiError('Unauthorized', 401)
  try {
    await prisma.topic.delete({ where: { id: parseInt((await params).id) } })
    return apiSuccess({ deleted: true })
  } catch (err) {
    return apiError('Failed to delete topic', 500)
  }
}
