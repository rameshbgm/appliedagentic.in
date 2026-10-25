// Copy a read-only content snapshot into an EMPTY local development database.
// The upload route reads media bytes from the source on demand in development.
const fs = require('node:fs');
const dotenv = require('dotenv');
const { createPrismaClient, Prisma } = require('../lib/prisma-client.cjs');

async function main() {
  const local = dotenv.parse(fs.readFileSync('.env.local'));
  const source = dotenv.parse(fs.readFileSync(process.argv[2] || '.env.production'));
  const targetUrl = new URL(local.DATABASE_URL);
  if (!['localhost', '127.0.0.1', '[::1]'].includes(targetUrl.hostname)) throw new Error('The target must be a local database.');
  if (local.DATABASE_URL === source.DATABASE_URL) throw new Error('Source and target must differ.');
  const target = createPrismaClient({ url: local.DATABASE_URL });
  const remote = createPrismaClient({ url: source.DATABASE_URL });
  try {
    const tables = ['user', 'module', 'topic', 'mediaAsset', 'article', 'articleSection', 'topicArticle', 'tag', 'articleTag', 'siteSettings', 'navMenu', 'navSubMenu', 'subMenuArticle', 'menuArticle', 'audioJob'];
    for (const table of tables) {
      if (await target[table].count()) throw new Error(`Local ${table} is not empty. Existing local work has been preserved.`);
    }
    // Fetch metadata only: production contains large narration blobs. Neither
    // credentials nor generated narration are written to the repository.
    const snapshot = [];
    for (const table of tables) {
      const model = Prisma.dmmf.datamodel.models.find((m) => m.name.toLowerCase() === table.toLowerCase());
      const columns = await remote.$queryRaw`SELECT COLUMN_NAME AS name FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ${model.dbName || model.name}`;
      const available = new Set(columns.map((column) => column.name));
      const select = Object.fromEntries(model.fields.filter((f) => f.kind !== 'object' && available.has(f.dbName || f.name) && !(table === 'mediaAsset' && f.name === 'data')).map((f) => [f.name, true]));
      snapshot.push([table, await remote[table].findMany({ select })]);
    }
    await target.$transaction(async (tx) => {
      for (const [table, rows] of snapshot) {
        if (rows.length) await tx[table].createMany({ data: rows });
      }
    }, { timeout: 60_000 });
    for (const [table, rows] of snapshot) console.log(`${table}: ${rows.length}`);
    const envText = fs.readFileSync('.env.local', 'utf8').replace(/^DEV_MEDIA_DATABASE_URL=.*\n?/m, '');
    fs.writeFileSync('.env.local', `${envText.trimEnd()}\nDEV_MEDIA_DATABASE_URL=${JSON.stringify(source.DATABASE_URL)}\n`, { mode: 0o600 });
    console.log('Local content is ready. Restart npm run dev to enable source media streaming. Production was read only.');
  } finally {
    await Promise.all([target.$disconnect(), remote.$disconnect()]);
  }
}
main().catch((error) => { console.error(error.message); process.exitCode = 1; });
