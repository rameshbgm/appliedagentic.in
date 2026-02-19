// app/api/media/route.ts
import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiSuccess, apiError } from '@/lib/utils'
import { MediaType } from '@prisma/client'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return apiError('Unauthorized', 401)

  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') as MediaType | null
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: Record<string, unknown> = {}
    if (type) where.type = type
    if (search) where.filename = { contains: search }

    const [total, assets] = await prisma.$transaction([
      prisma.mediaAsset.count({ where }),
      prisma.mediaAsset.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ])

    return apiSuccess({ items: assets, total, page, limit, totalPages: Math.ceil(total / limit) })
  } catch (err) {
    return apiError('Failed to fetch media', 500)
  }
}
