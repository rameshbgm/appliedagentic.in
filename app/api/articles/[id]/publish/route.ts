// app/api/articles/[id]/publish/route.ts
import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiSuccess, apiError } from '@/lib/utils'
import { ArticleStatus } from '@prisma/client'
import { z } from 'zod'

const PublishSchema = z.object({
  action: z.enum(['publish', 'unpublish', 'archive']),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return apiError('Unauthorized', 401)

  try {
    const body = await req.json()
    const { action } = PublishSchema.parse(body)
    const id = parseInt((await params).id)

    let updateData: Record<string, unknown> = {}

    switch (action) {
      case 'publish':
        updateData = { status: ArticleStatus.PUBLISHED, publishedAt: new Date() }
        break
      case 'unpublish':
        updateData = { status: ArticleStatus.DRAFT }
        break
      case 'archive':
        updateData = { status: ArticleStatus.ARCHIVED }
        break
    }

    const article = await prisma.article.update({
      where: { id },
      data: updateData,
      select: { id: true, status: true, publishedAt: true },
    })

    return apiSuccess(article)
  } catch (err) {
    if (err instanceof z.ZodError) return apiError(err.issues[0].message, 422)
    return apiError('Failed to update article status', 500, err)
  }
}
