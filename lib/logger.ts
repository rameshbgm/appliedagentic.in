// lib/logger.ts
// Centralised logging utility.
//
// Behaviour is controlled by one environment variable:
//   ENABLE_DEBUG_LOGS – set to "true" to enable verbose debug/info logs.
//                       Unset or "false" → only warn + error are shown.
//
// Log levels (most → least verbose): debug → info → warn → error
// When ENABLE_DEBUG_LOGS=true → all levels are shown
// Default (unset / false)     → only warn + error are shown
//
// Log files (relative to process.cwd()):
//   ./logs/app.log   – all log levels
//   ./logs/error.log – errors only

const isVerbose = process.env.ENABLE_DEBUG_LOGS === 'true'

// ── File logging setup ────────────────────────────────────────────────────────
// fs/path are required lazily (not imported statically) so that the module can
// be safely imported in client-side bundles without triggering a build error.
// The guard `typeof window === 'undefined'` ensures writes only happen in Node.

function writeToFile(filename: string, line: string) {
  if (typeof window !== 'undefined') return          // browser — skip
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs   = require('fs')   as typeof import('fs')
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require('path') as typeof import('path')
    const logDir = path.join(process.cwd(), 'logs')
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true })
    fs.appendFileSync(path.join(logDir, filename), line + '\n', 'utf8')
  } catch { /* not writable — console output is always available */ }
}

function timestamp(): string {
  return new Date().toISOString()
}

function formatPrismaError(err: unknown): string {
  if (err && typeof err === 'object') {
    const e = err as Record<string, unknown>
    // Prisma error code + meta
    if (e.code || e.meta) {
      return `PrismaError code=${e.code ?? 'n/a'} meta=${JSON.stringify(e.meta ?? {})}`
    }
  }
  return ''
}

function printError(label: string, err?: unknown, context?: Record<string, unknown>) {
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
        const stackLines = err.stack.split('\n').slice(1, 6)
        stackLines.forEach((l) => lines.push(`│  Stack  : ${l.trim()}`))
      }
    } else if (err !== undefined) {
      lines.push(`│  Cause  : ${JSON.stringify(err)}`)
    }
    if (context && Object.keys(context).length > 0) {
      lines.push(`│  Context: ${JSON.stringify(context, null, 2)}`)
    }
    lines.push(`└${'─'.repeat(60)}`)
    const block = lines.join('\n')
    console.error(block)
    writeToFile('app.log', block)
    writeToFile('error.log', block)
  } else {
    const cause =
      err instanceof Error
        ? `${err.message}${prismaDetail ? ` | ${prismaDetail}` : ''}`
        : String(err ?? '')
    const line = `[ERROR] ${ts} ${label}${cause ? ` | ${cause}` : ''}`
    console.error(line)
    writeToFile('app.log', line)
    writeToFile('error.log', line)
  }
}

export const logger = {
  /** Detailed debug information – only shown in verbose mode */
  debug(msg: string, ...args: unknown[]) {
    if (!isVerbose) return
    const line = `[DEBUG] ${timestamp()} ${msg} ${args.length ? JSON.stringify(args) : ''}`.trimEnd()
    console.debug(line)
    writeToFile('app.log', line)
  },

  /** General informational messages */
  info(msg: string, ...args: unknown[]) {
    if (!isVerbose) return
    const line = `[INFO]  ${timestamp()} ${msg} ${args.length ? JSON.stringify(args) : ''}`.trimEnd()
    console.info(line)
    writeToFile('app.log', line)
  },

  /** Warnings – potential issues that are not yet breaking */
  warn(msg: string, ...args: unknown[]) {
    const line = `[WARN]  ${timestamp()} ${msg} ${args.length ? JSON.stringify(args) : ''}`.trimEnd()
    console.warn(line)
    writeToFile('app.log', line)
  },

  /**
   * Error with optional original error object and context map.
   * Always logged. In verbose mode includes stack trace + Prisma details.
   *
   * @param label   – descriptive label e.g. "[GET /api/articles]"
   * @param err     – the caught error (optional)
   * @param context – extra key/value pairs to include in the log (optional)
   */
  error(label: string, err?: unknown, context?: Record<string, unknown>) {
    printError(label, err, context)
  },
}

export default logger
