// check-hostinger-tables.js
// Lists tables in the Hostinger DB (uses .env.production) and reports missing expected tables.
require('dotenv').config({ path: '.env.production' });
const { PrismaClient } = require('@prisma/client');
const { URL } = require('url');

const prisma = new PrismaClient();
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('DATABASE_URL not found in .env.production');
  process.exit(1);
}

function getDbName(urlStr) {
  try {
    const u = new URL(urlStr);
    return u.pathname.replace(/^\//, '');
  } catch (e) {
    return null;
  }
}

const dbName = getDbName(dbUrl);
if (!dbName) {
  console.error('Could not parse database name from DATABASE_URL');
  process.exit(2);
}

const expectedTables = [
  'User', 'Module', 'Topic', 'Article', 'ArticleSection', 'TopicArticle', 'Tag', 'ArticleTag',
  'MediaAsset', 'AIUsageLog', 'SiteSettings', 'NavMenu', 'NavSubMenu', 'SubMenuArticle', '_prisma_migrations'
];

console.log('Checking tables in database:', dbName);

async function runQuery() {
  const q = `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?`;
  const rows = await prisma.$queryRawUnsafe(q, dbName);
  const present = rows.map(r => {
    // row may be object with TABLE_NAME key or array
    if (r && typeof r === 'object') {
      return r.TABLE_NAME || r.table_name || Object.values(r)[0];
    }
    return String(r);
  }).filter(Boolean);

  present.sort();
  console.log('\nFound tables (' + present.length + '):');
  present.forEach(t => console.log('- ' + t));

  const missing = expectedTables.filter(e => !present.includes(e));
  if (missing.length === 0) {
    console.log('\nAll expected tables are present.');
  } else {
    console.log('\nMissing expected tables:');
    missing.forEach(m => console.log('- ' + m));
  }
}

runQuery().catch(err => {
  console.error('Query failed:', err.message || err);
  process.exit(3);
}).finally(async () => {
  await prisma.$disconnect();
});
