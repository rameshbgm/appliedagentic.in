// app/api/media/crop/route.ts
// Crops (and optionally resizes) an existing media asset using sharp.
// Returns a new MediaAsset record with the cropped image stored in DB.
import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { prepareAsset } from '@/lib/storage'
import { apiSuccess, apiError } from '@/lib/utils'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return apiError('Unauthorized', 401)

  try {
    const body = await req.json()
    const {
      mediaAssetId,
      // Crop region as percentages (0–100) of the natural image size
      x,
      y,
      width,
      height,
      // Optional output dimensions (px); omit to keep cropped size
      outputWidth,
      outputHeight,
    } = body as {
      mediaAssetId: number
      x: number
      y: number
      width: number
      height: number
      outputWidth?: number
      outputHeight?: number
    }

    if (!mediaAssetId || width <= 0 || height <= 0) {
      return apiError('mediaAssetId, width and height are required', 422)
    }

    // Load the original asset record including its binary data
    const asset = await prisma.mediaAsset.findUnique({ where: { id: mediaAssetId } })
    if (!asset) return apiError('Media asset not found', 404)
    if (!asset.mimeType || !asset.url) return apiError('Asset is missing required fields', 422)
    if (!asset.mimeType.startsWith('image/')) return apiError('Only images can be cropped', 422)
    if (!asset.data) return apiError('Asset binary data not found in database', 404)

    const buffer = Buffer.from(asset.data)

    // Use sharp to crop (and optionally resize)
    const sharp = (await import('sharp')).default

    // Get natural image dimensions
    const meta = await sharp(buffer).metadata()
    const naturalWidth = meta.width ?? 1
    const naturalHeight = meta.height ?? 1

    // Convert % crop to px
    const left   = Math.round((x / 100)     * naturalWidth)
    const top    = Math.round((y / 100)      * naturalHeight)
    const cropW  = Math.round((width / 100)  * naturalWidth)
    const cropH  = Math.round((height / 100) * naturalHeight)

    let pipeline = sharp(buffer).extract({ left, top, width: cropW, height: cropH })

    if (outputWidth || outputHeight) {
      pipeline = pipeline.resize(outputWidth ?? undefined, outputHeight ?? undefined, {
        fit: 'cover',
        position: 'centre',
      })
    }

    // Determine output format: keep as webp for quality/size or preserve original
    const outputMime: string = ['image/png', 'image/webp'].includes(asset.mimeType) ? asset.mimeType : 'image/jpeg'
    let outBuffer: Buffer
    if (outputMime === 'image/png') {
      outBuffer = await pipeline.png().toBuffer()
    } else if (outputMime === 'image/webp') {
      outBuffer = await pipeline.webp().toBuffer()
    } else {
      outBuffer = await pipeline.jpeg({ quality: 90 }).toBuffer()
    }

    // Get dimensions of the cropped output
    const newMeta = await sharp(outBuffer).metadata()

    // Generate URL/filename without writing to disk
    const subDir = asset.url.includes('/ai/') ? 'ai' : 'images'
    const { url: newUrl, filename: newFilename } = prepareAsset({ mimeType: outputMime, subDir })

    const userId = parseInt((session.user as { id: string }).id)
    const newAsset = await prisma.mediaAsset.create({
      data: {
        filename: newFilename,
        url: newUrl,
        data: new Uint8Array(outBuffer) as Uint8Array<ArrayBuffer>,
        type: 'IMAGE',
        mimeType: outputMime,
        altText: asset.altText,
        width: newMeta.width ?? null,
        height: newMeta.height ?? null,
        sizeBytes: outBuffer.length,
        aiPrompt: asset.aiPrompt ? `[cropped] ${asset.aiPrompt}` : null,
        createdByUserId: userId,
      },
    })

    return apiSuccess({ url: newUrl, mediaAssetId: newAsset.id })
  } catch (err) {
    return apiError('Crop failed', 500, err)
  }
}
