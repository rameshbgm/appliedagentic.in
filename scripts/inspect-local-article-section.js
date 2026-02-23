require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { URL } = require('url');

async function main() {
  const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });
  try {
    const dbName = new URL(process.env.DATABASE_URL).pathname.replace(/^\//, '');
    const rows = await prisma.$queryRawUnsafe(
      'SELECT COLUMN_NAME, COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?',
      dbName,
      'ArticleSection'
    );
    console.log('ArticleSection columns on local DB:');
    console.log(rows);
  } catch (e) {
    console.error('Error:', e.message || e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
