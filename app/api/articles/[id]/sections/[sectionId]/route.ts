// app/api/articles/[id]/sections/[sectionId]/route.ts
// PATCH — update a single section's title, content, and order.
// Intentionally excludes audioUrl so background audio jobs are not overwritten.
import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiSuccess, apiError } from '@/lib/utils'
import { invalidateCache } from '@/lib/cache'
import { z } from 'zod'

const PatchSchema = z.object({
  title:   z.string().default(''),
  content: z.string().default(''),
  order:   z.number().int().optional(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; sectionId: string }> }
) {
  const session = await auth()
  if (!session) return apiError('Unauthorized', 401)

  const { id, sectionId } = await params
  const articleId = parseInt(id, 10)
  const secId     = parseInt(sectionId, 10)
  if (isNaN(articleId) || isNaN(secId)) return apiError('Invalid id', 400)

  let body: unknown
  try { body = await req.json() } catch { return apiError('Invalid JSON body', 400) }

  try {
    const data = PatchSchema.parse(body)

    const updated = await prisma.articleSection.updateMany({
      where: { id: secId, articleId },
      data: {
        title:   data.title,
        content: data.content,
        ...(data.order !== undefined && { order: data.order }),
      },
    })

    if (updated.count === 0) return apiError('Section not found', 404)

    invalidateCache(`article-${articleId}`)

    return apiSuccess({ id: secId, ...data })
  } catch (err) {
    if (err instanceof z.ZodError) return apiError(err.issues[0].message, 422)
    return apiError('Failed to update section', 500, err)
  }
}
