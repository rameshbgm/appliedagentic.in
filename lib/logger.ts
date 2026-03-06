// lib/logger.ts
// Centralised logging utility — date-based log files under ./logs/YYYY-MM-DD/
//
// Log files written relative to process.cwd():
//   logs/YYYY-MM-DD/app.log    — full audit trail (all log output)
//   logs/YYYY-MM-DD/ai.log     — AI agent calls (model, tokens, latency, prompt)
//   logs/YYYY-MM-DD/api.log    — Admin API request/response logs
//   logs/YYYY-MM-DD/error.log  — All errors (public + admin)
//
// Verbosity controlled by ENABLE_DEBUG_LOGS=true (default: only warn+error).

const isVerbose = process.env.ENABLE_DEBUG_LOGS === 'true'

// ── Internal helpers ──────────────────────────────────────────────────────────

function todayDir(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function timestamp(): string {
  return new Date().toISOString()
}

/** Write a line to a specific category log file (server-side only).
 *  All categories also mirror to app.log as a full audit trail. */
function writeToFile(category: 'app' | 'ai' | 'api' | 'error', line: string) {
  if (typeof window !== 'undefined') return           // never write in browser
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs   = require('fs')   as typeof import('fs')
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require('path') as typeof import('path')

    const dateDir = path.join(process.cwd(), 'logs', todayDir())
    if (!fs.existsSync(dateDir)) fs.mkdirSync(dateDir, { recursive: true })

    fs.appendFileSync(path.join(dateDir, `${category}.log`), line + '\n', 'utf8')

    // Mirror everything to the full audit trail (skip double-write for app itself)
    if (category !== 'app') {
      fs.appendFileSync(path.join(dateDir, 'app.log'), line + '\n', 'utf8')
    }
  } catch { /* filesystem not writable — console output always available */ }
}

function formatPrismaError(err: unknown): string {
  if (err && typeof err === 'object') {
    const e = err as Record<string, unknown>
    if (e.code || e.meta) {
      return `PrismaError code=${e.code ?? 'n/a'} meta=${JSON.stringify(e.meta ?? {})}`
    }
  }
  return ''
}

function buildErrorBlock(label: string, err?: unknown, context?: Record<string, unknown>): string {
  const ts = timestamp()
  const prismaDetail = err ? formatPrismaError(err) : ''

  if (isVerbose) {
    const lines: string[] = []
    lines.push(`\n┌─ [ERROR] ${ts}`)
    lines.push(`│  Route  : ${label}`)
    if (err instanceof Error) {
      lines.push(`│  Message: ${err.message}`)
      if (prismaDetail) lines.push(`│  Prisma : ${prismaDetail}`)
      if (err.stack) {
        err.stack.split('\n').slice(1, 6).forEach((l) => lines.push(`│  Stack  : ${l.trim()}`))
      }
    } else if (err !== undefined) {
      lines.push(`│  Cause  : ${JSON.stringify(err)}`)
    }
    if (context && Object.keys(context).length > 0) {
      lines.push(`│  Context: ${JSON.stringify(context, null, 2)}`)
    }
    lines.push(`└${'─'.repeat(60)}`)
    return lines.join('\n')
  }

  const cause =
    err instanceof Error
      ? `${err.message}${prismaDetail ? ` | ${prismaDetail}` : ''}`
      : String(err ?? '')
  return `[ERROR] ${ts} ${label}${cause ? ` | ${cause}` : ''}`
}

// ── Public API ────────────────────────────────────────────────────────────────

export const logger = {

  // ── Standard levels ────────────────────────────────────────────────────────

  /** Verbose debug — only shown/written when ENABLE_DEBUG_LOGS=true */
  debug(msg: string, ...args: unknown[]) {
    if (!isVerbose) return
    const line = `[DEBUG] ${timestamp()} ${msg}${args.length ? ' ' + JSON.stringify(args) : ''}`
    console.debug(line)
    writeToFile('app', line)
  },

  /** General informational messages */
  info(msg: string, ...args: unknown[]) {
    if (!isVerbose) return
    const line = `[INFO]  ${timestamp()} ${msg}${args.length ? ' ' + JSON.stringify(args) : ''}`
    console.info(line)
    writeToFile('app', line)
  },

  /** Warnings — always shown/written */
  warn(msg: string, ...args: unknown[]) {
    const line = `[WARN]  ${timestamp()} ${msg}${args.length ? ' ' + JSON.stringify(args) : ''}`
    console.warn(line)
    writeToFile('app', line)
  },

  /**
   * Error — always written to error.log and app.log.
   * @param label   Descriptive label  e.g. "[GET /api/articles]"
   * @param err     The caught error (optional)
   * @param context Extra key/value pairs (optional)
   */
  error(label: string, err?: unknown, context?: Record<string, unknown>) {
    const block = buildErrorBlock(label, err, context)
    console.error(block)
    writeToFile('error', block)   // also mirrors to app.log
  },

  // ── Domain-specific helpers ────────────────────────────────────────────────

  /**
   * Log an AI agent call → logs/YYYY-MM-DD/ai.log (and app.log).
   *
   * @param agent      Agent name  e.g. "content-writer"
   * @param model      Model used  e.g. "gpt-4o"
   * @param promptSnip First ~120 chars of the prompt for traceability
   * @param tokens     Optional token usage { input?, output? }
   * @param latencyMs  Wall-clock time in milliseconds
   * @param status     "success" | "error"  (default "success")
   */
  ai(
    agent: string,
    model: string,
    promptSnip: string,
    tokens?: { input?: number; output?: number },
    latencyMs?: number,
    status: 'success' | 'error' = 'success',
  ) {
    const parts: string[] = [
      `[AI]    ${timestamp()}`,
      `agent=${agent}`,
      `model=${model}`,
      `status=${status}`,
    ]
    if (tokens?.input  !== undefined) parts.push(`in=${tokens.input}`)
    if (tokens?.output !== undefined) parts.push(`out=${tokens.output}`)
    if (latencyMs !== undefined) parts.push(`ms=${latencyMs}`)
    parts.push(`prompt="${promptSnip.replace(/\n/g, ' ').slice(0, 120)}"`)

    const line = parts.join(' | ')
    console.info(line)
    writeToFile('ai', line)
  },

  /**
   * Log an Admin API request → logs/YYYY-MM-DD/api.log (and app.log).
   *
   * @param method     HTTP method  e.g. "POST"
   * @param route      Route label  e.g. "/api/admin/articles"
   * @param statusCode HTTP response status code
   * @param latencyMs  Wall-clock handling time in milliseconds
   * @param extra      Optional extra key/value context
   */
  api(
    method: string,
    route: string,
    statusCode: number,
    latencyMs?: number,
    extra?: Record<string, unknown>,
  ) {
    const parts: string[] = [
      `[API]   ${timestamp()}`,
      `${method.toUpperCase()} ${route}`,
      `status=${statusCode}`,
    ]
    if (latencyMs !== undefined) parts.push(`ms=${latencyMs}`)
    if (extra && Object.keys(extra).length > 0) parts.push(JSON.stringify(extra))

    const line = parts.join(' | ')
    console.info(line)
    writeToFile('api', line)
  },
}

export default logger
