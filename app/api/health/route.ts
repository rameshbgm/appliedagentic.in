// app/api/health/route.ts
// GET /api/health  – liveness + readiness probe
// Returns 200 when everything is healthy, 503 when the DB is unreachable.
// Safe to call from Hostinger monitoring or a browser to diagnose deployments.
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

const isVerbose =
  process.env.NODE_ENV === 'development' ||
  process.env.ENABLE_DEBUG_LOGS === 'true'

export async function GET() {
  const start = Date.now()

  // ── Database probe ────────────────────────────────────────────────────────
  let dbStatus: 'ok' | 'error' = 'error'
  let dbError: string | null = null

  try {
    await prisma.$queryRaw`SELECT 1`
    dbStatus = 'ok'
    logger.debug('[GET /api/health] DB probe OK')
  } catch (err) {
    dbError = err instanceof Error ? err.message : String(err)
    logger.error('[GET /api/health] DB probe FAILED', err)
  }

  const healthy = dbStatus === 'ok'
  const responseTime = Date.now() - start

  const body: Record<string, unknown> = {
    status: healthy ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    responseTimeMs: responseTime,
    database: { status: dbStatus, ...(dbError && isVerbose ? { error: dbError } : {}) },
    // Expose mode info only in verbose mode
    ...(isVerbose
      ? {
          env: {
            NODE_ENV: process.env.NODE_ENV,
            ENABLE_DEBUG_LOGS: process.env.ENABLE_DEBUG_LOGS ?? 'false',
            NEXTAUTH_URL: process.env.NEXTAUTH_URL,
            DATABASE_URL: (process.env.DATABASE_URL ?? '').replace(/:([^:@/]+)@/, ':***@'),
          },
        }
      : {}),
  }

  return NextResponse.json(body, { status: healthy ? 200 : 503 })
}
