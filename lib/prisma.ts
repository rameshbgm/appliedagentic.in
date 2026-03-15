// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const isVerbose = process.env.ENABLE_DEBUG_LOGS === 'true'

// Close idle DB connections after 60 s to stay within Hostinger's
// max_connections_per_hour quota (500/hr). Prisma reconnects lazily on the
// next query — callers never notice the brief reconnect.
const IDLE_DISCONNECT_MS = 60_000

// If DATABASE_URL isn't set during build (common in CI or static exports),
// export a lightweight stub that safely returns empty results for read
// operations. This prevents Prisma from throwing `Environment variable not
// found` during prerendering while still allowing the app to build.
//
// NOTE: _prisma is typed as PrismaClient (not `any`) so that TypeScript can
// infer return types of all prisma.xxx.findMany() etc. calls throughout the
// app. The stub is cast via `unknown` — it is never reached at runtime when
// DATABASE_URL is set, and when it IS reached (build-time stub) the returned
// empty arrays / nulls are acceptable no-ops.
let _prisma: PrismaClient

if (!process.env.DATABASE_URL) {
  const noopAsync = async () => null
  const noopArrayAsync = async () => []
  const handler: ProxyHandler<object> = {
    get: () => {
      return new Proxy(() => {}, {
        apply: () => noopAsync,
        get: () => noopArrayAsync,
      })
    },
  }
  // A minimal stub to satisfy imports during build when DATABASE_URL is not set.
  // Methods like `findMany`, `findFirst`, `$queryRaw` will return safe defaults.
  _prisma = new Proxy({}, handler) as unknown as PrismaClient
} else {
  const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
    prismaBase: PrismaClient | undefined
    prismaIdleTimer: ReturnType<typeof setTimeout> | undefined
  }

  if (!globalForPrisma.prismaBase) {
    // Increase connection pool from the default (3) to handle concurrent
    // long-running jobs + polling without connection timeout (P2024).
    const rawUrl = process.env.DATABASE_URL ?? ''
    const dbUrl = rawUrl.includes('connection_limit')
      ? rawUrl
      : `${rawUrl}${rawUrl.includes('?') ? '&' : '?'}connection_limit=10&pool_timeout=60`

    const base = new PrismaClient({
      datasources: { db: { url: dbUrl } },
      log: isVerbose ? ['query', 'info', 'warn', 'error'] : ['error'],
    })

    // Reset the idle watchdog on every model operation.
    function resetIdleTimer() {
      if (globalForPrisma.prismaIdleTimer) clearTimeout(globalForPrisma.prismaIdleTimer)
      globalForPrisma.prismaIdleTimer = setTimeout(() => {
        globalForPrisma.prismaIdleTimer = undefined
        base.$disconnect().catch(() => { /* already disconnected */ })
      }, IDLE_DISCONNECT_MS)
    }

    globalForPrisma.prismaBase = base
    // $extends wraps every model operation; cast back to PrismaClient so the
    // rest of the codebase keeps its typed prisma.xxx.findMany() etc. calls.
    globalForPrisma.prisma = base.$extends({
      query: {
        $allModels: {
          async $allOperations({ args, query }) {
            resetIdleTimer()
            return query(args)
          },
        },
      },
    }) as unknown as PrismaClient
  }

  _prisma = globalForPrisma.prisma!

  // ── Database connection health-check ──────────────────────────────────────────
  async function testDatabaseConnection() {
    // Dynamic import keeps logger.ts out of the Edge Runtime bundle.
    // (proxy.ts → auth.ts → prisma.ts is statically analysed for Edge;
    //  dynamic imports are excluded from that analysis.)
    const { logger } = await import('@/lib/logger')
    try {
      await globalForPrisma.prismaBase!.$queryRaw`SELECT 1`
      logger.info('[Database] Connection OK')
    } catch (err) {
      const safeUrl = (process.env.DATABASE_URL ?? '(not set)').replace(/:([^:@/]+)@/, ':***@')
      logger.error('[Database] Connection FAILED – check DATABASE_URL and that the DB server is running', err, {
        DATABASE_URL: safeUrl,
      })
    }
  }

  if (process.env.NEXT_PHASE !== 'phase-production-build') {
    testDatabaseConnection()
  }
}

// Export the resolved prisma (real client or build-time stub)
export const prisma: PrismaClient = _prisma
