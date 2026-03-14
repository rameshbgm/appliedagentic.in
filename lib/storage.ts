// lib/storage.ts
// Pluggable file storage abstraction — currently local disk, swappable for S3/Cloudinary
import fs from 'fs/promises'
import path from 'path'
import { nanoid } from 'nanoid'
import { logger } from '@/lib/logger'

// ─── Upload directory ────────────────────────────────────────────────────────
// Defaults to ./public/uploads (relative to cwd) – served by Next.js at /uploads/...
//
// Hostinger deployment:
//   Files are stored OUTSIDE the deployment folder so they survive redeployments.
//   The app lives in  ~/domains/appliedagentic.in/nodejs/  (wiped on redeploy)
//   Uploads live in   ~/domains/appliedagentic.in/uploads/ (persistent)
//
//   Set in .env.production:
//     UPLOAD_DIR=/home/u915919430/domains/appliedagentic.in/uploads
//
//   Create the folder on the server once via SSH or File Manager:
//     mkdir -p /home/u915919430/domains/appliedagentic.in/uploads
//
//   Files are served by app/uploads/[...path]/route.ts at /uploads/{subDir}/{filename}
//
// The URL stored in the DB is always  /uploads/{subDir}/{filename}
// which maps to  {UPLOAD_DIR}/{subDir}/{filename}  on disk.
// ─────────────────────────────────────────────────────────────────────────────
const UPLOAD_DIR = process.env.UPLOAD_DIR ?? path.join(process.cwd(), 'public', 'uploads')
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

export interface SaveFileOptions {
  buffer: Buffer
  mimeType: string
  subDir?: string // 'images' | 'audio' | 'ai'
}

export interface SaveFileResult {
  url: string
  filename: string
  sizeBytes: number
}

export async function saveFile(opts: SaveFileOptions): Promise<SaveFileResult> {
  const { buffer, mimeType, subDir = 'images' } = opts
  const ext = getExtension(mimeType)
  const filename = `${Date.now()}-${nanoid(8)}.${ext}`
  const dirPath = path.join(UPLOAD_DIR, subDir)

  logger.debug(`[saveFile] UPLOAD_DIR="${UPLOAD_DIR}" resolved dirPath="${dirPath}"`)

  await fs.mkdir(dirPath, { recursive: true })
  const filePath = path.join(dirPath, filename)
  await fs.writeFile(filePath, buffer)

  logger.debug(`[saveFile] written ${buffer.length} bytes → ${filePath}`)

  // URL is always relative to the public root
  const url = `/uploads/${subDir}/${filename}`
  return { url, filename, sizeBytes: buffer.length }
}

export async function deleteFile(url: string): Promise<void> {
  try {
    // url is always /uploads/{subDir}/{filename}
    // Strip the leading /uploads/ prefix to get the relative path within UPLOAD_DIR
    const relative = url.replace(/^\/uploads\//, '')
    const filePath = path.join(UPLOAD_DIR, relative)
    await fs.unlink(filePath)
  } catch {
    // File may not exist or path may differ; fail silently
  }
}
