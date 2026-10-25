const { rmSync } = require('node:fs');
for (const path of ['.next', 'tsconfig.tsbuildinfo']) {
  rmSync(path, { recursive: true, force: true });
}
console.log('Removed Next.js output and TypeScript build cache.');
