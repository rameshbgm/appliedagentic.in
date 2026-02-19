// lib/storage.ts
// Pluggable file storage abstraction — currently local disk, swappable for S3/Cloudinary
import fs from 'fs/promises'
import path from 'path'
import { nanoid } from 'nanoid'

const UPLOAD_DIR = process.env.UPLOAD_DIR || './public/uploads'
const MAX_SIZE_MB = parseInt(process.env.MAX_UPLOAD_SIZE_MB || '10')

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
  const dirPath = path.join(process.cwd(), UPLOAD_DIR, subDir)

  await fs.mkdir(dirPath, { recursive: true })
  const filePath = path.join(dirPath, filename)
  await fs.writeFile(filePath, buffer)

  // Return URL relative to public/
  const url = `/uploads/${subDir}/${filename}`
  return { url, filename, sizeBytes: buffer.length }
}

export async function deleteFile(url: string): Promise<void> {
  try {
    const filePath = path.join(process.cwd(), 'public', url)
    await fs.unlink(filePath)
  } catch {
    // File may not exist; fail silently
  }
}
