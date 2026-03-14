#!/usr/bin/env node
// scripts/migrate-files-to-db.mjs
// One-time migration: reads existing files from disk and writes their binary
// data into the MediaAsset.data column.

import { PrismaClient } from '@prisma/client'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const UPLOAD_DIR = process.env.UPLOAD_DIR ?? path.join(__dirname, '..', 'public', 'uploads')

const prisma = new PrismaClient()

async function main() {
  console.log('Starting file-to-DB migration...')
  console.log('UPLOAD_DIR:', UPLOAD_DIR)

  const assets = await prisma.mediaAsset.findMany({
    where: { data: null },
    select: { id: true, url: true, filename: true, mimeType: true },
  })

  console.log(`Found ${assets.length} assets without data in DB`)

  let migrated = 0
  let failed = 0

  for (const asset of assets) {
    const relative = asset.url.replace(/^\/uploads\//, '')
    const filePath = path.join(UPLOAD_DIR, relative)

    try {
      const buffer = await fs.readFile(filePath)
      await prisma.mediaAsset.update({
        where: { id: asset.id },
        data: { data: buffer, sizeBytes: buffer.length },
      })
      console.log(`  ✓ migrated [${asset.id}] ${asset.filename} (${buffer.length} bytes)`)
      migrated++
    } catch (err) {
      console.warn(`  ✗ failed  [${asset.id}] ${asset.filename}: ${err.message}`)
      failed++
    }
  }

  console.log(`\nDone. Migrated: ${migrated}, Failed: ${failed}`)
}

main()
  .catch((err) => { console.error(err); process.exit(1) })
  .finally(() => prisma.$disconnect())
