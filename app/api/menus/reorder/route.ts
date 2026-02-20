// app/api/menus/reorder/route.ts
import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiSuccess, apiError } from '@/lib/utils'
import { z } from 'zod'

const ReorderSchema = z.object({
  items: z.array(z.object({ id: z.number(), order: z.number() })),
})

export async function PUT(req: NextRequest) {
  const session = await auth()
  if (!session) return apiError('Unauthorized', 401)

  try {
    const body = await req.json()
    const { items } = ReorderSchema.parse(body)

    await prisma.$transaction(
      items.map((item) =>
        prisma.navMenu.update({
          where: { id: item.id },
          data: { order: item.order },
        })
      )
    )
    return apiSuccess({ reordered: true })
  } catch (err) {
    if (err instanceof z.ZodError) return apiError(err.issues[0].message, 422)
    console.error('[PUT /api/menus/reorder]', err)
    return apiError('Failed to reorder menus', 500)
  }
}
