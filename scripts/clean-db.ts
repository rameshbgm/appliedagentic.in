import { PrismaClient } from '@prisma/client'
// load environment variables from .env automatically
import 'dotenv/config'

const prisma = new PrismaClient()

async function main() {
  console.log('⚠️  Database cleanup: keeping only `User` records')

  // Fetch all base tables in the current database
  const rows: Array<{ TABLE_NAME: string }> = await prisma.$queryRawUnsafe(
    "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_TYPE='BASE TABLE'"
  )

  const allTables = rows.map(r => r.TABLE_NAME)
  const keepLower = new Set(['user', 'users'])
  const skipLower = new Set(['prisma_migrations', '_prisma_migrations'])

  console.log('Found tables:', allTables.join(', '))

  // Disable foreign key checks for truncation (MySQL)
  await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS=0;')

  for (const t of allTables) {
    const tl = t.toLowerCase()
    if (keepLower.has(tl) || skipLower.has(tl)) {
      console.log(`- Skipping table: ${t}`)
      continue
    }

    try {
      console.log(`- Truncating table: ${t}`)
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE \`${t}\`;`)
    } catch (err) {
      console.error(`  Failed to truncate ${t}:`, err)
      // Attempt delete as fallback
      try {
        console.log(`  Attempting DELETE FROM ${t} as fallback`)
        await prisma.$executeRawUnsafe(`DELETE FROM \`${t}\`;`)
      } catch (err2) {
        console.error(`  DELETE failed for ${t}:`, err2)
      }
    }
  }

  // Re-enable foreign key checks
  await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS=1;')

  console.log('✅ Database cleanup complete. Only `User` table remains populated.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
