// lib/storage.ts
// File metadata helpers - binary data is now stored in the database (MediaAsset.data).
// Disk I/O has been removed. All image/audio bytes live in the DB LONGBLOB column.
import { nanoid } from 'nanoid'

const MAX_SIZE_MB = parseInt(process.env.MAX_UPLOAD_SIZE_MB ?? '10')

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
export const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm']
export const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_AUDIO_TYPES]

export function getMediaType(mimeType: string): 'IMAGE' | 'AUDIO' | 'OTHER' {
  if (ALLOWED_IMAGE_TYPES.includes(mimeType)) return 'IMAGE'
  if (ALLOWED_AUDIO_TYPES.includes(mimeType)) return 'AUDIO'
  return 'OTHER'
}

export function getExtension(mimeType: string): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/svg+xml': 'svg',
    'audio/mpeg': 'mp3',
    'audio/mp3': 'mp3',
    'audio/wav': 'wav',
    'audio/ogg': 'ogg',
  }
  return map[mimeType] || 'bin'
}

export function validateFileSize(sizeBytes: number): { valid: boolean; error?: string } {
  const maxBytes = MAX_SIZE_MB * 1024 * 1024
  if (sizeBytes > maxBytes) {
    return { valid: false, error: `File size exceeds ${MAX_SIZE_MB}MB limit` }
  }
  return { valid: true }
}

export function validateMimeType(mimeType: string): { valid: boolean; error?: string } {
  if (!ALLOWED_TYPES.includes(mimeType)) {
    return { valid: false, error: `File type ${mimeType} is not allowed` }
  }
  return { valid: true }
}

/**
 * Generate a stable virtual URL and filename for a DB-stored asset.
 * No disk writes occur - callers store the buffer in MediaAsset.data.
 */
export interface PreparedAsset {
  url: string
  filename: string
}

export function prepareAsset(opts: { mimeType: string; subDir?: string }): PreparedAsset {
  const { mimeType, subDir = 'images' } = opts
  const ext = getExtension(mimeType)
  const filename = `${Date.now()}-${nanoid(8)}.${ext}`
  const url = `/uploads/${subDir}/${filename}`
  return { url, filename }
}
