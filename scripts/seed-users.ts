/**
 * scripts/seed-users.ts
 *
 * Creates (or resets) the two system accounts in the DB.
 * Passwords are bcrypt-hashed at cost 12.
 *
 * Run:
 *   set -a && source ./.env.local && set +a
 *   npx ts-node --transpile-only scripts/seed-users.ts
 */
import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'
import 'dotenv/config'

const prisma = new PrismaClient()

const SALT_ROUNDS = 12

interface AccountSpec {
  name: string
  email: string
  password: string
  role: Role
}

const accounts: AccountSpec[] = [
  {
    name: 'Super Admin',
    email: 'superadmin@appliedagentic.com',
    password: 'SuperAdmin@2026!',
    role: Role.SUPERADMIN,
  },
  {
    name: 'Admin User',
    email: 'admin@appliedagentic.com',
    password: 'Admin@2026!',
    role: Role.ADMIN,
  },
]

async function main() {
  console.log('🔐  Seeding user accounts…\n')

  for (const account of accounts) {
    const passwordHash = await bcrypt.hash(account.password, SALT_ROUNDS)

    const user = await prisma.user.upsert({
      where: { email: account.email },
      update: {
        name: account.name,
        passwordHash,
        role: account.role,
      },
      create: {
        name: account.name,
        email: account.email,
        passwordHash,
        role: account.role,
      },
    })

    console.log(`  ✅  ${user.role.padEnd(12)} │ ${user.email}`)
    console.log(`             │ password: ${account.password}\n`)
  }

  console.log('Done. Store these passwords somewhere safe — they are not kept in the codebase.')
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
