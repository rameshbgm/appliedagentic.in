#!/usr/bin/env node
// prisma/seed-prod.js
// Idempotent JS seed for production: creates an admin user and site settings.

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

async function main() {
  const prisma = new PrismaClient()
  try {
    console.log('🌱 Running production JS seed...')

    const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@appliedagentic.com'
    const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@123'

    const passwordHash = await bcrypt.hash(adminPassword, 12)

    const user = await prisma.user.upsert({
      where: { email: adminEmail },
      update: { passwordHash },
      create: {
        email: adminEmail,
        passwordHash,
        name: 'Admin User',
        role: 'ADMIN',
      },
    })
    console.log(`✅ Upserted admin user: ${user.email}`)

    await prisma.siteSettings.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        siteName: process.env.SITE_NAME || 'Applied Agentic AI',
        tagline: process.env.SITE_TAGLINE || 'Applied Agentic AI',
        metaDescription: process.env.SITE_META_DESCRIPTION || 'Applied Agentic AI site',
        footerText: process.env.SITE_FOOTER_TEXT || '© 2026 Applied Agentic AI',
      },
    })
    console.log('✅ Upserted site settings')

    console.log('✅ Seed complete')
  } catch (err) {
    console.error('Seed error:', err)
    process.exitCode = 1
  } finally {
    try { await require('@prisma/client').PrismaClient.prototype.$disconnect.call(new PrismaClient()) } catch (e) {}
  }
}

if (require.main === module) main()
