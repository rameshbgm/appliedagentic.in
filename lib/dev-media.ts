import type { PrismaClient } from '@prisma/client'
import { createPrismaClient } from './prisma-client.cjs'
import { parseMediaRange } from './media-range'

const state = globalThis as unknown as { devMedia?: PrismaClient }

// Read-only access to the original blobs for a local content snapshot. Range
// reads happen in SQL, so seeking never downloads an entire narration file.
export async function readDevelopmentMedia(url: string, rangeHeader: string | null) {
  if (process.env.NODE_ENV !== 'development' || !process.env.DEV_MEDIA_DATABASE_URL) return null
  if (!state.devMedia) {
    const source = new URL(process.env.DEV_MEDIA_DATABASE_URL)
    source.searchParams.set('connection_limit', '2')
    source.searchParams.set('pool_timeout', '60')
    state.devMedia = createPrismaClient({ url: source.toString() })
  }
  const rows = await state.devMedia.$queryRaw<{ size: bigint | null }[]>`SELECT OCTET_LENGTH(data) AS size FROM MediaAsset WHERE url = ${url}`
  const size = Number(rows[0]?.size ?? 0)
  if (!size) return null
  const range = rangeHeader ? parseMediaRange(rangeHeader, size) : { start: 0, end: size - 1 }
  if (!range) return { size, range: null, data: Buffer.alloc(0) }
  const chunks = await state.devMedia.$queryRaw<{ data: Uint8Array }[]>`SELECT SUBSTRING(data, ${range.start + 1}, ${range.end - range.start + 1}) AS data FROM MediaAsset WHERE url = ${url}`
  if (!chunks[0]?.data) return null
  return { size, range, data: Buffer.from(chunks[0].data) }
}
