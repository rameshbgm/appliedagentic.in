// lib/storage.ts
// Pluggable file storage abstraction — currently local disk, swappable for S3/Cloudinary
import fs from 'fs/promises'
import path from 'path'
import { nanoid } from 'nanoid'

// ─── Upload directory ────────────────────────────────────────────────────────
// Defaults to ./public/uploads (relative to cwd) – served by Next.js at /uploads/...
//
// Hostinger deployment:
//   The app lives in  ~/domains/appliedagentic.in/nodejs/
//   Web root is       ~/domains/appliedagentic.in/public_html/
//   Apache/LiteSpeed serves public_html directly (before Passenger); uploads
//   stored there are served as fast static files and survive re-deployments.
//
//   Set in .env:
//     UPLOAD_DIR=/home/u915919430/domains/appliedagentic.in/public_html/uploads
//     UPLOAD_URL_PREFIX=          # leave empty — public_html IS the web root
//
// The URL stored in the DB is always  /uploads/{subDir}/{filename}
// which maps to  {UPLOAD_DIR}/{subDir}/{filename}  on disk.
// ─────────────────────────────────────────────────────────────────────────────
const UPLOAD_DIR = process.env.UPLOAD_DIR ?? './public/uploads'
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
  // path.resolve handles both relative (./public/uploads) and absolute paths correctly
  const dirPath = path.resolve(process.cwd(), UPLOAD_DIR, subDir)

  await fs.mkdir(dirPath, { recursive: true })
  const filePath = path.join(dirPath, filename)
  await fs.writeFile(filePath, buffer)

  // URL is always relative to the public root
  const url = `/uploads/${subDir}/${filename}`
  return { url, filename, sizeBytes: buffer.length }
}

export async function deleteFile(url: string): Promise<void> {
  try {
    // url is always /uploads/{subDir}/{filename}
    // Strip the leading /uploads/ prefix to get the relative path within UPLOAD_DIR
    const relative = url.replace(/^\/uploads\//, '')
    const filePath = path.resolve(process.cwd(), UPLOAD_DIR, relative)
    await fs.unlink(filePath)
  } catch {
    // File may not exist or path may differ; fail silently
  }
}
