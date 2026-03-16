// app/api/articles/[id]/publish/route.ts
import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiSuccess, apiError } from '@/lib/utils'
import { invalidateCache } from '@/lib/cache'
import { ArticleStatus, Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const PublishSchema = z.object({
  action: z.enum(['publish', 'unpublish', 'archive']),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return apiError('Unauthorized', 401)

  const id = parseInt((await params).id, 10)
  if (isNaN(id)) return apiError('Invalid article ID', 400)

  let body: unknown
  try { body = await req.json() } catch { return apiError('Invalid JSON body', 400) }

  try {
    const { action } = PublishSchema.parse(body)

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
      select: { id: true, slug: true, status: true, publishedAt: true },
    })

    // Revalidate the article page and list after status change
    revalidatePath(`/articles/${article.slug}`)
    revalidatePath('/articles')
    invalidateCache('articles', 'articles-list', `article-${id}`)

    return apiSuccess(article)
  } catch (err) {
    if (err instanceof z.ZodError) return apiError(err.issues[0].message, 422)
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return apiError('Article not found', 404)
    }
    return apiError('Failed to update article status', 500, err)
  }
}
