// lib/prisma.ts
import { PrismaClient } from '@prisma/client'
import { logger } from '@/lib/logger'

const isVerbose =
  process.env.NODE_ENV === 'development' ||
  process.env.ENABLE_DEBUG_LOGS === 'true'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // In verbose mode log every query; in production log only errors
    log: isVerbose ? ['query', 'info', 'warn', 'error'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// ── Database connection health-check ──────────────────────────────────────────
// Runs once at module load time so if the DB is unreachable you see it
// immediately in the server logs instead of on the first API request.
async function testDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`
    logger.info('[Database] Connection OK')
  } catch (err) {
    // Mask the password in the logged URL so credentials don't appear in logs
    const safeUrl = (process.env.DATABASE_URL ?? '(not set)').replace(
      /:([^:@/]+)@/,
      ':***@'
    )
    logger.error(
      '[Database] Connection FAILED – check DATABASE_URL and that the DB server is running',
      err,
      { DATABASE_URL: safeUrl }
    )
  }
}

// Do not run during build / test phases
if (process.env.NODE_ENV !== 'test' && process.env.NEXT_PHASE !== 'phase-production-build') {
  testDatabaseConnection()
}
