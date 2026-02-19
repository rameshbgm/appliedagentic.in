// app/api/modules/reorder/route.ts
import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiSuccess, apiError } from '@/lib/utils'

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session) return apiError('Unauthorized', 401)
  try {
    const { items } = await req.json()
    // items: Array<{ id: number, orderIndex: number }>
    const updates = items.map(({ id, orderIndex }: { id: number; orderIndex: number }) =>
      prisma.module.update({ where: { id }, data: { orderIndex } })
    )
    await prisma.$transaction(updates)
    return apiSuccess({ reordered: true })
  } catch (err) {
    return apiError('Failed to reorder modules', 500)
  }
}
