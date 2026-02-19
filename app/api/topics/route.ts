// app/api/topics/route.ts
import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/slugify'
import { apiSuccess, apiError } from '@/lib/utils'
import { z } from 'zod'

const TopicSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().optional(),
  moduleId: z.number().int(),
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
    const moduleId = searchParams.get('moduleId')
    const publishedOnly = searchParams.get('published') !== 'false'

    const topics = await prisma.topic.findMany({
      where: {
        ...(publishedOnly ? { isPublished: true } : {}),
        ...(moduleId ? { moduleId: parseInt(moduleId) } : {}),
      },
      orderBy: { order: 'asc' },
      include: {
        module: { select: { id: true, name: true, slug: true, color: true, order: true, icon: true } },
        _count: { select: { topicArticles: true } },
      },
    })
    return apiSuccess(topics)
  } catch (err) {
    return apiError('Failed to fetch topics', 500)
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return apiError('Unauthorized', 401)
  try {
    const body = await req.json()
    const data = TopicSchema.parse(body)
    const slug = data.slug || slugify(data.name)

    const existing = await prisma.topic.findUnique({ where: { slug } })
    if (existing) return apiError('Slug already in use', 409)

    const lastTopic = await prisma.topic.findFirst({
      where: { moduleId: data.moduleId },
      orderBy: { order: 'desc' },
    })
    const order = data.order ?? (lastTopic?.order ?? 0) + 1

    const topic = await prisma.topic.create({
      data: { ...data, slug, order },
      include: { module: { select: { id: true, name: true, slug: true, color: true, order: true, icon: true } } },
    })
    return apiSuccess(topic, 201)
  } catch (err) {
    if (err instanceof z.ZodError) return apiError(err.errors[0].message, 422)
    return apiError('Failed to create topic', 500)
  }
}
