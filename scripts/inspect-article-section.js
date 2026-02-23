require('dotenv').config({ path: '.env.production' });
const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  try {
    const rows = await prisma.$queryRawUnsafe(
      'SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?',
      process.env.DATABASE_URL ? new URL(process.env.DATABASE_URL).pathname.replace(/^\//, '') : process.env.DATABASE_NAME,
      'ArticleSection'
    );
    console.log('ArticleSection columns on Hostinger:');
    console.log(rows);
  } catch (e) {
    console.error('Error:', e.message || e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
