// reset-hostinger-schema.js
// Drops all tables in the Hostinger database (uses .env.production) and leaves the DB empty.
// Use with caution — this is destructive.
require('dotenv').config({ path: '.env.production' });
const { PrismaClient } = require('@prisma/client');
const { URL } = require('url');

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('Missing DATABASE_URL in .env.production');
    process.exit(1);
  }
  const dbName = new URL(databaseUrl).pathname.replace(/^\//, '');
  const prisma = new PrismaClient();
  try {
    console.log('Disabling foreign key checks...');
    await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0');

    console.log('Gathering tables to drop from schema:', dbName);
    const tables = await prisma.$queryRawUnsafe(
      'SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?',
      dbName
    );
    const tableNames = tables.map(r => r.TABLE_NAME || r.table_name || Object.values(r)[0]).filter(Boolean);
    if (tableNames.length === 0) {
      console.log('No tables found to drop.');
    } else {
      console.log('Dropping', tableNames.length, 'tables...');
      for (const t of tableNames) {
        console.log('  dropping', t);
        await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS \`${t}\``);
      }
    }

    console.log('Re-enabling foreign key checks...');
    await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1');
    console.log('All tables dropped.');
  } catch (e) {
    console.error('Error while resetting schema:', e.message || e);
    process.exit(2);
  } finally {
    await prisma.$disconnect();
  }
}

main();
