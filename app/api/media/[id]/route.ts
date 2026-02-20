// app/api/media/[id]/route.ts
import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { deleteFile } from '@/lib/storage'
import { apiSuccess, apiError } from '@/lib/utils'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return apiError('Unauthorized', 401)

  try {
    const asset = await prisma.mediaAsset.findUnique({ where: { id: parseInt((await params).id) } })
    if (!asset) return apiError('Media not found', 404)
    return apiSuccess(asset)
  } catch (err) {
    return apiError('Failed to fetch media', 500)
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return apiError('Unauthorized', 401)

  try {
    const { altText, caption } = await req.json()
    const asset = await prisma.mediaAsset.update({
      where: { id: parseInt((await params).id) },
      data: { altText, caption },
    })
    return apiSuccess(asset)
  } catch (err) {
    return apiError('Failed to update media', 500)
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return apiError('Unauthorized', 401)

  try {
    const asset = await prisma.mediaAsset.findUnique({ where: { id: parseInt((await params).id) } })
    if (!asset) return apiError('Media not found', 404)

    // Delete physical file
    await deleteFile(asset.url)

    // Delete DB record
    await prisma.mediaAsset.delete({ where: { id: parseInt((await params).id) } })

    return apiSuccess({ deleted: true })
  } catch (err) {
    return apiError('Failed to delete media', 500)
  }
}
