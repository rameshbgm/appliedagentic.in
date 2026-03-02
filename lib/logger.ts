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

const isVerbose = process.env.ENABLE_DEBUG_LOGS === 'true'

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
    // Build the entire formatted block as one string so that a single
    // console.error() call is made. Multiple calls would each trigger
    // Next.js error detection separately, flooding the error overlay.
    const lines: string[] = []
    lines.push(`\n┌─ [ERROR] ${ts}`)
    lines.push(`│  Route  : ${label}`)
    if (err instanceof Error) {
      lines.push(`│  Message: ${err.message}`)
      if (prismaDetail) lines.push(`│  Prisma : ${prismaDetail}`)
      if (err.stack) {
        const stackLines = err.stack.split('\n').slice(1, 6) // top 5 frames
        stackLines.forEach((l) => lines.push(`│  Stack  : ${l.trim()}`))
      }
    } else if (err !== undefined) {
      lines.push(`│  Cause  : ${JSON.stringify(err)}`)
    }
    if (context && Object.keys(context).length > 0) {
      lines.push(`│  Context: ${JSON.stringify(context, null, 2)}`)
    }
    lines.push(`└${'─'.repeat(60)}`)
    console.error(lines.join('\n'))
  } else {
    // Production: single-line, no stack traces exposed
    const cause =
      err instanceof Error
        ? `${err.message}${prismaDetail ? ` | ${prismaDetail}` : ''}`
        : String(err ?? '')
    console.error(`[ERROR] ${ts} ${label}${cause ? ` | ${cause}` : ''}`)
  }
}

export const logger = {
  /** Detailed debug information – only shown in verbose mode */
  debug(msg: string, ...args: unknown[]) {
    if (isVerbose) console.debug(`[DEBUG] ${timestamp()} ${msg}`, ...args)
  },

  /** General informational messages */
  info(msg: string, ...args: unknown[]) {
    if (isVerbose) console.info(`[INFO]  ${timestamp()} ${msg}`, ...args)
  },

  /** Warnings – potential issues that are not yet breaking */
  warn(msg: string, ...args: unknown[]) {
    console.warn(`[WARN]  ${timestamp()} ${msg}`, ...args)
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
