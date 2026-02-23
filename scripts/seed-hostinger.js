// seed-hostinger.js
// Node script (CommonJS) to upsert SuperAdmin and Admin using .env.production
require('dotenv').config({ path: '.env.production' });
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function upsertUser(email, name, role) {
  const plain = generatePassword();
  const hash = await bcrypt.hash(plain, 12);
  const user = await prisma.user.upsert({
    where: { email },
    update: { name, role, passwordHash: hash },
    create: { email, name, role, passwordHash: hash }
  });
  console.log(`${role}\t| ${email} -> password: ${plain}`);
  return user;
}

function generatePassword() {
  // generate a reasonably strong password
  return 'A' + Math.random().toString(36).slice(2, 10) + '!'+ Math.floor(Math.random()*900+100);
}

async function main(){
  console.log('Seeding Hostinger users (using .env.production)...');
  await upsertUser('superadmin@appliedagentic.com', 'SuperAdmin', 'SUPERADMIN');
  await upsertUser('admin@appliedagentic.com', 'Admin', 'ADMIN');
  console.log('Seeding complete.');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async ()=>{
  await prisma.$disconnect();
});
