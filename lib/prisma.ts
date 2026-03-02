// lib/prisma.ts
import { PrismaClient } from '@prisma/client'
import { logger } from '@/lib/logger'

const isVerbose =
  process.env.NODE_ENV === 'development' ||
  process.env.ENABLE_DEBUG_LOGS === 'true'

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
  }

  _prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
      // In verbose mode log every query; in production log only errors
      log: isVerbose ? ['query', 'info', 'warn', 'error'] : ['error'],
    })

  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = _prisma

  // ── Database connection health-check ──────────────────────────────────────────
  async function testDatabaseConnection() {
    try {
      await _prisma.$queryRaw`SELECT 1`
      logger.info('[Database] Connection OK')
    } catch (err) {
      const safeUrl = (process.env.DATABASE_URL ?? '(not set)').replace(/:([^:@/]+)@/, ':***@')
      logger.error('[Database] Connection FAILED – check DATABASE_URL and that the DB server is running', err, {
        DATABASE_URL: safeUrl,
      })
    }
  }

  if (process.env.NODE_ENV !== 'test' && process.env.NEXT_PHASE !== 'phase-production-build') {
    testDatabaseConnection()
  }
}

// Export the resolved prisma (real client or build-time stub)
export const prisma: PrismaClient = _prisma
