// app/api/media/upload/route.ts
import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { saveFile, validateFileSize, validateMimeType, getMediaType } from '@/lib/storage'
import { apiSuccess, apiError } from '@/lib/utils'
import { logger } from '@/lib/logger'

export async function POST(req: NextRequest) {
  logger.debug('[POST /api/media/upload] request received')

  const session = await auth()
  if (!session) {
    logger.debug('[POST /api/media/upload] unauthorized — no session')
    return apiError('Unauthorized', 401)
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const altText = formData.get('altText') as string | null
    const subDir = (formData.get('subDir') as string) || 'images'

    logger.debug('[POST /api/media/upload] file received', {
      name: file?.name,
      type: file?.type,
      size: file?.size,
      subDir,
    })

    if (!file) return apiError('No file provided', 422)

    const mimeTypeValidation = validateMimeType(file.type)
    if (!mimeTypeValidation.valid) {
      logger.warn(`[POST /api/media/upload] invalid mime type: ${file.type}`)
      return apiError(mimeTypeValidation.error!, 422)
    }

    const sizeValidation = validateFileSize(file.size)
    if (!sizeValidation.valid) {
      logger.warn(`[POST /api/media/upload] file too large: ${file.size} bytes`)
      return apiError(sizeValidation.error!, 422)
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    logger.debug(`[POST /api/media/upload] saving file to subDir="${subDir}", UPLOAD_DIR="${process.env.UPLOAD_DIR ?? '(not set — using ./public/uploads)'}"`)

    const { url, filename, sizeBytes } = await saveFile({ buffer, mimeType: file.type, subDir })
    logger.debug(`[POST /api/media/upload] file saved: url=${url} filename=${filename} size=${sizeBytes}`)

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
        logger.debug(`[POST /api/media/upload] image dimensions: ${width}x${height}`)
      } catch {
        logger.debug('[POST /api/media/upload] dimension detection skipped')
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

    logger.debug(`[POST /api/media/upload] DB record created id=${asset.id}`)
    return apiSuccess(asset, 201)
  } catch (err) {
    return apiError('Upload failed', 500, err)
  }
}
