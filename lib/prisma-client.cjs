// Shared by Next.js and the CommonJS maintenance scripts. Prisma 7 uses the
// JavaScript MySQL driver, so pool settings now belong to the adapter.
const { PrismaClient, Prisma } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');

/**
 * @param {{ url?: string, log?: import('@prisma/client').Prisma.LogLevel[] }} [options]
 */
function createPrismaClient(options = {}) {
  const rawUrl = options.url || process.env.DATABASE_URL;
  if (!rawUrl) throw new Error('DATABASE_URL is required to connect to MySQL.');
  const url = new URL(rawUrl);
  if (!['mysql:', 'mariadb:'].includes(url.protocol)) throw new Error('DATABASE_URL must be a MySQL connection URL.');
  const adapter = new PrismaMariaDb({
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: decodeURIComponent(url.pathname.slice(1)),
    connectionLimit: Number(url.searchParams.get('connection_limit') || 10),
    acquireTimeout: Number(url.searchParams.get('pool_timeout') || 60) * 1000,
    connectTimeout: Number(url.searchParams.get('connect_timeout') || 10) * 1000,
    idleTimeout: 60,
  });
  return new PrismaClient({ adapter, log: options.log || ['error'] });
}

module.exports = { createPrismaClient, Prisma };
