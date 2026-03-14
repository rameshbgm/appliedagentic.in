// scripts/postbuild.mjs
// Runs automatically after `next build` via the "postbuild" npm script.
// Handles three tasks for Hostinger production deployment:
//   1. Copy /home/.../static-html/ → public_html/ (static HTML pages served by Apache)
//        static-html/ is a persistent folder sibling of nodejs/ — survives redeploys
//   2. Symlink public_html/uploads → persistent uploads folder (survives redeploys)
//   3. Replace public_html/.htaccess with config/production.htaccess from this repo

import fs from 'fs'
import path from 'path'

const DOMAIN_ROOT    = '/home/u915919430/domains/appliedagentic.in'
const PUBLIC_HTML    = path.join(DOMAIN_ROOT, 'public_html')
const UPLOADS_SRC    = path.join(DOMAIN_ROOT, 'uploads')
const UPLOADS_LINK   = path.join(PUBLIC_HTML, 'uploads')
const HTACCESS_DEST  = path.join(PUBLIC_HTML, '.htaccess')
const HTACCESS_BAK   = path.join(PUBLIC_HTML, '.htaccess.bak')
const HTACCESS_SRC   = path.join(process.cwd(), 'config', 'production.htaccess')
const STATIC_HTML    = path.join(DOMAIN_ROOT, 'static-html')

const isHostinger = fs.existsSync(PUBLIC_HTML)

// ── Helper: list directory contents ────────────────────────────────────────
function ls(dir, label) {
  const tag = label ?? dir
  if (!fs.existsSync(dir)) {
    console.log(`[postbuild] ls ${tag}: (directory does not exist)`)
    return
  }
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    if (entries.length === 0) {
      console.log(`[postbuild] ls ${tag}: (empty)`)
    } else {
      console.log(`[postbuild] ls ${tag}:`)
      for (const e of entries) {
        const type = e.isSymbolicLink() ? '-> (symlink)' : e.isDirectory() ? '/' : ''
        console.log(`[postbuild]   ${e.name}${type}`)
      }
    }
  } catch (err) {
    console.log(`[postbuild] ls ${tag}: ERROR — ${err.message}`)
  }
}

console.log('[postbuild] ════════════════════════════════════════')
console.log('[postbuild] Starting...')
console.log(`[postbuild] pwd (CWD):      ${process.cwd()}`)
console.log(`[postbuild] DOMAIN_ROOT:    ${DOMAIN_ROOT}`)
console.log(`[postbuild] PUBLIC_HTML:    ${PUBLIC_HTML}`)
console.log(`[postbuild] UPLOADS_SRC:    ${UPLOADS_SRC}`)
console.log(`[postbuild] STATIC_HTML:    ${STATIC_HTML}`)
console.log(`[postbuild] HTACCESS_SRC:   ${HTACCESS_SRC}`)
console.log(`[postbuild] Hostinger environment: ${isHostinger ? 'YES' : 'NO (skipping server tasks)'}`)
console.log('[postbuild] ════════════════════════════════════════')

// ── 1. Copy static-html → public_html ──────────────────────────────────────
console.log('[postbuild] ── Task 1: static-html copy ──')
console.log(`[postbuild] source: ${STATIC_HTML}`)
ls(STATIC_HTML, 'static-html (source) BEFORE')

if (!fs.existsSync(STATIC_HTML)) {
  console.log('[postbuild] static-html folder not found — skipping copy')
} else {
  const files = fs.readdirSync(STATIC_HTML).filter(f => f !== '.gitkeep')
  if (files.length === 0) {
    console.log('[postbuild] static-html is empty — skipping copy')
  } else if (!isHostinger) {
    console.log('[postbuild] Not on Hostinger — skipping static-html copy')
  } else {
    console.log(`[postbuild] Copying ${files.length} file(s) → ${PUBLIC_HTML}`)
    ls(PUBLIC_HTML, 'public_html BEFORE copy')
    fs.mkdirSync(PUBLIC_HTML, { recursive: true })
    for (const file of files) {
      const src  = path.join(STATIC_HTML, file)
      const dest = path.join(PUBLIC_HTML, file)
      fs.cpSync(src, dest, { recursive: true })
      console.log(`[postbuild]   copied ${file}`)
    }
    ls(PUBLIC_HTML, 'public_html AFTER copy')
    console.log('[postbuild] static-html copy done.')
  }
}

// ── 2. Symlink public_html/uploads → persistent uploads folder ─────────────
console.log('[postbuild] ── Task 2: uploads symlink ──')
console.log(`[postbuild] symlink: ${UPLOADS_LINK} → ${UPLOADS_SRC}`)
ls(UPLOADS_SRC, 'uploads source BEFORE')

if (!isHostinger) {
  console.log('[postbuild] Not on Hostinger — skipping uploads symlink')
} else if (!fs.existsSync(UPLOADS_SRC)) {
  console.log(`[postbuild] WARNING: uploads source folder not found: ${UPLOADS_SRC}`)
  console.log('[postbuild]   Create it manually: mkdir -p ' + UPLOADS_SRC)
} else {
  try {
    // Remove existing symlink or file at the link path (not the target)
    if (fs.existsSync(UPLOADS_LINK) || fs.lstatSync(UPLOADS_LINK).isSymbolicLink?.()) {
      console.log(`[postbuild] Removing existing entry at ${UPLOADS_LINK}`)
      fs.rmSync(UPLOADS_LINK, { force: true })
    }
  } catch { /* doesn't exist yet, that's fine */ }

  try {
    fs.symlinkSync(UPLOADS_SRC, UPLOADS_LINK)
    console.log(`[postbuild] Symlink created: ${UPLOADS_LINK} → ${UPLOADS_SRC}`)
  } catch (err) {
    console.log(`[postbuild] WARNING: symlink failed — ${err.message}`)
  }

  ls(PUBLIC_HTML, 'public_html AFTER symlink')
}

// ── 3. Deploy config/production.htaccess → public_html/.htaccess ───────────
console.log('[postbuild] ── Task 3: .htaccess deploy ──')
console.log(`[postbuild] source: ${HTACCESS_SRC}`)
console.log(`[postbuild] dest:   ${HTACCESS_DEST}`)

if (!isHostinger) {
  console.log('[postbuild] Not on Hostinger — skipping .htaccess deploy')
} else if (!fs.existsSync(HTACCESS_SRC)) {
  console.log(`[postbuild] WARNING: config/production.htaccess not found at ${HTACCESS_SRC}`)
} else {
  // Back up existing .htaccess before replacing
  if (fs.existsSync(HTACCESS_DEST)) {
    fs.copyFileSync(HTACCESS_DEST, HTACCESS_BAK)
    console.log(`[postbuild] Backed up existing .htaccess → .htaccess.bak`)
  }
  fs.copyFileSync(HTACCESS_SRC, HTACCESS_DEST)
  console.log(`[postbuild] .htaccess deployed from config/production.htaccess`)
  ls(PUBLIC_HTML, 'public_html AFTER .htaccess deploy')
}

console.log('[postbuild] ════════════════════════════════════════')
console.log('[postbuild] All done.')
console.log('[postbuild] ════════════════════════════════════════')
