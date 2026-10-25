// Release-specific additive changes. Default mode is read-only; --apply is explicit.
const fs = require('node:fs');
const path = require('node:path');
const { config } = require('dotenv');
const { createPrismaClient } = require('../lib/prisma-client.cjs');

const statements = fs.readFileSync(path.join(__dirname, '../prisma/releases/20261025_transit.sql'), 'utf8')
  .replace(/^--.*$/gm, '').split(';').map((sql) => sql.trim()).filter(Boolean);
const requiredColumns = ['id', 'email', 'token', 'source', 'createdAt', 'unsubscribedAt'];

function planRelease(columns) {
  const settings = new Set(columns.filter((c) => c.tableName === 'SiteSettings').map((c) => c.columnName));
  if (!settings.has('id')) throw new Error('SiteSettings is missing. Check the database target before applying this release.');
  const newsletter = new Set(columns.filter((c) => c.tableName === 'NewsletterSubscriber').map((c) => c.columnName));
  if (newsletter.size && requiredColumns.some((name) => !newsletter.has(name))) {
    throw new Error('NewsletterSubscriber already exists with an incompatible schema. Manual review is required.');
  }
  return [
    !settings.has('siteUrl') && { name: 'SiteSettings.siteUrl', sql: statements[0] },
    !settings.has('showArticleImages') && { name: 'SiteSettings.showArticleImages', sql: statements[1] },
    !newsletter.size && { name: 'NewsletterSubscriber', sql: statements[2] },
  ].filter(Boolean);
}

async function readColumns(db) {
  return db.$queryRaw`SELECT TABLE_NAME AS tableName, COLUMN_NAME AS columnName FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME IN ('SiteSettings', 'NewsletterSubscriber')`;
}

async function main() {
  config({ path: ['.env.local', '.env'], quiet: true });
  if (!process.env.DATABASE_URL && process.argv.includes('--allow-no-database')) {
    console.log('No build-time DATABASE_URL configured; schema check skipped. Run db:check with the deployment environment before release.');
    return;
  }
  const db = createPrismaClient();
  try {
    const plan = planRelease(await readColumns(db));
    if (!plan.length) { console.log('Transit database schema is ready. No changes required.'); return; }
    console.log('Missing release schema:', plan.map((step) => step.name).join(', '));
    if (!process.argv.includes('--apply')) {
      throw new Error('Apply the reviewed additive release with npm run db:deploy using the target environment before deploying this build.');
    }
    // MySQL DDL commits per statement. Re-inspection makes a partially completed
    // run safe to resume. Statements are fixed in the reviewed release SQL file.
    for (const step of plan) {
      await db.$executeRawUnsafe(step.sql);
      console.log('Added', step.name);
    }
    if (planRelease(await readColumns(db)).length) throw new Error('Release schema verification failed.');
    console.log('Transit database schema verified. Existing content and settings were preserved.');
  } finally { await db.$disconnect(); }
}

module.exports = { planRelease };
if (require.main === module) main().catch((error) => { console.error(error.message); process.exitCode = 1; });
