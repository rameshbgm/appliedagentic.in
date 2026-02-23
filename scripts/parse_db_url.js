// parse_db_url.js
// Outputs: username password host port database
require('dotenv').config({ path: '.env.production' });
const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL not found in .env.production');
  process.exit(1);
}
try {
  const u = new URL(url);
  const user = decodeURIComponent(u.username || '');
  const pass = decodeURIComponent(u.password || '');
  const host = u.hostname;
  const port = u.port || '3306';
  const db = u.pathname.replace(/^\//, '');
  console.log(`${user} ${pass} ${host} ${port} ${db}`);
} catch (err) {
  console.error('Failed to parse DATABASE_URL:', err.message);
  process.exit(2);
}
