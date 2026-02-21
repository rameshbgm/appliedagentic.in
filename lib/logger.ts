// lib/logger.ts
// Centralised logging utility.
//
// Behaviour is controlled by two environment variables:
//   NODE_ENV          – set automatically by Next.js ('development' | 'production')
//   ENABLE_DEBUG_LOGS – set to "true" to enable verbose debug logs even in production
//                       Useful for diagnosing issues on the live Hostinger server.
//
// Log levels (most → least verbose): debug → info → warn → error
// In development or when ENABLE_DEBUG_LOGS=true → all levels are shown
// In production (without ENABLE_DEBUG_LOGS)      → only warn + error are shown

const isVerbose =
  process.env.NODE_ENV === 'development' ||
  process.env.ENABLE_DEBUG_LOGS === 'true'

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
    console.error(`\n┌─ [ERROR] ${ts}`)
    console.error(`│  Route  : ${label}`)
    if (err instanceof Error) {
      console.error(`│  Message: ${err.message}`)
      if (prismaDetail) console.error(`│  Prisma : ${prismaDetail}`)
      if (err.stack) {
        const stackLines = err.stack.split('\n').slice(1, 6) // top 5 frames
        stackLines.forEach((l) => console.error(`│  Stack  : ${l.trim()}`))
      }
    } else if (err !== undefined) {
      console.error(`│  Cause  :`, err)
    }
    if (context && Object.keys(context).length > 0) {
      console.error(`│  Context:`, JSON.stringify(context, null, 2))
    }
    console.error(`└${'─'.repeat(60)}`)
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
