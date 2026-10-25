// app/uploads/[...path]/route.ts
// Serves user-uploaded media from the database (MediaAsset.data column).
// Images/audio are stored as LONGBLOB in MySQL — no filesystem required.
// URL format: /uploads/{subDir}/{filename}
// Supports HTTP Range requests so browsers can seek audio/video and read duration.

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseMediaRange } from '@/lib/media-range'
import { readDevelopmentMedia } from '@/lib/dev-media'

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
  req: Request,
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

    if (asset && !asset.data) {
      const remote = await readDevelopmentMedia(assetUrl, req.headers.get('range'))
      if (remote) {
        if (!remote.range) return new NextResponse('Range Not Satisfiable', { status: 416, headers: { 'Content-Range': `bytes */${remote.size}` } })
        const partial = req.headers.has('range')
        return new NextResponse(remote.data, { status: partial ? 206 : 200, headers: {
          'Content-Type': asset.mimeType || 'application/octet-stream',
          'Content-Length': String(remote.data.length), 'Accept-Ranges': 'bytes',
          'Cache-Control': 'public, max-age=31536000, immutable',
          ...(partial ? { 'Content-Range': `bytes ${remote.range.start}-${remote.range.end}/${remote.size}` } : {}),
        } })
      }
    }

    if (!asset || !asset.data) {
      return new NextResponse('Not found', { status: 404 })
    }

    const ext = '.' + (asset.filename.split('.').pop() ?? '').toLowerCase()
    const contentType = asset.mimeType ?? CONTENT_TYPES[ext] ?? 'application/octet-stream'

    // Copy into a fresh Buffer so the body has a non-shared, offset-0 ArrayBuffer.
    // Prisma v6 returns Uint8Array<ArrayBuffer> which may reference a pooled/shared
    // buffer — passing it directly to NextResponse can cause a silent 500.
    const body = Buffer.from(asset.data as Uint8Array)
    const totalBytes = body.length

    // ── Range request support (required for audio/video seeking + duration) ──
    const rangeHeader = req.headers.get('range')
    if (rangeHeader) {
      const range = parseMediaRange(rangeHeader, totalBytes)
      if (!range) {
        return new NextResponse('Range Not Satisfiable', {
          status: 416,
          headers: { 'Content-Range': `bytes */${totalBytes}` },
        })
      }
      const { start, end } = range
      const chunk = body.subarray(start, end + 1)
      return new NextResponse(chunk, {
        status: 206,
        headers: {
          'Content-Type':   contentType,
          'Content-Length': String(chunk.length),
          'Content-Range':  `bytes ${start}-${end}/${totalBytes}`,
          'Accept-Ranges':  'bytes',
          'Cache-Control':  'public, max-age=31536000, immutable',
        },
      })
    }

    // ── Full response ──────────────────────────────────────────────────────
    return new NextResponse(body, {
      headers: {
        'Content-Type':   contentType,
        'Content-Length': String(totalBytes),
        'Accept-Ranges':  'bytes',
        'Cache-Control':  'public, max-age=31536000, immutable',
      },
    })
  } catch (err) {
    console.error('[uploads] Error serving media:', err)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
