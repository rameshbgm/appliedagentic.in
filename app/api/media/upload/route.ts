// app/api/media/upload/route.ts
import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { saveFile, validateFileSize, validateMimeType, getMediaType } from '@/lib/storage'
import { apiSuccess, apiError } from '@/lib/utils'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return apiError('Unauthorized', 401)

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const altText = formData.get('altText') as string | null
    const subDir = (formData.get('subDir') as string) || 'images'

    if (!file) return apiError('No file provided', 422)

    const mimeTypeValidation = validateMimeType(file.type)
    if (!mimeTypeValidation.valid) return apiError(mimeTypeValidation.error!, 422)

    const sizeValidation = validateFileSize(file.size)
    if (!sizeValidation.valid) return apiError(sizeValidation.error!, 422)

    const buffer = Buffer.from(await file.arrayBuffer())
    const { url, filename, sizeBytes } = await saveFile({ buffer, mimeType: file.type, subDir })

    const mediaType = getMediaType(file.type)
    const userId = parseInt((session.user as { id: string }).id)

    // Try to get image dimensions for images
    let width: number | undefined
    let height: number | undefined
    if (mediaType === 'IMAGE') {
      try {
        const probeImageSize = await import('probe-image-size')
        const dims = await probeImageSize.default(buffer as unknown as NodeJS.ReadableStream)
        width = dims.width
        height = dims.height
      } catch {
        // Dimension detection failed; continue without
      }
    }

    const asset = await prisma.mediaAsset.create({
      data: {
        filename,
        url,
        type: mediaType,
        mimeType: file.type,
        altText: altText || null,
        width,
        height,
        sizeBytes,
        createdByUserId: userId,
      },
    })

    return apiSuccess(asset, 201)
  } catch (err) {
    return apiError('Upload failed', 500, err)
  }
}
