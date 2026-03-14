// scripts/postbuild.mjs
// Runs automatically after `next build` via the "postbuild" npm script.
// Handles three tasks for Hostinger production deployment:
//   1. Copy ./static-html/ → public_html/  (static HTML pages served by Apache)
//   2. Symlink public_html/uploads → persistent uploads folder (survives redeploys)
//   3. Deploy config/production.htaccess → public_html/.htaccess
//      (backs up existing .htaccess to .htaccess.bak first)

import fs from 'fs'
import path from 'path'

const PUBLIC_HTML    = '/home/u915919430/domains/appliedagentic.in/public_html'
const UPLOADS_SRC    = '/home/u915919430/domains/appliedagentic.in/uploads'
const UPLOADS_LINK   = path.join(PUBLIC_HTML, 'uploads')
const HTACCESS_SRC   = path.join(process.cwd(), 'config', 'production.htaccess')
const HTACCESS_DEST  = path.join(PUBLIC_HTML, '.htaccess')
const HTACCESS_BAK   = path.join(PUBLIC_HTML, '.htaccess.bak')
const STATIC_HTML    = path.join(process.cwd(), 'static-html')

const isHostinger = fs.existsSync(PUBLIC_HTML)

console.log('[postbuild] Starting...')
console.log(`[postbuild] CWD: ${process.cwd()}`)
console.log(`[postbuild] Hostinger environment: ${isHostinger ? 'YES' : 'NO (skipping server tasks)'}`)

// ── 1. Copy static-html → public_html ──────────────────────────────────────
if (fs.existsSync(STATIC_HTML)) {
  const files = fs.readdirSync(STATIC_HTML).filter(f => f !== '.gitkeep')
  if (files.length === 0) {
    console.log('[postbuild] static-html is empty — skipping copy')
  } else if (!isHostinger) {
    console.log('[postbuild] Not on Hostinger — skipping static-html copy')
  } else {
    console.log(`[postbuild] Copying static-html (${files.length} file(s)) → ${PUBLIC_HTML}`)
    fs.mkdirSync(PUBLIC_HTML, { recursive: true })
    for (const file of files) {
      const src  = path.join(STATIC_HTML, file)
      const dest = path.join(PUBLIC_HTML, file)
      fs.cpSync(src, dest, { recursive: true })
      console.log(`[postbuild]   copied ${file}`)
    }
    console.log('[postbuild] static-html copy done.')
  }
} else {
  console.log('[postbuild] static-html folder not found — skipping copy')
}

// ── 2. Symlink public_html/uploads → persistent uploads folder ─────────────
if (!isHostinger) {
  console.log('[postbuild] Not on Hostinger — skipping uploads symlink')
} else if (!fs.existsSync(UPLOADS_SRC)) {
  console.log(`[postbuild] WARNING: uploads source folder not found: ${UPLOADS_SRC}`)
  console.log('[postbuild]   Create it manually: mkdir -p ' + UPLOADS_SRC)
} else {
  try {
    // Remove existing symlink or directory at the link path (not the target)
    try { fs.rmSync(UPLOADS_LINK, { force: true, recursive: false }) } catch { /* ok */ }
    fs.symlinkSync(UPLOADS_SRC, UPLOADS_LINK)
    console.log(`[postbuild] Uploads symlink: ${UPLOADS_LINK} → ${UPLOADS_SRC}`)
  } catch (err) {
    console.log(`[postbuild] WARNING: symlink failed — ${err.message}`)
  }
}

// ── 3. Deploy config/production.htaccess → public_html/.htaccess ───────────
if (!isHostinger) {
  console.log('[postbuild] Not on Hostinger — skipping .htaccess deploy')
} else if (!fs.existsSync(HTACCESS_SRC)) {
  console.log(`[postbuild] WARNING: config/production.htaccess not found — skipping`)
} else {
  // Backup existing .htaccess → .htaccess.bak
  if (fs.existsSync(HTACCESS_DEST)) {
    fs.copyFileSync(HTACCESS_DEST, HTACCESS_BAK)
    console.log(`[postbuild] Backed up existing .htaccess → .htaccess.bak`)
  }
  // Copy project .htaccess into place
  fs.copyFileSync(HTACCESS_SRC, HTACCESS_DEST)
  console.log(`[postbuild] .htaccess deployed from config/production.htaccess`)
}

console.log('[postbuild] All done.')
