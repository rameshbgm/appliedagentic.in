// app/api/tags/route.ts
import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/slugify'
import { apiSuccess, apiError } from '@/lib/utils'

export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { articleTags: true } } },
    })
    return apiSuccess(tags)
  } catch (err) {
    return apiError('Failed to fetch tags', 500, err)
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return apiError('Unauthorized', 401)

  try {
    const { name } = await req.json()
    if (!name) return apiError('Tag name is required', 422)

    const slug = slugify(name)
    const tag = await prisma.tag.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
    })
    return apiSuccess(tag, 201)
  } catch (err) {
    return apiError('Failed to create tag', 500, err)
  }
}
