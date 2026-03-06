// app/api/ai/parse-attachment/route.ts
// Server-side parser for binary attachments (PDF, DOCX, XLSX, PPTX, etc.)
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { apiError } from '@/lib/utils'

// ── Allowed & blocked extensions ──────────────────────────────────────────
const ALLOWED_EXTENSIONS = new Set([
  '.pdf',
  '.docx', '.doc',
  '.xlsx', '.xls',
  '.pptx', '.ppt',
  '.txt', '.md', '.mdx', '.csv',
  '.html', '.htm',
  '.json', '.jsonl',
  '.xml',
  '.rtf',
  '.odt', '.ods', '.odp',
  '.log',
  '.yaml', '.yml',
  '.toml', '.ini', '.env',
])

// Dangerous / executable files — always blocked
const BLOCKED_EXTENSIONS = new Set([
  '.exe', '.bat', '.cmd', '.com', '.sh', '.bash', '.zsh', '.fish',
  '.ps1', '.psm1', '.psd1', '.vbs', '.wsf', '.wsh', '.hta',
  '.dll', '.so', '.dylib', '.sys', '.drv',
  '.bin', '.img', '.iso', '.dmg', '.msi', '.deb', '.rpm',
  '.js', '.cjs', '.mjs', '.ts', '.tsx', '.jsx',
  '.py', '.rb', '.php', '.go', '.rs', '.c', '.cpp', '.java',
  '.jar', '.class', '.war', '.ear',
  '.zip', '.rar', '.7z', '.tar', '.gz', '.bz2', '.xz', '.tgz',
  '.apk', '.ipa',
  '.sql', '.db', '.sqlite', '.sqlite3',
])

const MAX_FILE_MB = 20

function getExt(filename: string): string {
  const idx = filename.lastIndexOf('.')
  return idx >= 0 ? filename.slice(idx).toLowerCase() : ''
}

// ── Parsers ────────────────────────────────────────────────────────────────

async function parsePdf(buffer: Buffer): Promise<string> {
  // pdf-parse uses a dynamic require internally; import the underlying module
  // to avoid issues with the default entry point.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require('pdf-parse/lib/pdf-parse.js')
  const data = await pdfParse(buffer)
  return (data.text as string) ?? ''
}

async function parseDocx(buffer: Buffer): Promise<string> {
  const mammoth = await import('mammoth')
  const result = await mammoth.extractRawText({ buffer })
  return result.value ?? ''
}

async function parseXlsx(buffer: Buffer): Promise<string> {
  const XLSX = await import('xlsx')
  const workbook = XLSX.read(buffer, { type: 'buffer' })
  return workbook.SheetNames.map((name) => {
    const sheet = workbook.Sheets[name]
    return `[Sheet: ${name}]\n${XLSX.utils.sheet_to_csv(sheet)}`
  }).join('\n\n')
}

async function parsePptx(buffer: Buffer): Promise<string> {
  // PPTX is a ZIP — extract text nodes from slide XMLs
  const JSZip = (await import('jszip')).default
  const zip = await JSZip.loadAsync(buffer)
  const slideFiles = Object.keys(zip.files)
    .filter((f) => /^ppt\/slides\/slide\d+\.xml$/.test(f))
    .sort((a, b) => {
      const na = parseInt(a.match(/slide(\d+)/)?.[1] ?? '0', 10)
      const nb = parseInt(b.match(/slide(\d+)/)?.[1] ?? '0', 10)
      return na - nb
    })

  const texts: string[] = []
  for (const slideFile of slideFiles) {
    const xml = await zip.files[slideFile].async('string')
    const text = xml
      .replace(/<a:rPr[\s\S]*?\/>/g, '')   // remove run properties
      .replace(/<[^>]+>/g, ' ')             // strip tags
      .replace(/\s+/g, ' ')
      .trim()
    if (text) texts.push(text)
  }
  return texts.join('\n\n')
}

// ── Route handler ──────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return apiError('Unauthorized', 401)

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return apiError('No file provided', 422)

    const ext = getExt(file.name)

    if (BLOCKED_EXTENSIONS.has(ext)) {
      return apiError(
        `Files of type "${ext}" are blocked for security reasons. Please remove this file.`,
        422,
      )
    }

    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return apiError(
        `File type "${ext}" is not supported. Allowed types: PDF, Word, Excel, PowerPoint, TXT, MD, CSV, HTML, JSON, XML, RTF, and plain text formats.`,
        422,
      )
    }

    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      return apiError(`File exceeds ${MAX_FILE_MB} MB limit.`, 422)
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    let text = ''

    switch (ext) {
      case '.pdf':
        text = await parsePdf(buffer)
        break
      case '.docx':
      case '.doc':
        text = await parseDocx(buffer)
        break
      case '.xlsx':
      case '.xls':
        text = await parseXlsx(buffer)
        break
      case '.pptx':
      case '.ppt':
        text = await parsePptx(buffer)
        break
      default:
        text = buffer.toString('utf-8')
    }

    return NextResponse.json({
      success: true,
      fileName: file.name,
      text: text.trim().slice(0, 15000),  // cap per file to keep context manageable
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Parse failed'
    return apiError(`Failed to parse attachment: ${msg}`, 500, err)
  }
}
