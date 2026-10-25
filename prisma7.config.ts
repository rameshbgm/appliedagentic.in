import { config } from 'dotenv'
import { defineConfig } from 'prisma/config'

// Explicit environment variables (including build:prod) take precedence.
config({ path: ['.env.local', '.env'], quiet: true })

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'node prisma/seed-prod.js',
  },
  datasource: { url: process.env.DATABASE_URL },
})
