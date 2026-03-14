// app/uploads/[...path]/route.ts
// Serves user-uploaded media from the database (MediaAsset.data column).
// Images/audio are stored as LONGBLOB in MySQL — no filesystem required.
// URL format: /uploads/{subDir}/{filename}

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const CONTENT_TYPES: Record<string, string> = {
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png':  'image/png',
  '.webp': 'image/webp',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml; charset=utf-8',
  '.mp3':  'audio/mpeg',
  '.wav':  'audio/wav',
  '.ogg':  'audio/ogg',
  '.mp4':  'video/mp4',
  '.webm': 'audio/webm',
  '.pdf':  'application/pdf',
  '.txt':  'text/plain; charset=utf-8',
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: segments } = await params
    const rel = segments.join('/')
    const assetUrl = `/uploads/${rel}`

    // Lookup asset in DB by its stored URL
    const asset = await prisma.mediaAsset.findUnique({
      where: { url: assetUrl },
      select: { data: true, mimeType: true, filename: true },
    })

    if (!asset || !asset.data) {
      return new NextResponse('Not found', { status: 404 })
    }

    const ext = '.' + (asset.filename.split('.').pop() ?? '').toLowerCase()
    const contentType = asset.mimeType ?? CONTENT_TYPES[ext] ?? 'application/octet-stream'

    // Copy into a fresh Buffer so the body has a non-shared, offset-0 ArrayBuffer.
    // Prisma v6 returns Uint8Array<ArrayBuffer> which may reference a pooled/shared
    // buffer — passing it directly to NextResponse can cause a silent 500.
    const body = Buffer.from(asset.data as Uint8Array)

    return new NextResponse(body, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (err) {
    console.error('[uploads] Error serving media:', err)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
