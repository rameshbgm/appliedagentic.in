const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const dotenv = require('dotenv');

function run(command, args, env = process.env) {
  const result = spawnSync(command, args, { stdio: 'inherit', env });
  if (result.error || result.status !== 0) throw new Error(`${command} failed. ${result.error?.message || ''}`);
}
async function main() {
  if (!fs.existsSync('.env.local')) throw new Error('Create .env.local from .env.example before setting up the local app.');
  const env = { ...process.env, ...dotenv.parse(fs.readFileSync('.env.local')) };
  if (!['localhost', '127.0.0.1', '[::1]'].includes(new URL(env.DATABASE_URL).hostname)) throw new Error('dev:setup only runs against localhost.');
  if (spawnSync('docker', ['info'], { stdio: 'ignore' }).status !== 0) {
    if (process.platform !== 'darwin') throw new Error('Start Docker and run npm run dev:setup again.');
    run('open', ['-a', 'Docker']);
    let ready = false;
    for (let i = 0; i < 45; i++) {
      if (spawnSync('docker', ['info'], { stdio: 'ignore' }).status === 0) { ready = true; break; }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    if (!ready) throw new Error('Docker is still starting. Run npm run dev:setup again once it is ready.');
  }
  run('docker', ['compose', '--env-file', '.env.local', 'up', '-d', '--wait', 'mysql']);
  run('npx', ['prisma', 'db', 'push'], env);
  // Prisma 7 no longer generates the client as part of db push.
  run('npx', ['prisma', 'generate'], env);
  if (process.argv.includes('--copy-content')) run('node', ['scripts/sync-local.cjs'], env);
  run('node', ['prisma/seed-prod.js'], env);
  console.log('Local database and admin are ready. Start the application with npm run dev.');
}
main().catch((err) => { console.error(err.message); process.exitCode = 1; });
