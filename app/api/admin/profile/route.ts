// app/api/admin/profile/route.ts
import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiSuccess, apiError } from '@/lib/utils'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const ProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8).optional(),
})

export async function GET() {
  const session = await auth()
  if (!session) return apiError('Unauthorized', 401)

  try {
    const userId = parseInt((session.user as { id: string }).id)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true },
    })
    if (!user) return apiError('User not found', 404)
    return apiSuccess(user)
  } catch (err) {
    return apiError('Failed to fetch profile', 500, err)
  }
}

export async function PUT(req: NextRequest) {
  const session = await auth()
  if (!session) return apiError('Unauthorized', 401)

  try {
    const body = await req.json()
    const data = ProfileSchema.parse(body)
    const userId = parseInt((session.user as { id: string }).id)

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return apiError('User not found', 404)

    const updateData: Record<string, string> = {}

    if (data.name) updateData.name = data.name
    if (data.email) updateData.email = data.email

    if (data.newPassword) {
      if (!data.currentPassword) return apiError('Current password is required', 422)
      const valid = await bcrypt.compare(data.currentPassword, user.passwordHash)
      if (!valid) return apiError('Current password is incorrect', 401)
      updateData.passwordHash = await bcrypt.hash(data.newPassword, 12)
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, name: true, email: true, role: true },
    })

    return apiSuccess(updatedUser)
  } catch (err) {
    if (err instanceof z.ZodError) return apiError(err.issues[0].message, 422)
    return apiError('Failed to update profile', 500, err)
  }
}
