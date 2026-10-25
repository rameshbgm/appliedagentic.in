import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  // Adopt the compiler diagnostics as warnings while the existing UI is migrated.
  { files: ['**/*.{js,mjs,jsx,ts,tsx}'], rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    'react-hooks/immutability': 'warn',
    'react-hooks/set-state-in-effect': 'warn',
    'react-hooks/preserve-manual-memoization': 'warn',
    'react-hooks/refs': 'warn',
    'react-hooks/static-components': 'warn',
  } },
  { files: ['**/*.cjs', 'prisma/seed-prod.js', 'scripts/**/*.js'], rules: { '@typescript-eslint/no-require-imports': 'off', '@next/next/no-assign-module-variable': 'off' } },
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts', 'design-previews/**', 'logs/**']),
])
