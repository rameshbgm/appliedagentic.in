#!/usr/bin/env bash
set -euo pipefail
# Deploy Prisma migrations to Hostinger and run seeder. Uses .env.production.
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "This script will create backups, deploy Prisma migrations, and run the Hostinger seeder."
echo "Ensure .env.production is correct."
read -p "Proceed? (type YES to continue): " CONFIRM
if [ "$CONFIRM" != "YES" ]; then
  echo "Aborted by user."; exit 1
fi

echo "Running backup..."
bash scripts/backup-hostinger.sh

echo "Setting DATABASE_URL from .env.production for Prisma..."
export DATABASE_URL=$(node -e "require('dotenv').config({path:'.env.production'}); console.log(process.env.DATABASE_URL)")

if [ -z "$DATABASE_URL" ]; then
  echo "DATABASE_URL is empty. Aborting." >&2; exit 1
fi

echo "Deploying Prisma migrations..."
npx prisma migrate deploy --schema=./prisma/schema.prisma

echo "Running Hostinger seeder (creates SuperAdmin + Admin)..."
node scripts/seed-hostinger.js

echo "Deployment complete. Verify the site and logins." 
