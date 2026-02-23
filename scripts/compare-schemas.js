// compare-schemas.js
// Compares table/column definitions between local (.env.local) and Hostinger (.env.production)
require('dotenv').config({ path: '.env.local' });
const dotenvProd = require('dotenv');
dotenvProd.config({ path: '.env.production' });
const { PrismaClient } = require('@prisma/client');
const { URL } = require('url');

function getDbNameFromUrl(url) {
  try {
    const u = new URL(url);
    return u.pathname.replace(/^\//, '');
  } catch (e) {
    return null;
  }
}

const localUrl = process.env.DATABASE_URL;
const prodUrl = process.env.DATABASE_URL; // overwritten by dotenvProd, so read again
// re-read with explicit load
const localEnv = require('dotenv').config({ path: '.env.local' }).parsed || {};
const prodEnv = dotenvProd.config({ path: '.env.production' }).parsed || {};
const LOCAL_DB = localEnv.DATABASE_URL || process.env.DATABASE_URL;
const PROD_DB = prodEnv.DATABASE_URL || process.env.DATABASE_URL;

if (!LOCAL_DB) { console.error('Missing DATABASE_URL in .env.local'); process.exit(1); }
if (!PROD_DB) { console.error('Missing DATABASE_URL in .env.production'); process.exit(1); }

const localName = getDbNameFromUrl(LOCAL_DB);
const prodName = getDbNameFromUrl(PROD_DB);

const localPrisma = new PrismaClient({ datasources: { db: { url: LOCAL_DB } } });
const prodPrisma = new PrismaClient({ datasources: { db: { url: PROD_DB } } });

async function fetchColumns(prisma, dbName) {
  const q = `SELECT TABLE_NAME, COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_KEY, EXTRA FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ?`;
  const rows = await prisma.$queryRawUnsafe(q, dbName);
  const map = {};
  for (const r of rows) {
    const table = r.TABLE_NAME || r.table_name || Object.values(r)[0];
    if (!map[table]) map[table] = {};
    map[table][r.COLUMN_NAME] = {
      type: r.COLUMN_TYPE,
      nullable: r.IS_NULLABLE,
      default: r.COLUMN_DEFAULT,
      key: r.COLUMN_KEY,
      extra: r.EXTRA
    };
  }
  return map;
}

function diffSchemas(local, prod) {
  const tables = new Set([...Object.keys(local), ...Object.keys(prod)]);
  const diffs = [];
  for (const t of Array.from(tables).sort()) {
    const lcols = local[t] || {};
    const pcols = prod[t] || {};
    const allCols = new Set([...Object.keys(lcols), ...Object.keys(pcols)]);
    const tableDiff = { table: t, missingInLocal: [], missingInProd: [], columnDiffs: [] };
    for (const c of Array.from(allCols).sort()) {
      const l = lcols[c];
      const p = pcols[c];
      if (!l) tableDiff.missingInLocal.push(c);
      else if (!p) tableDiff.missingInProd.push(c);
      else {
        // compare type/nullable/default
        if (l.type !== p.type || l.nullable !== p.nullable || String(l.default) !== String(p.default) || l.key !== p.key || l.extra !== p.extra) {
          tableDiff.columnDiffs.push({ column: c, local: l, prod: p });
        }
      }
    }
    if (tableDiff.missingInLocal.length || tableDiff.missingInProd.length || tableDiff.columnDiffs.length) diffs.push(tableDiff);
  }
  return diffs;
}

(async function main(){
  console.log('Fetching columns from local DB:', localName);
  const localCols = await fetchColumns(localPrisma, localName);
  console.log('Fetching columns from Hostinger DB:', prodName);
  const prodCols = await fetchColumns(prodPrisma, prodName);

  const diffs = diffSchemas(localCols, prodCols);
  if (diffs.length === 0) {
    console.log('\nNo differences found between local and Hostinger schemas.');
  } else {
    console.log('\nSchema differences found:\n');
    for (const d of diffs) {
      console.log('Table:', d.table);
      if (d.missingInLocal.length) console.log('  Missing in local:', d.missingInLocal.join(', '));
      if (d.missingInProd.length) console.log('  Missing in hostinger:', d.missingInProd.join(', '));
      for (const cd of d.columnDiffs) {
        console.log(`  Column diff: ${cd.column}`);
        console.log('    local ->', cd.local);
        console.log('    prod  ->', cd.prod);
      }
      console.log('');
    }
  }
  await localPrisma.$disconnect();
  await prodPrisma.$disconnect();
})().catch(err => {
  console.error('Error comparing schemas:', err.message || err);
  process.exit(1);
});
