// scripts/query-hostinger.js
require('dotenv').config({ path: '.env.production' })
const { PrismaClient } = require('@prisma/client')
;(async () => {
  const prisma = new PrismaClient()
  try {
    const users = await prisma.user.findMany({ select: { id: true, email: true, role: true, createdAt: true }, take: 50 })
    console.log('USERS:')
    console.log(JSON.stringify(users, null, 2))

    const articleCount = await prisma.article.count()
    console.log('\nARTICLE_COUNT:', articleCount)

    const recent = await prisma.article.findMany({ select: { id: true, title: true, slug: true, status: true, publishedAt: true }, orderBy: { publishedAt: 'desc' }, take: 10 })
    console.log('\nRECENT_ARTICLES:')
    console.log(JSON.stringify(recent, null, 2))

    const menus = await prisma.navMenu.findMany({ select: { id: true, title: true, slug: true }, take: 20 })
    console.log('\nMENUS:')
    console.log(JSON.stringify(menus, null, 2))
  } catch (e) {
    console.error('ERROR', e)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
})()
